import { Request, Response } from 'express';
import OpenAI from 'openai';
import sharp from 'sharp';
import { logger } from '../config/logger';
import { trackPhotoAnalysis, trackError } from '../services/analyticsService';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

interface PhotoQualityResult {
  image_index: number;
  is_acceptable: boolean;
  issues: string[];
  warnings: string[];
  brightness: number;
  sharpness: number;
}

interface AnalysisResult {
  title: string;
  description: string;
  suggestedPrice: number;
  category: string;
  condition: string;
  brand?: string;
  model?: string;
  features: string[];
}

interface ConfidenceScores {
  title: number;
  description: number;
  price: number;
  category: number;
  condition: number;
  overall: number;
}

/**
 * Check photo quality (blur, brightness, etc.)
 */
const checkPhotoQuality = async (base64Image: string, index: number): Promise<PhotoQualityResult> => {
  try {
    // Remove data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Use sharp to analyze the image
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const stats = await image.stats();

    const issues: string[] = [];
    const warnings: string[] = [];

    // Check resolution
    if (metadata.width && metadata.height) {
      if (metadata.width < 400 || metadata.height < 400) {
        issues.push('Image resolution too low (minimum 400x400 recommended)');
      } else if (metadata.width < 800 || metadata.height < 800) {
        warnings.push('Higher resolution recommended for better analysis');
      }
    }

    // Estimate brightness (0-255 scale)
    const channelMeans = stats.channels.map((ch) => ch.mean);
    const brightness = channelMeans.reduce((a, b) => a + b, 0) / channelMeans.length;

    // Check brightness
    if (brightness < 30) {
      issues.push('Image too dark - increase lighting or brightness');
    } else if (brightness < 60) {
      warnings.push('Image appears dark - better lighting recommended');
    } else if (brightness > 225) {
      issues.push('Image overexposed - reduce brightness or lighting');
    } else if (brightness > 200) {
      warnings.push('Image appears very bright - check exposure');
    }

    // Estimate sharpness using standard deviation
    const sharpness = stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length;

    // Check sharpness/blur
    if (sharpness < 20) {
      issues.push('Image appears blurry - ensure camera is focused');
    } else if (sharpness < 35) {
      warnings.push('Image may be slightly blurry - try refocusing');
    }

    const is_acceptable = issues.length === 0;

    return {
      image_index: index,
      is_acceptable,
      issues,
      warnings,
      brightness: Math.round(brightness),
      sharpness: Math.round(sharpness),
    };
  } catch (error) {
    logger.error(`Quality check failed for image ${index}:`, error);
    return {
      image_index: index,
      is_acceptable: true, // Don't block on quality check errors
      issues: [],
      warnings: ['Could not perform quality check'],
      brightness: 0,
      sharpness: 0,
    };
  }
};

/**
 * Calculate confidence scores for AI analysis results
 */
const calculateConfidenceScores = (
  productData: AnalysisResult,
  photosAnalyzed: number,
  qualityResults: PhotoQualityResult[]
): ConfidenceScores => {
  let scores = {
    title: 0,
    description: 0,
    price: 0,
    category: 0,
    condition: 0,
    overall: 0,
  };

  // Base confidence on number of photos analyzed
  const photoBonus = Math.min(photosAnalyzed * 15, 45); // Up to +45% for 3+ photos

  // Title confidence
  if (productData.title && productData.title.length > 10) {
    scores.title = 70 + photoBonus;
    if (productData.brand) scores.title += 10;
    if (productData.model) scores.title += 10;
  } else {
    scores.title = 50;
  }

  // Description confidence
  if (productData.description && productData.description.length > 100) {
    scores.description = 65 + photoBonus;
    if (productData.description.includes('•')) scores.description += 5;
    if (productData.features && productData.features.length > 2) scores.description += 10;
  } else {
    scores.description = 45;
  }

  // Price confidence
  if (productData.suggestedPrice > 0) {
    scores.price = 60 + photoBonus;
    if (productData.brand && productData.model) scores.price += 15;
  } else {
    scores.price = 30;
  }

  // Category confidence
  if (productData.category) {
    scores.category = 75 + photoBonus;
    if (productData.brand) scores.category += 10;
  } else {
    scores.category = 50;
  }

  // Condition confidence
  if (productData.condition) {
    scores.condition = 65 + photoBonus;
    // More photos = better condition assessment
    if (photosAnalyzed >= 3) scores.condition += 15;
  } else {
    scores.condition = 50;
  }

  // Reduce confidence based on photo quality issues
  const qualityPenalty = qualityResults.reduce((penalty, qr) => {
    return penalty + (qr.issues.length * 5) + (qr.warnings.length * 2);
  }, 0);

  // Apply quality penalty to all scores
  Object.keys(scores).forEach((key) => {
    if (key !== 'overall') {
      scores[key as keyof typeof scores] = Math.max(0, Math.min(100, scores[key as keyof typeof scores] - qualityPenalty));
    }
  });

  // Calculate overall confidence
  scores.overall = Math.round(
    (scores.title + scores.description + scores.price + scores.category + scores.condition) / 5
  );

  return scores;
};

/**
 * Analyze photo(s) using OpenAI Vision API
 * Now supports multiple photos for better analysis
 */
export const analyzePhoto = async (req: Request, res: Response) => {
  try {
    logger.info('Photo analysis request received');

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      logger.error('OPENAI_API_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'AI service not configured. Please contact administrator.',
        details: 'OpenAI API key is missing from server configuration',
        statusCode: 500
      });
    }

    // Get the image(s) and optional hints from the request
    // Support both single image and multiple images
    const { image, images, hints } = req.body;

    // Convert to array format
    let imageArray: string[] = [];
    if (images && Array.isArray(images)) {
      imageArray = images;
    } else if (image) {
      imageArray = [image];
    }

    if (imageArray.length === 0) {
      logger.error('No images in request body');
      return res.status(400).json({
        success: false,
        error: 'No images provided',
        details: 'Request must include "image" or "images" field with base64 encoded image data',
        statusCode: 400
      });
    }

    logger.info(`Analyzing ${imageArray.length} photo(s)`);

    // Run quality checks on all images in parallel
    const qualityResults = await Promise.all(
      imageArray.map((img, index) => checkPhotoQuality(img, index))
    );

    // Check if any images have critical issues
    const criticalIssues = qualityResults.filter(qr => !qr.is_acceptable);

    // Build prompt based on number of images
    let promptText = `You are an expert at analyzing product photos for online marketplace listings.`;

    if (imageArray.length === 1) {
      promptText += `\n\nAnalyze this product image and extract the following information in JSON format:`;
    } else {
      promptText += `\n\nYou are viewing ${imageArray.length} different photos of the same product from different angles. Use ALL images to get a complete understanding of the product. Analyze ALL these photos together and extract the following information in JSON format:`;
    }

    promptText += `
{
  "title": "Clear, descriptive product title (e.g., 'Logitech MX Master 3 Wireless Mouse - Black')",
  "description": "Professional formatted description with these sections:\\n\\nOverview:\\n[Opening paragraph about the product]\\n\\nItem Details:\\n• Model: [model info]\\n• Capacity/Size: [specs]\\n• Features: [key features as bullet points]\\n• Condition: [detailed condition notes based on ALL photos]\\n\\nWhat's Included:\\n• [item 1]\\n• [item 2]\\n• [item 3]\\n\\nShipping & Pick-up:\\n[Brief shipping/pickup message and call to action]",
  "suggestedPrice": "Estimated fair market price in USD (just the number, e.g., 79.99)",
  "category": "Product category (e.g., 'Electronics', 'Computers & Accessories', 'Home & Garden', etc.)",
  "condition": "Product condition based on visible wear in ALL photos (options: 'new', 'like-new', 'good', 'fair', 'poor')",
  "brand": "Brand name if visible in ANY photo",
  "model": "Model name/number if visible in ANY photo",
  "features": ["key feature 1", "key feature 2", "key feature 3"]
}
${hints ? `\nUSER HINTS: ${hints}\nPlease incorporate these hints into your analysis, especially for the description and features.` : ''}

Be specific and accurate. Use bullet points (•) for lists. Format with clear section headers. Since you have ${imageArray.length > 1 ? 'multiple angles' : 'one photo'}, ${imageArray.length > 1 ? 'examine ALL photos carefully to provide the most accurate condition assessment and feature list.' : 'use your best judgment based on similar products.'}`;

    // Build content array for OpenAI with all images
    const content: any[] = [
      {
        type: 'text',
        text: promptText
      }
    ];

    // Add all images to the content
    imageArray.forEach((img) => {
      content.push({
        type: 'image_url',
        image_url: {
          url: img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`,
          detail: 'high' // Use high detail mode for better analysis
        }
      });
    });

    // Call OpenAI Vision API to analyze ALL product photos
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: content
        }
      ],
      max_tokens: 1500 // Increased for multiple photos
    });

    // Extract the AI response
    const aiResponse = response.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI service');
    }

    // Parse the JSON response from AI
    let productData: AnalysisResult;
    try {
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
      productData = JSON.parse(jsonString);
    } catch (parseError) {
      logger.error('Failed to parse AI response:', parseError);
      logger.error('AI response was:', aiResponse);
      throw new Error('Failed to parse AI response');
    }

    // Calculate confidence scores
    const confidenceScores = calculateConfidenceScores(productData, imageArray.length, qualityResults);

    // Add QuickSell watermark to description for viral marketing
    if (productData.description) {
      const watermark = '\n\n—————————\n\nListing generated in seconds by https://QuickSell.monster\nFaster listings, smarter pricing.';
      productData.description = productData.description + watermark;
    }

    logger.info('Photo analysis successful');
    logger.info(`Confidence scores - Overall: ${confidenceScores.overall}%`);

    // Return the analyzed data with quality checks and confidence scores
    res.status(200).json({
      success: true,
      data: {
        ...productData,
        analysis_metadata: {
          photos_analyzed: imageArray.length,
          confidence_scores: confidenceScores,
          quality_checks: qualityResults,
          quality_summary: {
            acceptable_photos: qualityResults.filter(qr => qr.is_acceptable).length,
            total_photos: imageArray.length,
            has_critical_issues: criticalIssues.length > 0,
            critical_issues_count: criticalIssues.length
          }
        }
      },
      statusCode: 200
    });

  } catch (error: any) {
    logger.error('Photo analysis error:', error);
    logger.error('Error details:', JSON.stringify(error, null, 2));

    // Check for specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return res.status(503).json({
        success: false,
        error: 'AI service quota exceeded. Please try again later.',
        details: 'OpenAI API quota has been exceeded. Check your OpenAI account billing.',
        statusCode: 503
      });
    }

    if (error.status === 401 || error.code === 'invalid_api_key') {
      return res.status(500).json({
        success: false,
        error: 'AI service authentication failed',
        details: 'Invalid OpenAI API key. Please check server configuration.',
        statusCode: 500
      });
    }

    if (error.status === 403 || error.code === 'model_not_found') {
      return res.status(500).json({
        success: false,
        error: 'AI model access denied',
        details: 'Your OpenAI account may need billing setup or tier upgrade to access GPT-4 Vision.',
        openaiError: error.message,
        statusCode: 500
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        details: 'OpenAI API rate limit exceeded. Please wait and try again.',
        statusCode: 429
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Photo analysis failed',
      details: error.code ? `OpenAI error code: ${error.code}` : 'Unknown error occurred',
      openaiError: error.error?.message || error.message,
      statusCode: 500
    });
  }
};

/**
 * Upload photo (stub - can be implemented with multer/cloudinary later)
 */
export const uploadPhoto = async (req: Request, res: Response) => {
  try {
    // TODO: Implement actual file upload to cloud storage (Cloudinary, S3, etc.)
    res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        url: 'https://placeholder.com/photo.jpg'
      },
      statusCode: 201
    });
  } catch (error) {
    logger.error('Photo upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Photo upload failed',
      statusCode: 500
    });
  }
};

/**
 * Delete photo (stub)
 */
export const deletePhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Implement photo deletion from storage
    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully',
      statusCode: 200
    });
  } catch (error) {
    logger.error('Photo deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete photo',
      statusCode: 500
    });
  }
};

/**
 * Watermark Service
 * Adds "QuickSell.monster" watermark to photos for viral marketing
 */

import sharp from 'sharp';
import { logger } from '../config/logger';

interface WatermarkOptions {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  opacity?: number;
  fontSize?: number;
  padding?: number;
}

class WatermarkService {
  private readonly watermarkText = 'QuickSell.monster';
  private readonly defaultOptions: WatermarkOptions = {
    position: 'bottom-right',
    opacity: 0.7,
    fontSize: 24,
    padding: 10,
  };

  /**
   * Add watermark to a single photo (base64 or buffer)
   */
  async addWatermarkToPhoto(
    photoData: string | Buffer,
    options: WatermarkOptions = {}
  ): Promise<string> {
    try {
      const opts = { ...this.defaultOptions, ...options };

      // Convert base64 to buffer if needed
      let imageBuffer: Buffer;
      if (typeof photoData === 'string') {
        // Remove data:image/xxx;base64, prefix if present
        const base64Data = photoData.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
        imageBuffer = photoData;
      }

      // Get image metadata
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      const { width = 800, height = 600 } = metadata;

      // Create watermark text as SVG
      const watermarkSvg = this.createWatermarkSvg(
        width,
        height,
        opts.fontSize!,
        opts.opacity!,
        opts.position!,
        opts.padding!
      );

      // Composite watermark onto image
      const watermarkedBuffer = await image
        .composite([
          {
            input: Buffer.from(watermarkSvg),
            gravity: this.getGravity(opts.position!),
          },
        ])
        .jpeg({ quality: 90 })
        .toBuffer();

      // Convert back to base64
      const watermarkedBase64 = `data:image/jpeg;base64,${watermarkedBuffer.toString('base64')}`;

      logger.info(`Watermark added to photo (${width}x${height})`);
      return watermarkedBase64;
    } catch (error: any) {
      logger.error('Watermark error:', error);
      // Return original photo if watermarking fails
      return typeof photoData === 'string' ? photoData : photoData.toString('base64');
    }
  }

  /**
   * Add watermark to multiple photos
   */
  async addWatermarkToPhotos(
    photos: string[],
    options: WatermarkOptions = {}
  ): Promise<string[]> {
    const watermarkedPhotos: string[] = [];

    for (const photo of photos) {
      const watermarked = await this.addWatermarkToPhoto(photo, options);
      watermarkedPhotos.push(watermarked);
    }

    logger.info(`Watermarked ${watermarkedPhotos.length} photos`);
    return watermarkedPhotos;
  }

  /**
   * Add watermark text to listing description
   */
  addWatermarkToDescription(description: string): string {
    const watermarkFooter = `\n\n---\n📸 Posted via QuickSell.monster - The fastest way to sell anywhere!\n🚀 Get your items listed on multiple marketplaces instantly.\nVisit: https://quicksell.monster`;

    // Don't add if already present
    if (description.includes('QuickSell.monster')) {
      return description;
    }

    return description + watermarkFooter;
  }

  /**
   * Create SVG watermark text
   */
  private createWatermarkSvg(
    imageWidth: number,
    imageHeight: number,
    fontSize: number,
    opacity: number,
    position: string,
    padding: number
  ): string {
    // Calculate position
    let x = padding;
    let y = imageHeight - padding;
    let anchor = 'start';

    switch (position) {
      case 'bottom-right':
        x = imageWidth - padding;
        y = imageHeight - padding;
        anchor = 'end';
        break;
      case 'bottom-left':
        x = padding;
        y = imageHeight - padding;
        anchor = 'start';
        break;
      case 'top-right':
        x = imageWidth - padding;
        y = padding + fontSize;
        anchor = 'end';
        break;
      case 'top-left':
        x = padding;
        y = padding + fontSize;
        anchor = 'start';
        break;
      case 'center':
        x = imageWidth / 2;
        y = imageHeight / 2;
        anchor = 'middle';
        break;
    }

    return `
      <svg width="${imageWidth}" height="${imageHeight}">
        <style>
          .watermark {
            font-family: Arial, sans-serif;
            font-size: ${fontSize}px;
            font-weight: bold;
            fill: white;
            opacity: ${opacity};
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          }
        </style>
        <text
          x="${x}"
          y="${y}"
          text-anchor="${anchor}"
          class="watermark"
        >${this.watermarkText}</text>
      </svg>
    `;
  }

  /**
   * Convert position to Sharp gravity
   */
  private getGravity(position: string): any {
    switch (position) {
      case 'bottom-right':
        return 'southeast';
      case 'bottom-left':
        return 'southwest';
      case 'top-right':
        return 'northeast';
      case 'top-left':
        return 'northwest';
      case 'center':
        return 'center';
      default:
        return 'southeast';
    }
  }
}

export default new WatermarkService();

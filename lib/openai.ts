import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface CaptionRequest {
  topic: string
  platform: string
  tone: string
  includeHashtags: boolean
  includeEmojis: boolean
  length?: 'short' | 'medium' | 'long'
}

export async function generateCaption(request: CaptionRequest) {
  const {
    topic,
    platform,
    tone,
    includeHashtags,
    includeEmojis,
    length = 'medium',
  } = request

  const lengthGuide = {
    short: '1-2 sentences',
    medium: '2-3 sentences',
    long: '3-5 sentences',
  }

  const platformGuidelines = {
    INSTAGRAM: 'Instagram posts with engaging storytelling',
    FACEBOOK: 'Facebook posts that encourage conversation',
    TWITTER: 'Twitter/X posts under 280 characters with impact',
    LINKEDIN: 'LinkedIn posts with professional insights',
    TIKTOK: 'TikTok captions that are catchy and trend-focused',
  }

  const prompt = `You are an expert social media copywriter. Generate an engaging caption for ${platform}.

Topic: ${topic}
Tone: ${tone}
Length: ${lengthGuide[length]}
Platform Guidelines: ${platformGuidelines[platform as keyof typeof platformGuidelines]}

Requirements:
- Make it ${tone} in tone
- ${includeEmojis ? 'Include relevant emojis naturally' : 'Do not include emojis'}
- ${includeHashtags ? 'Include 5-10 relevant hashtags at the end' : 'Do not include hashtags'}
- Focus on engagement and authenticity
- Make it platform-appropriate

Return ONLY the caption text, no explanations or quotes.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert social media copywriter who creates engaging, authentic captions that drive engagement.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    })

    return completion.choices[0].message.content || ''
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate caption')
  }
}

export async function generateMultipleCaptions(
  request: CaptionRequest,
  count: number = 3
) {
  const promises = Array(count)
    .fill(null)
    .map(() => generateCaption(request))

  return Promise.all(promises)
}

export async function improveCaptionWithAI(
  originalCaption: string,
  improvement: string
) {
  const prompt = `Improve this social media caption based on the following instruction:

Original Caption: ${originalCaption}

Improvement Request: ${improvement}

Return ONLY the improved caption, no explanations.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    return completion.choices[0].message.content || originalCaption
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to improve caption')
  }
}

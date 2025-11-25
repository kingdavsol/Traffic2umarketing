import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateCaption, generateMultipleCaptions } from '@/lib/openai'
import { getTierLimits } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      topic,
      platform,
      tone,
      includeHashtags = true,
      includeEmojis = true,
      length = 'medium',
      count = 1,
    } = body

    if (!topic || !platform || !tone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user with subscription tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check caption limit
    const tierLimits = getTierLimits(user.subscriptionTier)
    const isUnlimited = tierLimits.captionsPerMonth === -1

    if (!isUnlimited && user.captionsGenerated >= user.monthlyCapLimit) {
      return NextResponse.json(
        { error: 'Caption limit reached. Please upgrade your plan.' },
        { status: 403 }
      )
    }

    // Generate caption(s)
    const captions =
      count > 1
        ? await generateMultipleCaptions(
            { topic, platform, tone, includeHashtags, includeEmojis, length },
            count
          )
        : [
            await generateCaption({
              topic,
              platform,
              tone,
              includeHashtags,
              includeEmojis,
              length,
            }),
          ]

    // Save captions to database
    const savedCaptions = await Promise.all(
      captions.map((content) =>
        prisma.caption.create({
          data: {
            userId: user.id,
            content,
            platform,
            tone,
            hashtags: content.match(/#[\w]+/g) || [],
            emojis: includeEmojis,
            promptUsed: topic,
          },
        })
      )
    )

    // Update user caption count
    await prisma.user.update({
      where: { id: user.id },
      data: { captionsGenerated: { increment: captions.length } },
    })

    // Update analytics
    await prisma.analytics.create({
      data: {
        userId: user.id,
        captionsGenerated: captions.length,
        platform,
        tone,
      },
    })

    return NextResponse.json({
      captions: savedCaptions,
      remaining: isUnlimited
        ? -1
        : user.monthlyCapLimit - user.captionsGenerated - captions.length,
    })
  } catch (error) {
    console.error('Caption generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate caption' },
      { status: 500 }
    )
  }
}

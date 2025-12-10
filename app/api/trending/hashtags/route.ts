import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const platform = searchParams.get('platform')
    const category = searchParams.get('category')

    const where: any = {}

    if (platform) {
      where.platform = platform
    }

    if (category) {
      where.category = category
    }

    const hashtags = await prisma.trendingHashtag.findMany({
      where,
      orderBy: { popularity: 'desc' },
      take: 50,
    })

    return NextResponse.json({ hashtags })
  } catch (error) {
    console.error('Error fetching trending hashtags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending hashtags' },
      { status: 500 }
    )
  }
}

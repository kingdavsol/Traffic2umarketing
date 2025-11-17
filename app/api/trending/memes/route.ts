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

    const where: any = {
      expiresAt: { gte: new Date() },
    }

    if (platform) {
      where.platform = { has: platform }
    }

    if (category) {
      where.category = category
    }

    const memes = await prisma.trendingMeme.findMany({
      where,
      orderBy: [{ popularity: 'desc' }, { createdAt: 'desc' }],
      take: 20,
    })

    return NextResponse.json({ memes })
  } catch (error) {
    console.error('Error fetching trending memes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending memes' },
      { status: 500 }
    )
  }
}

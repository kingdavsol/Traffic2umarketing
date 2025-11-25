import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { captionId, name, folder } = body

    if (!captionId) {
      return NextResponse.json(
        { error: 'Caption ID is required' },
        { status: 400 }
      )
    }

    // Check if caption exists and belongs to user
    const caption = await prisma.caption.findFirst({
      where: {
        id: captionId,
        userId: session.user.id,
      },
    })

    if (!caption) {
      return NextResponse.json({ error: 'Caption not found' }, { status: 404 })
    }

    // Check if already saved
    const existing = await prisma.savedCaption.findUnique({
      where: { captionId },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Caption already saved' },
        { status: 400 }
      )
    }

    // Save caption
    const savedCaption = await prisma.savedCaption.create({
      data: {
        userId: session.user.id,
        captionId,
        name,
        folder,
      },
    })

    return NextResponse.json({ savedCaption })
  } catch (error) {
    console.error('Error saving caption:', error)
    return NextResponse.json(
      { error: 'Failed to save caption' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const captionId = searchParams.get('captionId')

    if (!captionId) {
      return NextResponse.json(
        { error: 'Caption ID is required' },
        { status: 400 }
      )
    }

    // Delete saved caption
    await prisma.savedCaption.delete({
      where: {
        captionId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: 'Caption unsaved successfully' })
  } catch (error) {
    console.error('Error unsaving caption:', error)
    return NextResponse.json(
      { error: 'Failed to unsave caption' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@traffic2u/auth';
import { prisma } from '@traffic2u/database';

// PATCH - Update an existing update
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { title, content, category, tags, isPublished } = await request.json();

    // Get the update and verify ownership
    const existingUpdate = await prisma.update.findUnique({
      where: { id },
      include: { changelog: true },
    });

    if (!existingUpdate) {
      return NextResponse.json(
        { message: 'Update not found' },
        { status: 404 }
      );
    }

    if (existingUpdate.changelog.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized. You do not own this update.' },
        { status: 403 }
      );
    }

    // Update the update
    const wasPublished = existingUpdate.isPublished;
    const nowPublishing = isPublished && !wasPublished;

    const update = await prisma.update.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingUpdate.title,
        content: content !== undefined ? content : existingUpdate.content,
        category: category !== undefined ? category : existingUpdate.category,
        tags: tags !== undefined ? tags : existingUpdate.tags,
        isPublished: isPublished !== undefined ? isPublished : existingUpdate.isPublished,
        publishedAt: nowPublishing ? new Date() : existingUpdate.publishedAt,
      },
    });

    // If newly published, notify subscribers
    if (nowPublishing) {
      // TODO: Send notifications to subscribers
    }

    return NextResponse.json({ update });
  } catch (error: any) {
    console.error('Update update error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update update' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an update
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get the update and verify ownership
    const existingUpdate = await prisma.update.findUnique({
      where: { id },
      include: { changelog: true },
    });

    if (!existingUpdate) {
      return NextResponse.json(
        { message: 'Update not found' },
        { status: 404 }
      );
    }

    if (existingUpdate.changelog.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized. You do not own this update.' },
        { status: 403 }
      );
    }

    // Delete the update
    await prisma.update.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Update deleted successfully' });
  } catch (error: any) {
    console.error('Delete update error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete update' },
      { status: 500 }
    );
  }
}

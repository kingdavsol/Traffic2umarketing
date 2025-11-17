import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@traffic2u/auth';
import { prisma } from '@traffic2u/database';

// GET - List all updates for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Get changelog for user (assume one changelog per user for simplicity)
    const changelog = await prisma.changelog.findFirst({
      where: { userId: session.user.id },
    });

    if (!changelog) {
      return NextResponse.json({ updates: [] });
    }

    // Get all updates for this changelog
    const updates = await prisma.update.findMany({
      where: { changelogId: changelog.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ updates });
  } catch (error: any) {
    console.error('Fetch updates error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch updates' },
      { status: 500 }
    );
  }
}

// POST - Create a new update
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { title, content, category, tags, isPublished } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { message: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Get or create changelog for user
    let changelog = await prisma.changelog.findFirst({
      where: { userId: session.user.id },
    });

    if (!changelog) {
      // Create a default changelog for the user
      changelog = await prisma.changelog.create({
        data: {
          userId: session.user.id,
          slug: `user-${session.user.id}`,
          name: 'Product Changelog',
          description: 'Stay updated with our latest changes and improvements',
        },
      });
    }

    // Create the update
    const update = await prisma.update.create({
      data: {
        changelogId: changelog.id,
        title,
        content,
        category: category || 'FEATURE',
        tags: tags || [],
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    // If published, notify subscribers
    if (isPublished) {
      // TODO: Send notifications to subscribers
      // This would be implemented in a real app
    }

    return NextResponse.json({ update }, { status: 201 });
  } catch (error: any) {
    console.error('Create update error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create update' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@traffic2u/auth';
import { prisma } from '@traffic2u/database';
import { generateQRCodeBuffer, generateQRCodeDataURL } from '@/lib/qr-generator';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { menuId, format = 'png', download = false } = await request.json();

    if (!menuId) {
      return NextResponse.json(
        { message: 'Menu ID is required' },
        { status: 400 }
      );
    }

    // Fetch menu and verify ownership
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { restaurant: true },
    });

    if (!menu) {
      return NextResponse.json(
        { message: 'Menu not found' },
        { status: 404 }
      );
    }

    if (menu.restaurant.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized. You do not own this menu.' },
        { status: 403 }
      );
    }

    // Generate menu URL
    const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3007'}/menu/${menu.restaurant.slug}/${menu.slug}`;

    // If download is requested, return the buffer
    if (download) {
      const qrBuffer = await generateQRCodeBuffer(menuUrl, {
        size: 2048, // High resolution for printing
        errorCorrectionLevel: 'H',
        color: {
          dark: menu.restaurant.primaryColor || '#DC2626',
          light: '#FFFFFF',
        },
      });

      return new NextResponse(qrBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${menu.slug}-qr-code.png"`,
          'Cache-Control': 'no-cache',
        },
      });
    }

    // Otherwise, return data URL
    const qrDataURL = await generateQRCodeDataURL(menuUrl, {
      size: 512,
      errorCorrectionLevel: 'H',
      color: {
        dark: menu.restaurant.primaryColor || '#DC2626',
        light: '#FFFFFF',
      },
    });

    return NextResponse.json({
      qrCode: qrDataURL,
      menuUrl,
      menuName: menu.name,
      restaurantName: menu.restaurant.name,
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      { message: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}

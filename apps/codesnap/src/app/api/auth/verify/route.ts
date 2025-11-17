import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, markEmailVerified } from '@/lib/tokens';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'No verification token provided' },
        { status: 400 }
      );
    }

    // Verify the token
    const email = await verifyToken(token);

    if (!email) {
      return NextResponse.json(
        { message: 'Invalid or expired verification link' },
        { status: 400 }
      );
    }

    // Mark email as verified
    await markEmailVerified(email);

    return NextResponse.json(
      { message: 'Email verified successfully! You can now sign in.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { message: 'An error occurred during verification' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@traffic2u/database';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@traffic2u/email';
import { generateVerificationToken } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Create free subscription
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'FREE',
        status: 'ACTIVE',
      },
    });

    // Generate verification token and send email
    const token = await generateVerificationToken(email);
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;

    await sendVerificationEmail({
      to: email,
      name,
      verificationUrl,
      appName: 'CodeSnap',
    });

    return NextResponse.json(
      {
        message: 'User created successfully. Please check your email to verify your account.',
        userId: user.id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

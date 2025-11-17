import crypto from 'crypto';
import { prisma } from './prisma';

/**
 * Generate a verification token for email verification
 */
export async function generateVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Create new token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Verify a token and return the associated email
 * Returns null if token is invalid or expired
 */
export async function verifyToken(token: string): Promise<string | null> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return null;
  }

  if (verificationToken.expires < new Date()) {
    // Token expired, delete it
    await prisma.verificationToken.delete({
      where: { token },
    });
    return null;
  }

  return verificationToken.identifier; // email
}

/**
 * Mark email as verified and delete the token
 */
export async function markEmailVerified(email: string): Promise<void> {
  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  // Delete all tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });
}

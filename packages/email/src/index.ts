import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface VerificationEmailOptions {
  to: string;
  name: string;
  verificationUrl: string;
  appName: string;
}

export interface PasswordResetEmailOptions {
  to: string;
  name: string;
  resetUrl: string;
  appName: string;
}

export interface WelcomeEmailOptions {
  to: string;
  name: string;
  appName: string;
  loginUrl: string;
}

export interface UpdateNotificationOptions {
  to: string[];
  changelogName: string;
  updateTitle: string;
  updateContent: string;
  updateUrl: string;
  unsubscribeUrl: string;
}

/**
 * Send a generic email using Resend
 */
export async function sendEmail(options: SendEmailOptions) {
  const {from = 'Traffic2U <noreply@traffic2u.com>', ...rest} = options;

  try {
    const data = await resend.emails.send({
      from,
      ...rest,
    });

    return {success: true, data};
  } catch (error) {
    console.error('Failed to send email:', error);
    return {success: false, error};
  }
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(options: VerificationEmailOptions) {
  const {to, name, verificationUrl, appName} = options;

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">${appName}</h1>
    </div>

    <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
      <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>

      <p>Hi ${name},</p>

      <p>Thanks for signing up for ${appName}! To complete your registration, please verify your email address by clicking the button below:</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Verify Email Address</a>
      </div>

      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #f5f5f5; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 14px; color: #666;">
        ${verificationUrl}
      </p>

      <p style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px;">
        If you didn't create an account with ${appName}, you can safely ignore this email.
      </p>

      <p style="color: #666; font-size: 14px;">
        This verification link will expire in 24 hours.
      </p>
    </div>

    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
      <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
    </div>
  </body>
</html>
  `;

  return sendEmail({
    to,
    subject: `Verify your ${appName} account`,
    html,
    from: `${appName} <noreply@traffic2u.com>`,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(options: PasswordResetEmailOptions) {
  const {to, name, resetUrl, appName} = options;

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your password</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">${appName}</h1>
    </div>

    <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
      <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>

      <p>Hi ${name},</p>

      <p>We received a request to reset your password for your ${appName} account. Click the button below to create a new password:</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reset Password</a>
      </div>

      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #f5f5f5; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 14px; color: #666;">
        ${resetUrl}
      </p>

      <p style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px;">
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>

      <p style="color: #666; font-size: 14px;">
        This password reset link will expire in 1 hour.
      </p>
    </div>

    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
      <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
    </div>
  </body>
</html>
  `;

  return sendEmail({
    to,
    subject: `Reset your ${appName} password`,
    html,
    from: `${appName} <noreply@traffic2u.com>`,
  });
}

/**
 * Send welcome email after signup
 */
export async function sendWelcomeEmail(options: WelcomeEmailOptions) {
  const {to, name, appName, loginUrl} = options;

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${appName}</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${appName}!</h1>
    </div>

    <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
      <h2 style="color: #333; margin-top: 0;">Your account is ready!</h2>

      <p>Hi ${name},</p>

      <p>Welcome to ${appName}! We're excited to have you on board. Your account has been successfully created and verified.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Get Started</a>
      </div>

      <p style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e0e0e0;">
        <strong>Need help getting started?</strong><br>
        Check out our documentation or contact our support team at support@traffic2u.com
      </p>
    </div>

    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
      <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
    </div>
  </body>
</html>
  `;

  return sendEmail({
    to,
    subject: `Welcome to ${appName}!`,
    html,
    from: `${appName} <noreply@traffic2u.com>`,
  });
}

/**
 * Send update notification email (for UpdateLog)
 */
export async function sendUpdateNotification(options: UpdateNotificationOptions) {
  const {to, changelogName, updateTitle, updateContent, updateUrl, unsubscribeUrl} = options;

  // Strip HTML tags from content and limit to first 200 chars
  const plainContent = updateContent.replace(/<[^>]*>/g, '').substring(0, 200) + '...';

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Update: ${updateTitle}</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px;">${changelogName}</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">New Update Available</p>
    </div>

    <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
      <h2 style="color: #333; margin-top: 0;">${updateTitle}</h2>

      <p style="color: #666; line-height: 1.8;">
        ${plainContent}
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${updateUrl}" style="background: #8B5CF6; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Read Full Update</a>
      </div>

      <p style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px; text-align: center;">
        <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Unsubscribe from these notifications</a>
      </p>
    </div>

    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
      <p>&copy; ${new Date().getFullYear()} ${changelogName}. All rights reserved.</p>
    </div>
  </body>
</html>
  `;

  return sendEmail({
    to,
    subject: `📢 New Update: ${updateTitle}`,
    html,
    from: `${changelogName} <updates@traffic2u.com>`,
  });
}

export { Resend };

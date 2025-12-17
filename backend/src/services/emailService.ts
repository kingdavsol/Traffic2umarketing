import { Resend } from 'resend';
import { logger } from '../config/logger';

const resend = new Resend(process.env.RESEND_API_KEY);

interface WelcomeEmailParams {
  email: string;
  username: string;
}

/**
 * Send welcome email to new user and add to contact list
 */
export const sendWelcomeEmail = async ({ email, username }: WelcomeEmailParams) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      logger.warn('RESEND_API_KEY not configured - skipping welcome email');
      return { success: false, reason: 'API key not configured' };
    }

    // Send welcome email
    const emailResult = await resend.emails.send({
      from: 'QuickSell <noreply@quicksell.monster>',
      to: email,
      subject: 'Welcome to QuickSell - Start Listing in 60 Seconds!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .feature { margin: 20px 0; padding-left: 30px; position: relative; }
            .feature:before { content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; font-size: 20px; }
            .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 32px;">Welcome to QuickSell!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">AI-Powered Listing Generation in 60 Seconds</p>
            </div>

            <div class="content">
              <h2>Hi ${username}! 👋</h2>

              <p>Thank you for joining QuickSell - the fastest way to create professional marketplace listings using AI.</p>

              <p><strong>Here's what you can do now:</strong></p>

              <div class="feature">Take a photo of any item you want to sell</div>
              <div class="feature">Our AI analyzes it and generates a professional listing</div>
              <div class="feature">Get suggested pricing based on market data</div>
              <div class="feature">Copy your listing to eBay, Facebook, Craigslist, and more</div>

              <center>
                <a href="https://quicksell.monster/dashboard" class="cta-button">Create Your First Listing →</a>
              </center>

              <h3>Quick Start Tips:</h3>
              <ul>
                <li>📸 <strong>Photo Quality:</strong> Clear, well-lit photos get better AI analysis</li>
                <li>💡 <strong>Hints:</strong> Add specific details (brand, model) for more accurate results</li>
                <li>💰 <strong>Pricing:</strong> Our AI suggests fair market prices - adjust as needed</li>
                <li>📋 <strong>Editing:</strong> All AI-generated content is fully editable</li>
              </ul>

              <p>Need help? Reply to this email or visit our <a href="https://quicksell.monster">help center</a>.</p>

              <p>Happy selling!<br>
              <strong>The QuickSell Team</strong></p>
            </div>

            <div class="footer">
              <p>QuickSell - AI-Powered Marketplace Listings<br>
              <a href="https://quicksell.monster">quicksell.monster</a></p>
              <p style="margin-top: 10px; font-size: 11px;">
                You received this email because you signed up for QuickSell.<br>
                If you didn't create this account, please ignore this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    logger.info('Welcome email sent successfully', { email, emailId: emailResult.data?.id });

    // Add to contact list (Resend Audience)
    // Note: First create an audience in Resend dashboard, then add RESEND_AUDIENCE_ID to .env
    if (process.env.RESEND_AUDIENCE_ID) {
      try {
        await resend.contacts.create({
          email: email,
          firstName: username,
          audienceId: process.env.RESEND_AUDIENCE_ID,
          unsubscribed: false
        });
        logger.info('Contact added to Resend audience', { email });
      } catch (contactError: any) {
        // Contact creation is non-critical - log but don't fail
        logger.warn('Failed to add contact to audience', {
          email,
          error: contactError.message
        });
      }
    } else {
      logger.warn('RESEND_AUDIENCE_ID not configured - skipping contact list addition');
    }

    return { success: true, emailId: emailResult.data?.id };

  } catch (error: any) {
    logger.error('Failed to send welcome email', {
      email,
      error: error.message,
      statusCode: error.statusCode
    });

    // Don't throw - email failure shouldn't block registration
    return { success: false, error: error.message };
  }
};

/**
 * Send email confirmation link
 */
export const sendConfirmationEmail = async (email: string, confirmationToken: string) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      logger.warn('RESEND_API_KEY not configured - skipping confirmation email');
      return { success: false };
    }

    const confirmationLink = `https://quicksell.monster/confirm-email?token=${confirmationToken}`;

    const result = await resend.emails.send({
      from: 'QuickSell <noreply@quicksell.monster>',
      to: email,
      subject: 'Confirm Your Email Address - QuickSell',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2>Confirm Your Email Address</h2>
              <p>Please confirm your email address to complete your QuickSell registration.</p>
              <center>
                <a href="${confirmationLink}" class="cta-button">Confirm Email Address</a>
              </center>
              <p style="color: #666; font-size: 14px;">Or copy and paste this link:<br>
              <a href="${confirmationLink}">${confirmationLink}</a></p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                If you didn't create a QuickSell account, you can safely ignore this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    logger.info('Confirmation email sent', { email, emailId: result.data?.id });
    return { success: true, emailId: result.data?.id };

  } catch (error: any) {
    logger.error('Failed to send confirmation email', { email, error: error.message });
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      logger.warn('RESEND_API_KEY not configured - skipping password reset email');
      return { success: false };
    }

    const resetLink = `https://quicksell.monster/reset-password?token=${resetToken}`;

    const result = await resend.emails.send({
      from: 'QuickSell <noreply@quicksell.monster>',
      to: email,
      subject: 'Reset Your Password - QuickSell',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password for your QuickSell account.</p>
              <center>
                <a href="${resetLink}" class="cta-button">Reset Password</a>
              </center>
              <p style="color: #666; font-size: 14px;">Or copy and paste this link:<br>
              <a href="${resetLink}">${resetLink}</a></p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link expires in 1 hour. If you didn't request a password reset, please ignore this email.
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    });

    logger.info('Password reset email sent', { email, emailId: result.data?.id });
    return { success: true, emailId: result.data?.id };

  } catch (error: any) {
    logger.error('Failed to send password reset email', { email, error: error.message });
    return { success: false, error: error.message };
  }
};

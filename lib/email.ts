import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@captiongenius.com',
      to: email,
      subject: 'Verify your email address',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <tr>
                      <td style="padding: 40px;">
                        <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 600; color: #111827;">Welcome to CaptionGenius! 🎉</h1>
                        <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #4b5563;">
                          Thanks for signing up! Please verify your email address to get started with AI-powered caption generation.
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 24px 0;">
                              <a href="${verifyUrl}" style="display: inline-block; padding: 14px 32px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                Verify Email Address
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin: 0 0 16px; font-size: 14px; line-height: 20px; color: #6b7280;">
                          Or copy and paste this link into your browser:
                        </p>
                        <p style="margin: 0; font-size: 14px; line-height: 20px; color: #6366f1; word-break: break-all;">
                          ${verifyUrl}
                        </p>
                        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 12px; line-height: 18px; color: #9ca3af;">
                          If you didn't create an account, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                  <table width="600" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 24px; text-align: center;">
                        <p style="margin: 0; font-size: 12px; line-height: 18px; color: #9ca3af;">
                          © 2024 CaptionGenius. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })
  } catch (error) {
    console.error('Failed to send verification email:', error)
    throw error
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@captiongenius.com',
      to: email,
      subject: 'Welcome to CaptionGenius! 🚀',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to CaptionGenius</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <tr>
                      <td style="padding: 40px;">
                        <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 600; color: #111827;">Hey ${name}! 👋</h1>
                        <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #4b5563;">
                          Your email is verified and you're all set! Here's what you can do with CaptionGenius:
                        </p>
                        <ul style="margin: 0 0 24px; padding-left: 20px; font-size: 16px; line-height: 28px; color: #4b5563;">
                          <li>Generate AI-powered captions for 5 platforms</li>
                          <li>Access trending memes and hashtags</li>
                          <li>Save your favorite captions</li>
                          <li>Analyze hashtag performance</li>
                        </ul>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 24px 0;">
                              <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; padding: 14px 32px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                Start Creating Captions
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}

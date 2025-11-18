import { Resend } from "resend";
import { EMAIL_CONFIG } from "@traffic2u/config";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  from?: string;
}

export class EmailService {
  static async sendVerificationEmail(
    email: string,
    verificationLink: string,
    siteDisplayName: string
  ) {
    const html = generateVerificationEmailHTML(verificationLink, siteDisplayName);

    return resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: email,
      subject: `Verify your email - ${siteDisplayName}`,
      html,
      replyTo: EMAIL_CONFIG.replyTo,
    });
  }

  static async sendQuoteReadyEmail(
    email: string,
    siteDisplayName: string,
    quoteCount: number,
    reviewLink: string
  ) {
    const html = generateQuoteReadyEmailHTML(
      siteDisplayName,
      quoteCount,
      reviewLink
    );

    return resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: email,
      subject: `Your ${siteDisplayName} quotes are ready! 📊`,
      html,
      replyTo: EMAIL_CONFIG.replyTo,
    });
  }

  static async sendNewsletterEmail(
    email: string,
    siteDisplayName: string,
    articles: { title: string; excerpt: string; link: string }[]
  ) {
    const html = generateNewsletterEmailHTML(siteDisplayName, articles);

    return resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: email,
      subject: `${siteDisplayName} Weekly Digest 📰`,
      html,
      replyTo: EMAIL_CONFIG.replyTo,
    });
  }

  static async sendCustomEmail(params: EmailParams) {
    return resend.emails.send({
      from: params.from || EMAIL_CONFIG.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo || EMAIL_CONFIG.replyTo,
    });
  }
}

// ===== Email Templates =====

function generateVerificationEmailHTML(
  verificationLink: string,
  siteDisplayName: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${siteDisplayName}!</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>Thank you for signing up! Please verify your email address to get started.</p>
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">Verify Your Email</a>
            </div>
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              This link expires in 24 hours. If you didn't sign up, you can ignore this email.
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Traffic2u Insurance Compare. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateQuoteReadyEmailHTML(
  siteDisplayName: string,
  quoteCount: number,
  reviewLink: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .quote-count { font-size: 28px; color: #10b981; font-weight: bold; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Your Quotes are Ready!</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>Great news! We found <span class="quote-count">${quoteCount} quotes</span> for you.</p>
            <p>Compare these options side-by-side and find the best coverage for your needs.</p>
            <div style="text-align: center;">
              <a href="${reviewLink}" class="button">Review Your Quotes →</a>
            </div>
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              <strong>Tip:</strong> Compare not just prices, but coverage details, deductibles, and customer reviews to make the best choice.
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 ${siteDisplayName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateNewsletterEmailHTML(
  siteDisplayName: string,
  articles: { title: string; excerpt: string; link: string }[]
): string {
  const articlesHtml = articles
    .map(
      (article) => `
    <div style="background: white; padding: 20px; margin-bottom: 15px; border-radius: 6px; border-left: 4px solid #667eea;">
      <h3 style="margin-top: 0; color: #667eea;">${article.title}</h3>
      <p>${article.excerpt}</p>
      <a href="${article.link}" style="color: #667eea; text-decoration: none; font-weight: 500;">Read more →</a>
    </div>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${siteDisplayName} Weekly Digest</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>Here are this week's top insurance articles and tips:</p>
            ${articlesHtml}
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Want to unsubscribe? You can manage your preferences anytime.
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 ${siteDisplayName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export { generateVerificationEmailHTML, generateQuoteReadyEmailHTML, generateNewsletterEmailHTML };

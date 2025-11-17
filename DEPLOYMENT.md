# Deployment Guide for CaptionGenius

This guide will help you deploy CaptionGenius to production.

## Pre-Deployment Checklist

- [ ] Set up production PostgreSQL database
- [ ] Configure Resend for production emails
- [ ] Set up Stripe products and pricing
- [ ] Configure OpenAI API with production limits
- [ ] Prepare environment variables
- [ ] Test all features in staging environment

## Environment Variables

Ensure all these variables are set in your production environment:

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
RESEND_API_KEY=
EMAIL_FROM=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_BASIC_PRICE_ID=
STRIPE_BUILDER_PRICE_ID=
STRIPE_PREMIUM_PRICE_ID=
NEXT_PUBLIC_APP_URL=
```

## Deploying to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Import in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add all variables from your `.env` file
   - Mark sensitive variables as "Sensitive"

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `your-project.vercel.app`

5. **Configure Custom Domain** (Optional)
   - Go to Project Settings > Domains
   - Add your custom domain
   - Update DNS records as instructed

## Database Setup

### Using Supabase (Recommended)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Format: `postgresql://postgres:[password]@[host]:5432/postgres`
5. Add to Vercel environment variables

### Run Migrations

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

## Stripe Configuration

1. **Switch to Live Mode** in Stripe Dashboard
2. **Create Products**:
   - Basic: $9/month
   - Builder: $19/month
   - Premium: $29/month

3. **Set up Webhook**:
   - Go to Developers > Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
   - Copy signing secret

4. **Update Environment Variables**:
   - Add live API keys
   - Add webhook secret
   - Add product price IDs

## Email Configuration

1. **Verify Domain in Resend**
   - Add DNS records for your domain
   - Wait for verification

2. **Update Environment Variables**:
   - Set `EMAIL_FROM` to your verified domain email
   - Update `RESEND_API_KEY` with production key

## OpenAI Configuration

1. **Set Usage Limits**
   - Go to OpenAI dashboard
   - Set monthly budget limit
   - Enable usage notifications

2. **Monitor Usage**
   - Track API usage regularly
   - Set up alerts for unusual patterns

## Post-Deployment

### Test Core Features

1. User registration and email verification
2. Login and authentication
3. Caption generation
4. Subscription checkout
5. Stripe webhooks
6. Admin dashboard

### Set up Monitoring

1. **Vercel Analytics**
   - Enable in Project Settings
   - Monitor performance

2. **Error Tracking** (Optional)
   - Integrate Sentry
   - Monitor errors in production

3. **Uptime Monitoring**
   - Use UptimeRobot or similar
   - Get alerts for downtime

### Security Checklist

- [ ] Use strong `NEXTAUTH_SECRET`
- [ ] Enable HTTPS only
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Review Stripe webhook security
- [ ] Enable 2FA for admin accounts
- [ ] Regular security audits

## Scaling Considerations

### Performance Optimization

1. **Database**
   - Enable connection pooling
   - Add database indexes
   - Use Prisma query optimization

2. **Caching**
   - Implement Redis for session storage
   - Cache trending memes/hashtags
   - Use CDN for static assets

3. **API Optimization**
   - Implement rate limiting
   - Add request queuing for AI generation
   - Use batch processing

### Cost Optimization

1. **OpenAI Usage**
   - Implement request caching
   - Use GPT-3.5 for free tier users
   - Batch similar requests

2. **Database**
   - Optimize queries
   - Archive old data
   - Use read replicas for analytics

3. **Infrastructure**
   - Monitor Vercel usage
   - Optimize build times
   - Use edge functions where possible

## Backup Strategy

1. **Database Backups**
   - Daily automated backups
   - Point-in-time recovery
   - Test restore procedures

2. **User Data**
   - Export user data regularly
   - Comply with GDPR requirements
   - Implement data retention policies

## Troubleshooting

### Common Issues

1. **Stripe Webhook Failures**
   - Check webhook signing secret
   - Verify endpoint URL
   - Check Vercel logs

2. **Email Delivery Issues**
   - Verify domain in Resend
   - Check spam scores
   - Monitor delivery rates

3. **Database Connection Errors**
   - Check connection string
   - Verify IP whitelist
   - Monitor connection pool

4. **OpenAI Rate Limits**
   - Implement exponential backoff
   - Add request queuing
   - Notify users of delays

## Support & Maintenance

### Regular Maintenance Tasks

- Weekly: Review error logs
- Weekly: Monitor API usage and costs
- Monthly: Review user feedback
- Monthly: Update dependencies
- Quarterly: Security audit
- Quarterly: Performance review

### Support Channels

- Email: support@captiongenius.com
- Documentation: docs.captiongenius.com
- Status Page: status.captiongenius.com

## Rollback Procedure

If deployment fails:

1. Revert to previous deployment in Vercel
2. Check error logs
3. Fix issues in development
4. Test thoroughly
5. Redeploy

## Success Metrics

Monitor these KPIs:

- User sign-ups
- Conversion rate (free to paid)
- Monthly recurring revenue (MRR)
- Churn rate
- Caption generation volume
- API error rate
- Page load times
- User satisfaction (NPS)

---

Good luck with your deployment! 🚀

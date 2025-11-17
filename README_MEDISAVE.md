# MediSave - Healthcare Cashback Rewards App

A modern healthcare platform that rewards users with cashback on prescriptions, doctor visits, dental care, vision care, and other healthcare expenses.

## Features

- 💰 **Instant Cashback**: Earn 2-5% cashback on healthcare purchases
- 🏥 **1000+ Providers**: Partner with pharmacies, clinics, dental, vision providers
- 📱 **User Dashboard**: Track earnings, transactions, and available balance
- 🎯 **Smart Matching**: Find nearby providers with best cashback rates
- 💳 **Easy Redemption**: Redeem earnings via direct deposit, gift cards, or account credit
- 🔒 **Secure**: JWT authentication and encrypted payment processing

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: SQLite3
- **Authentication**: JWT with bcryptjs password hashing

## Installation

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Key Features

1. **User Authentication**: Secure signup/login with JWT
2. **Provider Directory**: Browse and search healthcare providers
3. **Transaction Tracking**: Automatic logging of cashback transactions
4. **Balance Management**: Real-time balance updates
5. **Dashboard**: View earnings, transactions, and redeem cashback

## Business Model

- Commission on cashback: 1-3% from merchants
- Premium plans: $4.99/month
- Target market: 130M Americans with chronic conditions
- Revenue potential: $5M+ in partner commissions

## API Routes

```
POST /api/auth/signup
POST /api/auth/login
GET /api/balance/get
GET /api/transactions/list
POST /api/transactions/create
GET /api/providers/list
```

## Deployment

Ready for Vercel, Heroku, Railway, or any Node.js hosting platform.

Set environment variable: `JWT_SECRET`

## Future Roadmap

- Mobile app (React Native)
- Insurance integrations
- AI-powered recommendations
- Telemedicine partnerships
- Employer group plans

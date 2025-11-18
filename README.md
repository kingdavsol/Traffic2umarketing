# Car Maintenance Hub - Cross-Platform App

A comprehensive web and mobile application that helps car owners save money on vehicle maintenance, repairs, and parts. Available on Android, iOS, and web.

## 🎯 Features

### Vehicle Management
- Add and manage multiple vehicles
- Track vehicle information (make, model, year, mileage, VIN, etc.)
- Maintenance history tracking
- Cost tracking and analytics

### Common Problems & Solutions
- Database of common problems by make/model/year/mileage
- Prevention tips for each problem
- Estimated DIY vs professional repair costs
- Step-by-step repair guides

### Parts & Price Comparison
- Find the cheapest parts from multiple retailers:
  - Amazon
  - eBay
  - RockAuto
  - PartsGeek
- Price comparison across retailers
- Real-time availability tracking
- Customer ratings and reviews

### Maintenance & Deal Shopping
- Routine maintenance schedule tracking
- Special deals on maintenance items:
  - Oil & filters
  - Air filters
  - Tires
  - Brakes & brake fluid
  - Wipers
  - Car wash services
  - And more...
- Retail-specific deals
- Maintenance cost estimation

### Tire Shopping
- Vehicle-specific tire recommendations
- Cheapest options
- Best value recommendations
- Tire specifications (tread wear, traction, temperature ratings)
- Rating and warranty information

### Vehicle Modifications
- Popular modifications by vehicle
- DIY difficulty ratings
- Cost estimates
- Popular category filters:
  - Performance upgrades
  - Appearance modifications
  - Comfort upgrades
  - Safety enhancements
  - Fuel efficiency improvements

### Vehicle Valuation
- Current market value estimates
- Price range by condition
- Mileage-based depreciation
- Valuation trending
- Vehicle comparison tools

### Additional Features
- User authentication & profiles
- Dark mode support (planned)
- Offline mode (planned)
- Push notifications for deals (planned)
- AI-powered repair recommendations (planned)

## 🏗️ Project Structure

```
Traffic2umarketing/
├── apps/
│   ├── web/                 # Next.js web application
│   │   ├── src/
│   │   │   ├── pages/      # Next.js pages
│   │   │   ├── components/ # React components
│   │   │   ├── lib/        # Utilities and API client
│   │   │   ├── store/      # Zustand state management
│   │   │   └── styles/     # Global styles
│   │   └── ...config files
│   │
│   ├── mobile/              # React Native Expo app
│   │   ├── app/            # Expo Router navigation
│   │   ├── components/      # React Native components
│   │   ├── lib/            # Utilities and API client
│   │   ├── store/          # Zustand state management
│   │   └── ...config files
│   │
│   └── api/                # Express.js backend API
│       ├── src/
│       │   ├── routes/     # API endpoints
│       │   ├── middleware/ # Express middleware
│       │   └── index.ts    # Server entry point
│       └── ...config files
│
├── packages/
│   ├── shared/             # Shared types and utilities
│   │   ├── src/
│   │   │   ├── types.ts    # TypeScript type definitions
│   │   │   ├── constants.ts # Constants
│   │   │   └── utils.ts    # Utility functions
│   │   └── ...
│   │
│   └── database/           # Prisma database schema
│       ├── prisma/
│       │   ├── schema.prisma # Database schema
│       │   └── migrations/   # Database migrations
│       └── ...
│
├── package.json            # Root workspace package.json
├── README.md              # This file
└── .gitignore            # Git ignore rules
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database (for production)
- Expo CLI (for mobile development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Traffic2umarketing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `.env` files in each app directory:

   **apps/api/.env**
   ```
   NODE_ENV=development
   PORT=3001
   DATABASE_URL=postgresql://user:password@localhost:5432/car_hub
   JWT_SECRET=your-secret-key
   CORS_ORIGIN=http://localhost:3000,http://localhost:8081
   ```

   **apps/web/.env.local**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

4. **Set up the database**
   ```bash
   cd packages/database
   npm run db:push
   # or
   npm run db:migrate
   ```

5. **Start development servers**

   In separate terminals:
   ```bash
   # Backend API (from root)
   npm run dev:api

   # Web app (from root)
   npm run dev:web

   # Mobile app (from root)
   npm run dev:mobile
   ```

### Web App
- Open http://localhost:3000
- Register a new account or login
- Add your first vehicle and explore features

### Mobile App
- Expo will provide options to run on iOS simulator, Android emulator, or physical device
- Follow Expo prompts to launch the app

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Vehicles
- `GET /api/vehicles` - Get all user vehicles
- `GET /api/vehicles/:id` - Get single vehicle
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Problems
- `GET /api/problems` - Get all problems
- `GET /api/problems/:id` - Get single problem
- `GET /api/problems/vehicle/:make/:model` - Get vehicle-specific problems

### Parts & Price Comparison
- `GET /api/parts/:id` - Get part details
- `GET /api/parts/:id/best-price` - Get best price
- `GET /api/parts/:id/compare` - Compare prices across retailers
- `GET /api/parts/problem/:problemId` - Get parts for problem

### Tires
- `GET /api/tires` - Get all tires
- `GET /api/tires/:id` - Get single tire
- `GET /api/tires/vehicle/:make/:model/:year` - Get vehicle-specific tires

### Modifications
- `GET /api/modifications` - Get all modifications
- `GET /api/modifications/:id` - Get single modification
- `GET /api/modifications/vehicle/:make/:model` - Get vehicle-specific modifications
- `GET /api/modifications/popular/:category` - Get popular modifications by category

### Maintenance
- `GET /api/maintenance/schedule/:make/:model/:year` - Get maintenance schedule
- `GET /api/maintenance/deals/items` - Get maintenance deals
- `GET /api/maintenance/deals/retailer/:retailer` - Get retailer-specific deals
- `POST /api/maintenance` - Record maintenance
- `GET /api/maintenance/vehicle/:vehicleId` - Get vehicle maintenance history
- `PUT /api/maintenance/:id` - Update maintenance record
- `DELETE /api/maintenance/:id` - Delete maintenance record

### Valuation
- `GET /api/valuation/:make/:model/:year` - Get vehicle valuation
- `GET /api/valuation/history/:make/:model/:year` - Get valuation history
- `POST /api/valuation/compare` - Compare vehicle values
- `GET /api/valuation/trending` - Get trending valuations

## 🛠️ Tech Stack

### Frontend (Web)
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Charting**: Recharts
- **Forms**: React Hook Form
- **Animations**: Framer Motion

### Frontend (Mobile)
- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Secure Storage**: Expo Secure Store

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Authentication**: JWT
- **Security**: Helmet, CORS, bcryptjs
- **Validation**: Joi

### Database
- **Primary**: PostgreSQL
- **ORM**: Prisma

### Shared
- **TypeScript**: Type definitions
- **Utilities**: Common functions and constants

## 📦 Database Schema

Key entities:
- **Users** - User accounts and authentication
- **Vehicles** - User vehicles with specifications
- **CommonProblems** - Known issues by make/model/year/mileage
- **Parts** - Replacement parts and components
- **PriceListings** - Part prices from different retailers
- **Tires** - Tire options and pricing
- **Modifications** - Vehicle modifications and upgrades
- **MaintenanceRecords** - User's maintenance history
- **MaintenanceGuides** - Step-by-step repair guides
- **VehicleValuation** - Vehicle value estimates
- **SavedArticles** - Bookmarked content

## 🔐 Security

- JWT-based authentication
- Password hashing with bcryptjs
- Secure token storage in mobile app
- CORS configuration
- Input validation and sanitization
- HTTPS enforcement (production)

## 🧪 Testing & Building

```bash
# Lint code
npm run lint

# Type check
npm run type-check

# Build web app
npm run build:web

# Build mobile app
npm run build:android
npm run build:ios

# Build API
npm run build:api
```

## 📊 Planned Features

- [ ] AI-powered repair recommendations
- [ ] Real-time price tracking and notifications
- [ ] Integration with actual retailer APIs (Amazon, eBay, RockAuto)
- [ ] User forum for car-specific tips
- [ ] Maintenance reminder notifications
- [ ] Export maintenance records as PDF
- [ ] Dark mode for web and mobile
- [ ] Multiple language support
- [ ] Offline functionality
- [ ] Advanced cost analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For questions and support:
- Create an issue on GitHub
- Check existing documentation
- Review API documentation

## 🚀 Deployment

### Web App
Deploy to Vercel:
```bash
# Vercel will auto-detect Next.js
vercel deploy
```

### Mobile App
```bash
# iOS
eas build --platform ios
eas submit

# Android
eas build --platform android
eas submit
```

### Backend API
Deploy to services like:
- Heroku
- Railway
- Render
- AWS
- DigitalOcean

## 📞 Contact

For more information about the Car Maintenance Hub, reach out to the development team.

---

**Happy Saving! 🚗💰**
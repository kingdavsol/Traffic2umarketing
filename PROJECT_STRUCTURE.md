# QuickSell Project Structure

## Complete Project Layout

```
Traffic2umarketing/
├── .github/
│   └── workflows/
│       └── deploy.yml                      # GitHub Actions CI/CD pipeline
│
├── backend/                                # Node.js/Express API
│   ├── src/
│   │   ├── config/
│   │   │   ├── logger.ts                  # Winston logger configuration
│   │   │   └── redis.ts                   # Redis client setup
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.ts          # Authentication logic
│   │   │   ├── listingController.ts       # Listing CRUD operations
│   │   │   ├── gamificationController.ts  # Gamification logic
│   │   │   ├── photoController.ts         # Photo upload/processing
│   │   │   ├── marketplaceController.ts   # Marketplace integration
│   │   │   ├── pricingController.ts       # AI pricing engine
│   │   │   ├── salesController.ts         # Sales tracking
│   │   │   ├── shippingController.ts      # Shipping calculations
│   │   │   ├── notificationController.ts  # Notifications
│   │   │   └── subscriptionController.ts  # Subscription management
│   │   │
│   │   ├── services/
│   │   │   ├── userService.ts             # User database operations
│   │   │   ├── listingService.ts          # Listing database operations
│   │   │   ├── gamificationService.ts     # Gamification logic
│   │   │   ├── marketplaceService.ts      # Marketplace API calls
│   │   │   ├── pricingService.ts          # Price estimation
│   │   │   ├── photoService.ts            # Image processing
│   │   │   ├── emailService.ts            # Email notifications
│   │   │   └── paymentService.ts          # Stripe integration
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts             # Authentication endpoints
│   │   │   ├── listing.routes.ts          # Listing endpoints
│   │   │   ├── photo.routes.ts            # Photo endpoints
│   │   │   ├── marketplace.routes.ts      # Marketplace endpoints
│   │   │   ├── pricing.routes.ts          # Pricing endpoints
│   │   │   ├── gamification.routes.ts     # Gamification endpoints
│   │   │   ├── sales.routes.ts            # Sales endpoints
│   │   │   ├── shipping.routes.ts         # Shipping endpoints
│   │   │   ├── notification.routes.ts     # Notification endpoints
│   │   │   └── subscription.routes.ts     # Subscription endpoints
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts                    # JWT authentication
│   │   │   ├── errorHandler.ts            # Error handling
│   │   │   └── requestLogger.ts           # Request logging
│   │   │
│   │   ├── database/
│   │   │   ├── connection.ts              # PostgreSQL connection
│   │   │   ├── migrations/                # Database migrations
│   │   │   └── seeds/                     # Seed data
│   │   │
│   │   ├── types/
│   │   │   └── index.ts                   # TypeScript interfaces
│   │   │
│   │   ├── utils/
│   │   │   ├── validators.ts              # Input validation
│   │   │   ├── formatters.ts              # Data formatting
│   │   │   └── helpers.ts                 # Utility functions
│   │   │
│   │   └── server.ts                      # Main server file
│   │
│   ├── Dockerfile                         # Docker container config
│   ├── tsconfig.json                      # TypeScript config
│   └── package.json                       # Dependencies
│
├── frontend/                               # React.js Web App
│   ├── public/
│   │   ├── logo.svg                       # QuickSell Monster logo
│   │   ├── favicon.svg                    # Favicon
│   │   ├── index.html                     # HTML template
│   │   └── manifest.json                  # PWA manifest
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── PrivateRoute.tsx           # Protected route wrapper
│   │   │   ├── Header.tsx                 # Navigation header
│   │   │   ├── Sidebar.tsx                # Side navigation
│   │   │   ├── Card.tsx                   # Reusable card component
│   │   │   ├── ListingCard.tsx            # Listing display card
│   │   │   ├── Badge.tsx                  # Achievement badge
│   │   │   └── Toast.tsx                  # Notification toast
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx              # Main dashboard
│   │   │   ├── CreateListing.tsx          # Create listing form
│   │   │   ├── MyListings.tsx             # List user listings
│   │   │   ├── ListingDetails.tsx         # View/edit listing
│   │   │   ├── Sales.tsx                  # Sales tracking
│   │   │   ├── Gamification.tsx           # Achievements page
│   │   │   ├── LoginPage.tsx              # Login form
│   │   │   ├── RegisterPage.tsx           # Registration form
│   │   │   ├── LandingPage.tsx            # Public landing page
│   │   │   └── Settings.tsx               # User settings
│   │   │
│   │   ├── store/
│   │   │   ├── index.ts                   # Redux store configuration
│   │   │   └── slices/
│   │   │       ├── authSlice.ts           # Auth state
│   │   │       ├── listingsSlice.ts       # Listings state
│   │   │       ├── gamificationSlice.ts   # Gamification state
│   │   │       └── uiSlice.ts             # UI state
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts                     # Axios API client
│   │   │   ├── authService.ts             # Auth service
│   │   │   ├── listingService.ts          # Listing service
│   │   │   └── analyticsService.ts        # Analytics service
│   │   │
│   │   ├── styles/
│   │   │   ├── index.css                  # Global styles
│   │   │   ├── App.css                    # App-specific styles
│   │   │   ├── components.css             # Component styles
│   │   │   └── animations.css             # CSS animations
│   │   │
│   │   ├── types/
│   │   │   └── index.ts                   # TypeScript types
│   │   │
│   │   ├── utils/
│   │   │   ├── helpers.ts                 # Utility functions
│   │   │   ├── constants.ts               # Constants
│   │   │   └── validators.ts              # Form validation
│   │   │
│   │   ├── App.tsx                        # Main app component
│   │   └── index.tsx                      # React entry point
│   │
│   ├── nginx.conf                         # Nginx config for production
│   ├── tsconfig.json                      # TypeScript config
│   ├── package.json                       # Dependencies
│   └── public/index.html                  # HTML template
│
├── mobile/                                 # React Native Mobile App
│   ├── src/
│   │   ├── components/
│   │   │   ├── CameraView.tsx             # Camera component
│   │   │   ├── ListingForm.tsx            # Listing creation
│   │   │   ├── ListingCard.tsx            # Listing display
│   │   │   ├── Navigation.tsx             # Bottom navigation
│   │   │   └── Badge.tsx                  # Achievement display
│   │   │
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx             # Home/dashboard
│   │   │   ├── CameraScreen.tsx           # Photo capture
│   │   │   ├── ListingsScreen.tsx         # List listings
│   │   │   ├── SalesScreen.tsx            # Sales tracking
│   │   │   ├── GamificationScreen.tsx     # Achievements
│   │   │   ├── LoginScreen.tsx            # Login
│   │   │   └── SettingsScreen.tsx         # Settings
│   │   │
│   │   ├── navigation/
│   │   │   ├── RootNavigator.tsx          # Root navigation stack
│   │   │   ├── AuthNavigator.tsx          # Auth flow
│   │   │   └── AppNavigator.tsx           # Main app flow
│   │   │
│   │   ├── store/
│   │   │   └── slices/                    # Redux slices (shared with web)
│   │   │
│   │   ├── services/
│   │   │   └── api.ts                     # API client (shared)
│   │   │
│   │   ├── utils/
│   │   │   └── helpers.ts                 # Utility functions
│   │   │
│   │   └── App.tsx                        # Root component
│   │
│   ├── app.json                           # Expo configuration
│   ├── eas.json                           # EAS build configuration
│   ├── tsconfig.json                      # TypeScript config
│   └── package.json                       # Dependencies
│
├── docs/                                   # Documentation
│   ├── ARCHITECTURE.md                     # System architecture
│   ├── DATABASE.md                         # Database schema
│   ├── API.md                              # API documentation
│   ├── MARKETPLACES.md                     # Marketplace integration
│   ├── GAMIFICATION.md                     # Gamification system
│   ├── DEPLOYMENT.md                       # Deployment guide
│   ├── BRANDING.md                         # Brand guidelines
│   └── GETTING_STARTED.md                  # Setup guide
│
├── k8s/                                    # Kubernetes configs
│   └── deployment.yaml                     # K8s deployment
│
├── .env.example                            # Environment template
├── .gitignore                              # Git ignore rules
├── docker-compose.yml                      # Local dev environment
├── Makefile                                # Development commands
├── QUICKSTART.md                           # 5-minute quick start
├── ROADMAP.md                              # Development roadmap
├── CONTRIBUTING.md                         # Contributing guide
├── README.md                               # Project README
└── LICENSE                                 # MIT License
```

## Component Relationships

### Frontend Flow
```
App.tsx (Router)
├── Public Routes
│   ├── LandingPage
│   ├── LoginPage
│   └── RegisterPage
└── Private Routes (PrivateRoute wrapper)
    ├── Dashboard
    │   ├── Header (with SVG logo)
    │   ├── Sidebar
    │   └── Stats Cards
    ├── CreateListing
    ├── MyListings
    │   └── ListingCard[]
    ├── ListingDetails
    ├── Sales
    ├── Gamification
    │   ├── BadgeCard[]
    │   ├── LeaderboardTable
    │   └── ChallengeList
    └── Settings

Redux Store
├── authSlice (user, token, isAuthenticated)
├── listingsSlice (items, selectedListing, loading)
├── gamificationSlice (points, level, badges, challenges)
└── uiSlice (sidebarOpen, darkMode, toasts, modals)
```

### Backend Flow
```
server.ts (Express App)
├── Routes
│   ├── /api/v1/auth/* → authController
│   ├── /api/v1/listings/* → listingController
│   ├── /api/v1/photos/* → photoController
│   ├── /api/v1/marketplaces/* → marketplaceController
│   ├── /api/v1/pricing/* → pricingController
│   ├── /api/v1/gamification/* → gamificationController
│   ├── /api/v1/sales/* → salesController
│   ├── /api/v1/shipping/* → shippingController
│   ├── /api/v1/notifications/* → notificationController
│   └── /api/v1/subscription/* → subscriptionController
│
├── Controllers (handle requests)
│   └── Services (business logic)
│       └── Database (PostgreSQL queries)
│
├── Middleware
│   ├── authenticate (JWT)
│   ├── errorHandler
│   └── requestLogger
│
└── Infrastructure
    ├── PostgreSQL (data persistence)
    ├── Redis (caching)
    └── Bull Queue (async jobs)
```

## Data Flow Examples

### User Creating and Publishing a Listing

1. **Frontend (React)**
   - User fills out CreateListing form
   - Submits via api.createListing()
   - Redux updates listingsSlice
   - UI shows success toast

2. **Backend (Express)**
   - POST /api/v1/listings → listingController.createListing()
   - Saves to PostgreSQL via listingService
   - Awards points via gamificationService
   - Returns listing with ID

3. **User Publishes to Marketplaces**
   - User selects marketplaces on ListingDetails
   - Calls api.publishListing(id, marketplaces)
   - Backend validates, formats for each marketplace
   - MarketplaceService sends to each platform's API
   - Creates marketplace_listings records
   - Updates user points

### Gamification Points Award

1. **Event Trigger**
   - User creates listing → +25 points
   - User makes sale → +100 points
   - User gets review → +25 points

2. **Backend Processing**
   - gamificationService.addPoints(userId, amount)
   - Updates user.points in PostgreSQL
   - Checks for badge unlocks
   - Checks for level up
   - Emits notification

3. **Frontend Update**
   - Redux subscription triggered
   - gamificationSlice updates
   - UI displays new points/badges
   - Toast notification shows

## Key Technologies

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **Material-UI** - Component library
- **Axios** - HTTP client
- **React Router** - Navigation

### Mobile
- **React Native** - Cross-platform
- **Expo** - Build/deployment
- **Redux Toolkit** - State management (shared)
- **React Navigation** - Navigation

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Redis** - Caching
- **Bull** - Job queue
- **JWT** - Authentication
- **Sharp** - Image processing
- **OpenAI** - AI features

## Development Workflow

```bash
# Start development
make dev                    # Starts Docker containers

# Run tests
make test                   # Run all tests

# Build
make build-all              # Build frontend and backend

# Deploy
make deploy-backend         # Deploy to yakit.store
make deploy-mobile-android  # Deploy to Play Store
make deploy-mobile-ios      # Deploy to App Store
```

## File Statistics

- **Total Files**: 100+
- **React Components**: 20+
- **Backend Routes**: 10
- **Controllers**: 10
- **Services**: 10+
- **Database Tables**: 15
- **API Endpoints**: 50+
- **Lines of Code**: 10,000+

---

This structure is designed to be:
- **Scalable**: Microservices-ready architecture
- **Maintainable**: Clear separation of concerns
- **Testable**: Isolated services and components
- **Flexible**: Easy to add new features

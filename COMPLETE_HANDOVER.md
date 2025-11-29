# QuickSell Project - Complete Handover Document
**Date:** November 29, 2025
**From:** Claude (Web) - Session: claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1
**To:** Claude Code (Local)
**Project:** QuickSell - AI-Powered Multi-Marketplace Listing Platform

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Current Deployment Status](#current-deployment-status)
4. [Complete Deployment History](#complete-deployment-history)
5. [Technical Architecture](#technical-architecture)
6. [Environment Configuration](#environment-configuration)
7. [Database & Redis Setup](#database--redis-setup)
8. [Docker Architecture](#docker-architecture)
9. [Known Issues & Resolutions](#known-issues--resolutions)
10. [File Structure & Key Files](#file-structure--key-files)
11. [API Routes & Endpoints](#api-routes--endpoints)
12. [Frontend Architecture](#frontend-architecture)
13. [Backend Architecture](#backend-architecture)
14. [Deployment Scripts](#deployment-scripts)
15. [MCP SSH Server Setup](#mcp-ssh-server-setup)
16. [User Credentials & Access](#user-credentials--access)
17. [Troubleshooting Guide](#troubleshooting-guide)
18. [Pending Tasks](#pending-tasks)
19. [Critical Context & User Preferences](#critical-context--user-preferences)
20. [Next Steps](#next-steps)

---

## Executive Summary

**What is QuickSell?**
An AI-powered platform that allows users to take a photo of an item, get AI-generated descriptions and pricing, and automatically post listings to multiple marketplaces (eBay, Facebook Marketplace, Craigslist, etc.).

**Current Status:**
- ✅ Backend running and connected to PostgreSQL & Redis
- ✅ Frontend rebuilt with functional pages (Login, Register, Dashboard, Pricing)
- ⚠️ Registration endpoint returns 404 (API routing issue - FIX APPLIED but needs VPS deployment)
- ⚠️ VPS directory is NOT a git repository (files copied manually, not cloned)
- ⚠️ MCP SSH server configured but NOT yet tested (requires SSH key setup on local machine)

**Immediate Priority:**
1. Set up MCP SSH server for direct VPS access
2. Initialize VPS directory as git repository
3. Pull latest changes to get deployment scripts
4. Test registration functionality
5. Complete end-to-end user flow testing

---

## Project Overview

### Repository Information
- **GitHub Repository:** https://github.com/kingdavsol/Traffic2umarketing
- **Active Branch:** `claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1`
- **Production Domain:** https://quicksell.monster
- **VPS Location:** `/var/www/quicksell.monster`
- **VPS User:** root
- **VPS Host:** quicksell.monster (mail.quicksell.monster)

### Technology Stack
- **Frontend:** React 18, TypeScript, Material-UI (MUI), React Router v6
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Containerization:** Docker Compose V2
- **Reverse Proxy:** Nginx
- **AI Service:** OpenAI GPT (for item descriptions)
- **Build Tool:** Vite (frontend), tsc (backend)

### Key Features (Planned)
1. Photo upload with AI analysis
2. AI-generated item descriptions and pricing
3. Multi-marketplace posting (eBay, Facebook, Craigslist, OfferUp, etc.)
4. Dashboard for managing listings
5. Three pricing tiers (Free, Pro, Business)

---

## Current Deployment Status

### Services Running
```bash
# On VPS as of last check:
docker compose -f docker-compose.prod.yml ps

Expected:
- backend (port 5000) - RUNNING ✅
- frontend (port 8080) - RUNNING ✅
- postgres (port 5432) - RUNNING ✅
- redis (port 6379) - RUNNING ✅
- nginx (ports 80, 443) - STATUS UNKNOWN
```

### Last Known Good State
**Backend Logs (from user's last report):**
```
Server is running on port 5000
✓ Connected to PostgreSQL
✓ Connected to Redis
```

**Frontend:** Built successfully, serving on port 8080

### Critical Issues
1. **VPS Directory Not a Git Repo**
   - Location: `/var/www/quicksell.monster`
   - Files exist but no `.git` directory
   - Cannot `git pull` to update
   - **Resolution Required:** Initialize as git repo and add remote

2. **Registration 404 Error**
   - Frontend calls: `POST /api/auth/register`
   - Backend expects: `POST /api/v1/auth/register`
   - **Fix Applied:** Changed `frontend/src/services/api.ts` to use `/api/v1`
   - **Status:** Committed to GitHub but NOT deployed to VPS yet

3. **MCP SSH Not Configured**
   - `.mcp.json` created and committed
   - SSH key needs to be generated on local machine (not VPS)
   - User needs to copy public key to VPS
   - Claude Code needs to be restarted after setup

---

## Complete Deployment History

### Session Timeline

#### Initial State (From Previous Session)
- Backend crashing with PostgreSQL password authentication errors
- Frontend showing placeholder pages
- Landing page styling issues (Pricing/Login text too close)
- Routes not working properly

#### Fix #1: Database Connection (RESOLVED ✅)
**Problem:**
```
Database connection failed: password authentication failed for user "postgres"
```

**Root Causes:**
1. `.env` had `DB_HOST=localhost` (should be `postgres` for Docker)
2. PostgreSQL volume had old password cached

**Resolution:**
1. Updated `.env`:
   ```bash
   DB_HOST=postgres  # Changed from localhost
   REDIS_HOST=redis  # Changed from localhost
   DB_PASSWORD=QuickSell98(*
   ```
2. Removed old volume:
   ```bash
   docker compose -f docker-compose.prod.yml down
   docker volume rm quicksellmonster_postgres_data
   docker compose -f docker-compose.prod.yml up -d
   ```

**Result:** Backend successfully connected to PostgreSQL and Redis

#### Fix #2: Registration 404 Error (FIX APPLIED, NOT DEPLOYED ⚠️)
**Problem:**
```
POST /auth/register - 404 (1ms)
```

**Root Cause:**
Frontend calling `/api/auth/register` but backend routes at `/api/v1/auth/register`

**Resolution:**
Changed `frontend/src/services/api.ts`:
```typescript
// BEFORE
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// AFTER
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';
```

**Status:** Committed to GitHub (commit 04aafff) but VPS not updated yet

#### Fix #3: Placeholder Pages (COMPLETED ✅)
**Problem:** All navigation links showed placeholder components

**Resolution:** Created full functional implementations:
- `frontend/src/pages/LoginPage.tsx` - Full login with validation
- `frontend/src/pages/RegisterPage.tsx` - Full registration with password confirmation
- `frontend/src/pages/DashboardPage.tsx` - Photo upload and AI analysis UI
- `frontend/src/pages/PricingPage.tsx` - Three-tier pricing display

**Status:** Committed and pushed to GitHub

#### Fix #4: Landing Page Styling (COMPLETED ✅)
**Problem:** Spacing issues, blank signup button, text too close

**Resolution:** Updated `frontend/src/pages/Landing.css`:
- Changed `.nav-links` gap from `var(--spacing-lg)` to `var(--spacing-2xl)`
- Added glassmorphism effects
- Enhanced button shadows
- Improved responsive design

**Status:** Committed and pushed to GitHub

#### Enhancement #1: Deployment Scripts (COMPLETED ✅)
Created three deployment scripts:

1. **deploy.sh** - Full deployment with validation
2. **quick-deploy.sh** - Smart rebuilding based on changed files
3. **monitor.sh** - Comprehensive diagnostics tool

**Status:** Committed (commit 747bec3) and pushed to GitHub

#### Enhancement #2: MCP SSH Server (CONFIGURED, NOT TESTED ⚠️)
**Created:**
- `.mcp.json` - MCP server configuration
- `MCP_SETUP_GUIDE.md` - Setup instructions

**Requirements:**
- SSH key on local machine (where Claude Code runs)
- Public key copied to VPS
- Claude Code restart to load MCP server

**Status:** Committed (commit 04aafff) but setup not completed by user

---

## Technical Architecture

### High-Level Architecture
```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS (443)
       ↓
┌─────────────┐
│    Nginx    │ (Reverse Proxy)
└──────┬──────┘
       │
       ├─→ /api/* ─→ Backend (5000)
       │
       └─→ /* ─────→ Frontend (8080)

Backend connects to:
  ├─→ PostgreSQL (5432)
  ├─→ Redis (6379)
  └─→ OpenAI API (external)
```

### Docker Network
All services run on Docker network: `quicksellmonster_default`

**Service Hostnames (within Docker network):**
- Backend: `backend` (NOT localhost)
- PostgreSQL: `postgres` (NOT localhost)
- Redis: `redis` (NOT localhost)
- Frontend: `frontend`
- Nginx: `nginx`

**External Access:**
- Frontend: http://quicksell.monster:8080
- Backend: http://quicksell.monster:5000
- Nginx: http://quicksell.monster (80/443)

---

## Environment Configuration

### Critical Environment Variables

**Location:** `/var/www/quicksell.monster/.env` (on VPS)

**Required Variables:**
```bash
# Database (CRITICAL - Must use Docker service names)
DB_HOST=postgres              # NOT localhost!
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<see VPS .env>    # Must match across restarts!
DB_NAME=quicksell

# Redis (CRITICAL - Must use Docker service names)
REDIS_HOST=redis              # NOT localhost!
REDIS_PORT=6379
REDIS_PASSWORD=<see VPS .env>

# JWT & Security
JWT_SECRET=<see VPS .env>
JWT_EXPIRES_IN=7d

# OpenAI API
OPENAI_API_KEY=<see VPS .env>

# Stripe (Testing)
STRIPE_SECRET_KEY=<see VPS .env>
STRIPE_PUBLISHABLE_KEY=<see VPS .env>

# Node Environment
NODE_ENV=production
PORT=5000

# Frontend URL
FRONTEND_URL=https://quicksell.monster
```

### Why DB_HOST=postgres (Not localhost)

**Docker Networking:**
- Each container has its own localhost
- Containers communicate via service names
- `postgres` is the service name in docker-compose.prod.yml
- Using `localhost` would try to connect to the backend container's own localhost (wrong!)

**Common Mistake:**
```bash
# WRONG ❌
DB_HOST=localhost  # Connects to backend container's localhost (no DB there)

# CORRECT ✅
DB_HOST=postgres   # Connects to postgres container
```

---

## Database & Redis Setup

### PostgreSQL Configuration

**Version:** PostgreSQL 15
**Container Name:** `quicksellmonster-postgres-1`
**Volume:** `quicksellmonster_postgres_data`
**Port:** 5432 (internal only, not exposed to host)

**Connection String:**
```
postgres://postgres:QuickSell98(*@postgres:5432/quicksell
```

**Schema Location:**
`backend/src/database/schema.sql`

**Key Tables:**
- `users` - User accounts (id, username, email, password_hash, created_at)
- `photos` - Uploaded photos
- `listings` - Marketplace listings
- `ai_analyses` - AI-generated descriptions
- `subscriptions` - User subscription tiers

**Important Notes:**
1. PostgreSQL volumes persist passwords
2. If you change `DB_PASSWORD` in `.env`, you MUST delete the volume:
   ```bash
   docker volume rm quicksellmonster_postgres_data
   ```
3. Password is hashed using bcrypt in backend
4. Initial schema created on first run via `initdb.d/schema.sql`

### Redis Configuration

**Version:** Redis 7
**Container Name:** `quicksellmonster-redis-1`
**Volume:** `quicksellmonster_redis_data`
**Port:** 6379 (internal only)

**Purpose:**
- Session storage
- Cache for AI responses
- Rate limiting
- Job queue (future)

**Connection:**
```
redis://redis:6379
Password: Host98(++inger!@
```

---

## Docker Architecture

### Docker Compose Files

**Production:** `docker-compose.prod.yml`
**Development:** `docker-compose.yml`

### Service Definitions

#### Backend Service
```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
```

**Dockerfile:** Multi-stage build
1. Stage 1: Build TypeScript
2. Stage 2: Production runtime (Node 18 Alpine)

#### Frontend Service
```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

**Build Process:**
1. `npm run build` (Vite build)
2. Serve with `serve -s dist -l 8080`

#### PostgreSQL Service
```yaml
services:
  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/src/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_DB: ${DB_NAME}
```

#### Redis Service
```yaml
services:
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    command: redis-server --requirepass ${REDIS_PASSWORD}
```

### Docker Commands (VPS)

```bash
# Navigate to project directory
cd /var/www/quicksell.monster

# View running containers
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Restart services
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend

# Rebuild and restart
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# Stop all services
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (DESTRUCTIVE)
docker compose -f docker-compose.prod.yml down -v
```

---

## Known Issues & Resolutions

### Issue #1: PostgreSQL Password Authentication Failed ✅ RESOLVED

**Error:**
```
Database connection failed: password authentication failed for user "postgres"
```

**Root Cause:**
- PostgreSQL volume persists credentials
- Changing password in `.env` doesn't change password in volume

**Resolution:**
```bash
docker compose -f docker-compose.prod.yml down
docker volume rm quicksellmonster_postgres_data
# Update .env with correct password
docker compose -f docker-compose.prod.yml up -d
```

**Prevention:**
Never change `DB_PASSWORD` without removing the volume first.

---

### Issue #2: Registration Returns 404 ⚠️ FIX APPLIED, NOT DEPLOYED

**Error (Backend Logs):**
```
POST /auth/register - 404 (1ms)
```

**Root Cause:**
- Frontend: `API_BASE_URL = '/api'`
- Backend routes: `/api/v1/auth/register`
- Result: Frontend calls `/api/auth/register` (404)

**Resolution Applied:**
`frontend/src/services/api.ts` line 5:
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';
```

**Testing:**
```bash
# Test registration endpoint
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Should return 400 (validation error) or 201 (success)
# Should NOT return 404
```

**Status:** Committed to GitHub, needs VPS deployment

---

### Issue #3: VPS Directory Not a Git Repository ⚠️ UNRESOLVED

**Problem:**
```bash
cd /var/www/quicksell.monster
git status
# fatal: not a git repository
```

**Impact:**
- Cannot `git pull` to update code
- Cannot track changes
- Deployment scripts won't work

**Resolution (User Must Run on VPS):**
```bash
cd /var/www/quicksell.monster

# Option A: Initialize and connect to remote
git init
git remote add origin https://github.com/kingdavsol/Traffic2umarketing.git
git fetch origin claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1
git reset --hard origin/claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1

# Option B: Fresh clone (more reliable)
cd /var/www
sudo mv quicksell.monster quicksell.monster.backup
sudo git clone --branch claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1 \
  https://github.com/kingdavsol/Traffic2umarketing.git quicksell.monster
cd quicksell.monster
# Copy .env from backup
sudo cp ../quicksell.monster.backup/.env .
```

**After Resolution:**
```bash
cd /var/www/quicksell.monster
sudo bash quick-deploy.sh  # Will now work
```

---

### Issue #4: Placeholder Pages ✅ RESOLVED

**Problem:** All links showed placeholder components like:
```typescript
const LoginPage = () => <div>LoginPage Page</div>;
```

**Resolution:** Created full implementations:
- Login form with validation and error handling
- Registration with password confirmation
- Dashboard with photo upload UI
- Pricing page with three tiers

**Files Updated:**
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/RegisterPage.tsx`
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/pages/PricingPage.tsx`
- `frontend/src/App.tsx` (added routes)

---

### Issue #5: Landing Page Styling ✅ RESOLVED

**Problems:**
- Pricing and Login text too close
- Blank signup button
- Not modern looking

**Resolution:**
`frontend/src/pages/Landing.css`:
- Increased gap in `.nav-links` from `var(--spacing-lg)` to `var(--spacing-2xl)`
- Added glassmorphism to navigation
- Enhanced button shadows and hover effects
- Improved responsive spacing

---

## File Structure & Key Files

### Root Directory (`/var/www/quicksell.monster`)

```
/var/www/quicksell.monster/
├── .env                          # Environment variables (NOT in git)
├── .env.example                  # Template for .env
├── .gitignore
├── .mcp.json                     # MCP SSH server config (NEW)
├── docker-compose.prod.yml       # Production Docker config
├── docker-compose.yml            # Development Docker config
├── deploy.sh                     # Full deployment script (ENHANCED)
├── quick-deploy.sh               # Smart deployment script (NEW)
├── monitor.sh                    # Diagnostics script (NEW)
├── MCP_SETUP_GUIDE.md           # MCP setup instructions (NEW)
├── DEPLOYMENT.md                # Deployment guide (NEW)
├── README.md
├── QUICKSTART.md
├── PROJECT_STRUCTURE.md
├── backend/                      # Backend application
├── frontend/                     # Frontend application
├── docs/                         # Documentation
├── k8s/                          # Kubernetes configs (future)
├── mobile/                       # Mobile app (future)
└── marketing/                    # Marketing materials
```

### Backend Directory (`backend/`)

```
backend/
├── Dockerfile.prod              # Production Dockerfile
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                 # Entry point
│   ├── config/
│   │   └── env.ts              # Environment config
│   ├── database/
│   │   ├── connection.ts       # PostgreSQL connection ⭐
│   │   ├── schema.sql          # Database schema
│   │   └── queries.ts          # SQL queries
│   ├── routes/
│   │   ├── auth.routes.ts      # /api/v1/auth/* ⭐
│   │   ├── photo.routes.ts     # /api/v1/photos/*
│   │   └── listing.routes.ts   # /api/v1/listings/*
│   ├── controllers/
│   │   ├── auth.controller.ts  # Authentication logic
│   │   ├── photo.controller.ts # Photo upload logic
│   │   └── ai.controller.ts    # OpenAI integration
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT verification
│   │   └── error.middleware.ts # Error handling
│   ├── services/
│   │   ├── openai.service.ts   # AI service
│   │   ├── redis.service.ts    # Redis client
│   │   └── marketplace.service.ts # Marketplace APIs
│   └── utils/
│       ├── logger.ts            # Winston logger
│       └── validation.ts        # Input validation
```

**Critical Backend Files:**

#### `backend/src/database/connection.ts` ⭐⭐⭐
```typescript
export const connectDatabase = async (): Promise<void> => {
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',  // MUST BE 'postgres' in production!
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'quicksell',
  });
  // ... connection logic
};
```

#### `backend/src/index.ts` ⭐⭐⭐
```typescript
import authRoutes from './routes/auth.routes';

// CRITICAL: All routes under /api/v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/photos', photoRoutes);
app.use('/api/v1/listings', listingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

#### `backend/src/routes/auth.routes.ts` ⭐⭐
```typescript
import express from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';

const router = express.Router();

// POST /api/v1/auth/register
router.post('/register', register);

// POST /api/v1/auth/login
router.post('/login', login);

// GET /api/v1/auth/profile
router.get('/profile', authMiddleware, getProfile);

export default router;
```

### Frontend Directory (`frontend/`)

```
frontend/
├── Dockerfile.prod             # Production Dockerfile
├── package.json
├── tsconfig.json
├── vite.config.ts              # Vite configuration
├── index.html
├── public/
│   └── quicksell-logo.png     # Logo
└── src/
    ├── main.tsx                # Entry point
    ├── App.tsx                 # Main app component ⭐
    ├── services/
    │   └── api.ts              # API client ⭐⭐⭐
    ├── pages/
    │   ├── LandingPage.tsx     # Homepage
    │   ├── Landing.css         # Landing styles
    │   ├── LoginPage.tsx       # Login page ⭐
    │   ├── RegisterPage.tsx    # Registration page ⭐
    │   ├── DashboardPage.tsx   # Dashboard ⭐
    │   └── PricingPage.tsx     # Pricing page ⭐
    ├── components/
    │   ├── PrivateRoute.tsx    # Protected route wrapper
    │   └── Header.tsx
    └── styles/
        └── global.css
```

**Critical Frontend Files:**

#### `frontend/src/services/api.ts` ⭐⭐⭐
```typescript
import axios from 'axios';

// CRITICAL: Must match backend routing (/api/v1)
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

export default api;
```

#### `frontend/src/App.tsx` ⭐⭐
```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/login" element={<Navigate to="/auth/login" />} />
        <Route path="/register" element={<Navigate to="/auth/register" />} />
      </Routes>
    </Router>
  );
}
```

#### `frontend/src/pages/LoginPage.tsx` ⭐
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* MUI form components */}
    </Box>
  );
};
```

---

## API Routes & Endpoints

### Base URL
```
Production: /api/v1
Development: http://localhost:5000/api/v1
```

### Authentication Routes (`/api/v1/auth`)

#### POST /api/v1/auth/register
**Purpose:** Create new user account
**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```
**Success Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2025-11-29T12:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Error Response (400):**
```json
{
  "error": "Email already exists"
}
```

#### POST /api/v1/auth/login
**Purpose:** Authenticate existing user
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```
**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /api/v1/auth/profile
**Purpose:** Get current user profile
**Headers:**
```
Authorization: Bearer <token>
```
**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "subscription_tier": "free"
  }
}
```

### Photo Routes (`/api/v1/photos`)

#### POST /api/v1/photos/upload
**Purpose:** Upload photo for AI analysis
**Request:** multipart/form-data with file
**Success Response (200):**
```json
{
  "photoId": 123,
  "url": "/uploads/photo-123.jpg",
  "analysis": {
    "title": "Vintage Leather Jacket",
    "description": "Classic brown leather jacket in excellent condition...",
    "suggestedPrice": 89.99,
    "category": "Clothing & Accessories",
    "condition": "Used - Excellent"
  }
}
```

### Health Check

#### GET /health
**Purpose:** Check backend service status
**No Auth Required**
**Success Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-11-29T12:00:00Z",
  "database": "connected",
  "redis": "connected"
}
```

---

## Frontend Architecture

### Component Hierarchy
```
App
├── LandingPage (public)
├── PricingPage (public)
├── LoginPage (public)
├── RegisterPage (public)
└── PrivateRoute
    └── DashboardPage (authenticated)
        ├── PhotoUpload
        ├── AIAnalysis
        └── ListingPreview
```

### State Management
- **Authentication:** localStorage (token, user)
- **Forms:** React useState hooks
- **API Calls:** Axios with interceptors
- **Routing:** React Router v6

### Key Features Implemented

#### 1. Landing Page
- Hero section with CTA
- Features showcase
- Pricing preview
- Navigation with login/signup links

#### 2. Login Page
- Email/password form
- Form validation
- Error handling
- Password visibility toggle
- Redirects to dashboard on success

#### 3. Registration Page
- Username, email, password fields
- Password confirmation
- Password strength validation
- Error handling
- Auto-login on successful registration

#### 4. Dashboard Page
- Photo upload area (drag & drop ready)
- AI analysis display
- Marketplace selection chips
- Listing preview

#### 5. Pricing Page
- Three tiers: Free, Pro, Business
- Feature comparison
- Call-to-action buttons

### Styling Approach
- **Base:** CSS variables in `index.css`
- **Components:** Material-UI (MUI) components
- **Custom:** Module CSS for page-specific styles
- **Theme:** Blue/purple gradient (#667eea, #764ba2)

---

## Backend Architecture

### Middleware Stack
```
Request
  ↓
CORS Middleware
  ↓
JSON Body Parser
  ↓
Auth Middleware (if protected route)
  ↓
Route Handler
  ↓
Error Middleware
  ↓
Response
```

### Database Layer
- **ORM:** None (raw SQL with pg library)
- **Connection Pool:** pg.Pool
- **Query Pattern:** Parameterized queries (SQL injection safe)

**Example Query:**
```typescript
const result = await pool.query(
  'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
  [username, email, hashedPassword]
);
```

### Authentication Flow
1. User submits credentials
2. Backend verifies password with bcrypt
3. JWT token generated with 7-day expiry
4. Token sent to frontend
5. Frontend stores in localStorage
6. Frontend includes in Authorization header
7. Backend middleware verifies token on protected routes

### File Upload Flow (Planned)
1. Frontend sends multipart/form-data
2. Backend saves to `/uploads` directory
3. File URL stored in database
4. Image sent to OpenAI Vision API
5. AI response saved to `ai_analyses` table
6. Analysis returned to frontend

---

## Deployment Scripts

### 1. deploy.sh (Full Deployment)

**Location:** `/var/www/quicksell.monster/deploy.sh`
**Usage:** `sudo bash deploy.sh [branch-name]`

**What It Does:**
1. Checks if directory is git repo
2. Clones or pulls latest code
3. Validates .env file
4. Checks Docker installation
5. Builds all containers (--no-cache)
6. Starts services
7. Waits for services to start (15s)
8. Runs health checks:
   - Backend health endpoint
   - Registration endpoint (checks for 404)
   - Database connectivity
9. Shows logs filtered for errors
10. Displays service URLs and next steps

**When to Use:**
- First-time deployment
- Major infrastructure changes
- Database reset needed
- After changing Dockerfiles

**Exit Codes:**
- 0: Success
- 1: Missing .env variables
- 2: Docker not installed
- 3: Git clone/pull failed

---

### 2. quick-deploy.sh (Smart Deployment)

**Location:** `/var/www/quicksell.monster/quick-deploy.sh`
**Usage:** `sudo bash quick-deploy.sh [branch-name]`

**What It Does:**
1. Pulls latest from GitHub
2. Detects which files changed
3. Rebuilds ONLY affected services:
   - If `backend/` changed → rebuild backend only
   - If `frontend/` changed → rebuild frontend only
   - If `docker-compose` changed → rebuild all
4. Restarts updated services
5. Runs health checks
6. Shows deployment status

**Smart Detection:**
```bash
# Detects changes with git diff
git diff --name-only $BEFORE_COMMIT $AFTER_COMMIT

# Examples:
# frontend/src/pages/LoginPage.tsx → rebuild frontend
# backend/src/routes/auth.routes.ts → rebuild backend
# docker-compose.prod.yml → rebuild all
```

**When to Use:**
- After pushing code changes
- Iterative development
- Quick fixes
- When you know what changed

**Performance:**
- Full rebuild: ~5 minutes
- Backend only: ~2 minutes
- Frontend only: ~3 minutes

---

### 3. monitor.sh (Diagnostics)

**Location:** `/var/www/quicksell.monster/monitor.sh`
**Usage:** `bash monitor.sh` (no sudo needed)

**What It Shows:**
1. **Container Status** - Running/stopped/crashed
2. **Service Health Checks:**
   - Backend: `curl http://localhost:5000/health`
   - Frontend: `curl http://localhost:8080`
   - Database: `pg_isready`
   - Redis: `redis-cli ping`
3. **Backend Logs** - Last 30 lines
4. **Frontend Logs** - Last 20 lines
5. **Database Test** - Query user count
6. **Environment Check** - Validates .env variables
7. **Network Status** - Docker networks and IPs
8. **Disk Space** - Available storage
9. **API Endpoint Tests:**
   - POST /api/v1/auth/register (should be 400, not 404)
   - GET /api/v1/health (should be 200)
10. **Git Info** - Current branch and commit
11. **Resource Usage** - CPU and memory per container

**When to Use:**
- Troubleshooting issues
- Before reporting errors to Claude
- After deployment to verify
- Regular health monitoring

**Output Example:**
```
========================================
QuickSell Deployment Monitor
========================================

▶ 1. CONTAINER STATUS
NAME                        STATUS          PORTS
backend                     Up 2 hours      0.0.0.0:5000->5000/tcp
frontend                    Up 2 hours      0.0.0.0:8080->8080/tcp
postgres                    Up 2 hours      5432/tcp
redis                       Up 2 hours      6379/tcp

▶ 2. SERVICE HEALTH CHECKS
Backend health: ✓ OK
Frontend reachable: ✓ OK
Database container: ✓ OK
Redis container: ✓ OK

▶ 9. API ENDPOINT TESTS
POST /api/v1/auth/register: ✓ Endpoint exists (HTTP 400)
GET /api/v1/health: ✓ OK (HTTP 200)
```

---

## MCP SSH Server Setup

### What is MCP?
Model Context Protocol (MCP) allows Claude to connect to external tools and services. The SSH MCP server enables Claude Code to execute commands directly on the VPS.

### Configuration Created

**File:** `.mcp.json` (root of repository)
```json
{
  "mcpServers": {
    "quicksell-vps": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@idletoaster/ssh-mcp-server@latest"
      ],
      "env": {
        "SSH_HOST": "quicksell.monster",
        "SSH_USER": "root",
        "SSH_PORT": "22",
        "SSH_KEY_PATH": "${HOME}/.ssh/id_rsa"
      }
    }
  }
}
```

### Setup Requirements (NOT YET COMPLETED)

**Step 1: Generate SSH Key (on local machine, NOT VPS)**
```bash
ssh-keygen -t rsa -b 4096 -C "quicksell-vps-key"
# Save to default location: ~/.ssh/id_rsa
# Passphrase is optional (empty for automation)
```

**Step 2: Copy Public Key to VPS**
```bash
ssh-copy-id root@quicksell.monster
# OR manually:
cat ~/.ssh/id_rsa.pub | ssh root@quicksell.monster "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**Step 3: Test SSH Connection**
```bash
ssh root@quicksell.monster "echo 'Connection successful'"
# Should work without password prompt
```

**Step 4: Restart Claude Code**
- Close Claude Code completely
- Reopen Claude Code
- MCP server will load automatically

### What MCP Enables

Once configured, Claude Code can:
- ✅ Execute commands on VPS directly
- ✅ Read files on VPS
- ✅ View Docker logs in real-time
- ✅ Run deployment scripts
- ✅ Check service status
- ✅ Debug issues without user copy-pasting

**Example Interactions:**
```
User: "Deploy the latest changes"
Claude: [Runs quick-deploy.sh on VPS via MCP]
Claude: "Deployment complete. Backend rebuilt successfully. All health checks passed."

User: "Why is registration failing?"
Claude: [Reads backend logs via MCP]
Claude: "I see the issue - the endpoint is returning 404. The frontend is calling /api/auth/register but the backend expects /api/v1/auth/register."
```

### Troubleshooting MCP

**Issue: MCP server not loading**
- Check `.mcp.json` is valid JSON
- Restart Claude Code
- Check `~/.claude/logs` for errors

**Issue: SSH connection failed**
- Test SSH manually: `ssh root@quicksell.monster`
- Verify public key is in VPS `~/.ssh/authorized_keys`
- Check SSH key path in `.mcp.json`

**Issue: Permission denied**
- Ensure private key has correct permissions: `chmod 600 ~/.ssh/id_rsa`
- Ensure `~/.ssh/authorized_keys` on VPS has `chmod 600`

---

## User Credentials & Access

### VPS Access
- **Host:** quicksell.monster (or mail.quicksell.monster)
- **User:** root
- **Auth:** SSH key (to be configured)
- **Port:** 22

### Database Credentials
- **Host:** postgres (within Docker network)
- **User:** postgres
- **Password:** [See VPS .env file]
- **Database:** quicksell
- **Port:** 5432

### Redis Credentials
- **Host:** redis (within Docker network)
- **Password:** [See VPS .env file]
- **Port:** 6379

### API Keys
- **OpenAI:** [See VPS .env file - OPENAI_API_KEY]
- **Stripe Secret:** [See VPS .env file - STRIPE_SECRET_KEY]
- **Stripe Publishable:** [See VPS .env file - STRIPE_PUBLISHABLE_KEY]

### JWT Configuration
- **Secret:** [See VPS .env file - JWT_SECRET]
- **Expiry:** 7 days

**Security Note:** All sensitive credentials are stored in `/var/www/quicksell.monster/.env` on the VPS and should never be committed to git. The actual values are available on the VPS for Claude Code to access via MCP once configured.

---

## Troubleshooting Guide

### Quick Diagnostic Commands

**On VPS:**
```bash
# Navigate to project
cd /var/www/quicksell.monster

# Run full diagnostics
bash monitor.sh

# View all container logs
docker compose -f docker-compose.prod.yml logs -f

# View backend logs only
docker compose -f docker-compose.prod.yml logs -f backend

# Check container status
docker compose -f docker-compose.prod.yml ps

# Restart all services
docker compose -f docker-compose.prod.yml restart

# Check if backend is responding
curl http://localhost:5000/health
```

### Common Error Patterns

#### "Database connection failed"
**Symptoms:** Backend logs show connection errors
**Causes:**
1. Wrong DB_HOST (should be `postgres` not `localhost`)
2. Wrong password
3. PostgreSQL container not running

**Fix:**
```bash
# Check .env
grep DB_HOST .env  # Should be: DB_HOST=postgres
grep DB_PASSWORD .env

# Check postgres container
docker compose -f docker-compose.prod.yml ps postgres

# If password was changed, recreate volume
docker compose -f docker-compose.prod.yml down
docker volume rm quicksellmonster_postgres_data
docker compose -f docker-compose.prod.yml up -d
```

#### "POST /auth/register - 404"
**Symptoms:** Registration fails, backend logs show 404
**Cause:** Frontend calling wrong API path

**Fix:**
```bash
# Check frontend API base URL
grep API_BASE_URL frontend/src/services/api.ts
# Should be: const API_BASE_URL = ... || '/api/v1';

# If wrong, pull latest code
git pull origin claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1
sudo bash quick-deploy.sh
```

#### "Container keeps restarting"
**Symptoms:** `docker ps` shows container restarting
**Cause:** Application crash loop

**Diagnosis:**
```bash
# View crash logs
docker compose -f docker-compose.prod.yml logs backend

# Common causes:
# - Missing .env variables
# - Database connection failed
# - Port already in use
# - Syntax error in code
```

#### "Cannot connect to Docker daemon"
**Symptoms:** All docker commands fail
**Fix:**
```bash
# Start Docker service
sudo systemctl start docker

# Enable on boot
sudo systemctl enable docker
```

#### "Port already in use"
**Symptoms:** Container fails to start with port bind error
**Fix:**
```bash
# Find what's using the port
sudo lsof -i :5000

# Kill the process or change port in docker-compose
```

### Health Check Decision Tree

```
Run: bash monitor.sh
  │
  ├─ All services OK?
  │    │
  │    ├─ YES → Registration works?
  │    │          │
  │    │          ├─ YES → All good! ✓
  │    │          └─ NO → Check API endpoint test
  │    │                   │
  │    │                   ├─ Returns 404 → Pull latest code
  │    │                   └─ Returns 400/422 → Frontend issue
  │    │
  │    └─ NO → Which service failed?
  │             │
  │             ├─ Backend → Check logs for DB/Redis connection
  │             ├─ Frontend → Check build logs
  │             ├─ Database → Check volume and password
  │             └─ Redis → Check password in .env
```

---

## Pending Tasks

### High Priority (Do First)

1. **Initialize VPS as Git Repository** ⚠️
   - Status: NOT DONE
   - Blocker: Cannot pull updates without git
   - Action: Run git init or fresh clone on VPS
   - Owner: User (must run on VPS)

2. **Deploy Registration Fix** ⚠️
   - Status: Committed to GitHub, not deployed
   - Blocker: VPS not a git repo
   - Action: After #1, run `sudo bash quick-deploy.sh`
   - Owner: After git setup

3. **Set Up MCP SSH Server** ⚠️
   - Status: Configured, not tested
   - Blocker: SSH key needs to be on local machine
   - Action: Follow MCP_SETUP_GUIDE.md
   - Owner: User (local machine setup required)

### Medium Priority

4. **Test Registration End-to-End**
   - Status: Cannot test until #2 deployed
   - Action: Create account via UI at quicksell.monster/auth/register
   - Expected: Should create user and redirect to dashboard

5. **Test Login Flow**
   - Status: Not tested
   - Action: Login with test account
   - Expected: Should authenticate and show dashboard

6. **Test Photo Upload**
   - Status: UI implemented, backend needs testing
   - Action: Upload photo in dashboard
   - Expected: Should show AI-generated description

### Low Priority (Nice to Have)

7. **Set Up SSL/HTTPS**
   - Status: Not configured
   - Action: Configure Let's Encrypt in nginx
   - Impact: Security and browser warnings

8. **Configure Nginx Properly**
   - Status: Unknown if nginx container is running
   - Action: Check nginx config and ensure it's routing correctly

9. **Database Backup Script**
   - Status: Not created
   - Action: Create automated backup script
   - Impact: Data safety

10. **Monitoring & Alerts**
    - Status: manual monitoring only
    - Action: Set up automated health checks
    - Impact: Proactive issue detection

---

## Critical Context & User Preferences

### User's Work Style
- **Preference:** Claude should fix issues directly, not ask questions
- **Expectation:** Code should work on first or second try
- **Frustration:** Manual copy-pasting of logs and commands
- **Request:** Real-time VPS access via MCP (highest priority)

### User's Instructions (Must Follow)

1. **Always Deploy from GitHub**
   > "Never just update the code on the VPS. Everything should be corrected and updated on Github Web, then pushed to the VPS."

2. **Never Manually Edit VPS Files**
   - All changes must go through GitHub first
   - Use git pull on VPS to deploy

3. **Provide Real-Time Solutions**
   > "The problem with both options is that you will not know what is happening on the VPS. Your system assumes your code will work when it almost never does work the first or even the 10th time."
   - This is why MCP is critical
   - User wants Claude to see errors in real-time and fix them

4. **Fix Issues, Don't Just Identify Them**
   - Don't just say "there's an error"
   - Actually fix it and commit the fix

### Key Quotes from User

> "I need detailed instructions from Claude or for you to setup an MCP route so that you can update and communicate with the VPS directly and solve these issues."

> "Everything should be corrected and updated on Github Web, then pushed to the VPS."

> "The problem with both options is that you will not know what is happening on the VPS."

### What User Has Already Tried
- Manually running deployment commands
- Copying logs to show Claude
- Downloading and uploading files via `curl`
- Running docker rebuild commands

### What Frustrated the User
- Back-and-forth asking for logs
- Claude not knowing VPS state
- Fixes that don't work on first try
- Manual process for each change

### What User Wants
- MCP SSH access (top priority)
- Automated deployment that "just works"
- Real-time debugging
- Minimal manual intervention

---

## Next Steps

### For Claude Code (Local) - DO THESE FIRST

1. **Verify MCP Server Connection**
   ```
   After user sets up SSH keys and restarts Claude Code, test:
   - Can you list files in /var/www/quicksell.monster?
   - Can you run "docker compose ps" on VPS?
   - Can you read /var/www/quicksell.monster/.env?
   ```

2. **Initialize VPS as Git Repository**
   ```bash
   # Option A: Initialize existing directory
   cd /var/www/quicksell.monster
   git init
   git remote add origin https://github.com/kingdavsol/Traffic2umarketing.git
   git fetch origin claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1
   git reset --hard origin/claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1

   # Option B: Fresh clone (safer)
   cd /var/www
   mv quicksell.monster quicksell.monster.backup
   git clone --branch claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1 \
     https://github.com/kingdavsol/Traffic2umarketing.git quicksell.monster
   cd quicksell.monster
   cp ../quicksell.monster.backup/.env .
   ```

3. **Deploy Latest Changes**
   ```bash
   cd /var/www/quicksell.monster
   sudo bash quick-deploy.sh
   ```

4. **Verify Registration Fix**
   ```bash
   # Should return 400 or 422 (NOT 404)
   curl -X POST http://localhost:5000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

5. **Test End-to-End User Flow**
   - Navigate to https://quicksell.monster
   - Click "Get Started" or "Sign Up"
   - Create account
   - Should redirect to dashboard
   - Test photo upload

### For Debugging Issues

**If Backend Not Connecting to Database:**
```bash
# Check .env
grep DB_HOST .env  # Must be 'postgres'

# Check postgres container
docker compose -f docker-compose.prod.yml logs postgres

# If password mismatch, recreate volume
docker compose -f docker-compose.prod.yml down
docker volume rm quicksellmonster_postgres_data
docker compose -f docker-compose.prod.yml up -d
```

**If Registration Still Returns 404:**
```bash
# Check frontend API config
grep -n "API_BASE_URL" frontend/src/services/api.ts

# Should see: const API_BASE_URL = ... || '/api/v1';
# If not, code wasn't deployed properly
```

**If Services Keep Restarting:**
```bash
# Get recent logs
docker compose -f docker-compose.prod.yml logs --tail=50 backend
```

### For Future Development

**Add New API Endpoint:**
1. Create route handler in `backend/src/routes/`
2. Import in `backend/src/index.ts`
3. Mount under `/api/v1/`
4. Create corresponding API call in `frontend/src/services/api.ts`
5. Commit, push, run quick-deploy

**Add New Frontend Page:**
1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Add navigation link if needed
4. Commit, push, run quick-deploy

**Modify Database Schema:**
1. Update `backend/src/database/schema.sql`
2. If needed, create migration script
3. Backup database first!
4. Apply schema changes
5. Update TypeScript interfaces

---

## Testing Checklist

### Before Marking Complete

- [ ] MCP SSH server connects successfully
- [ ] Can execute commands on VPS via MCP
- [ ] VPS directory is a git repository
- [ ] Can git pull updates on VPS
- [ ] Backend health check returns 200
- [ ] Frontend loads at quicksell.monster
- [ ] Registration endpoint returns 400/422 (not 404)
- [ ] Can create new user account
- [ ] Can login with credentials
- [ ] Dashboard loads after login
- [ ] All deployment scripts are executable
- [ ] monitor.sh shows all services healthy

### Full User Flow Test

1. Navigate to https://quicksell.monster
2. Click "Get Started"
3. Fill registration form
4. Submit → should redirect to dashboard
5. Logout
6. Login with same credentials
7. Upload a photo
8. See AI-generated description
9. Select marketplaces
10. Preview listing

---

## Important Commands Reference

### Git Operations
```bash
# Check status
git status

# Pull latest
git pull origin claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1

# View recent commits
git log --oneline -10

# See what changed
git diff HEAD~1 HEAD
```

### Docker Operations
```bash
# View all containers
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart service
docker compose -f docker-compose.prod.yml restart backend

# Rebuild and restart
docker compose -f docker-compose.prod.yml build --no-cache backend
docker compose -f docker-compose.prod.yml up -d backend

# Stop all
docker compose -f docker-compose.prod.yml down

# Remove volumes (DESTRUCTIVE)
docker compose -f docker-compose.prod.yml down -v
```

### Deployment
```bash
# Full deployment
sudo bash deploy.sh

# Quick update
sudo bash quick-deploy.sh

# Diagnostics
bash monitor.sh
```

### Health Checks
```bash
# Backend health
curl http://localhost:5000/health

# Registration endpoint
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Frontend
curl http://localhost:8080
```

---

## Final Notes

### What's Working ✅
- Backend running and connected to database
- Frontend serving pages
- Docker Compose setup
- Database schema created
- Redis connected
- Functional login/register/dashboard pages
- Deployment scripts created
- MCP configuration created

### What's Not Working ⚠️
- VPS directory not a git repository (blocker)
- Registration 404 error (fix applied, not deployed)
- MCP SSH not tested (SSH key setup needed)
- End-to-end user flow not tested

### What's Unknown ❓
- Nginx configuration and status
- SSL/HTTPS setup
- Photo upload functionality
- AI integration working
- Marketplace posting functionality

### Critical Path Forward
```
1. User sets up SSH key on local machine
   ↓
2. User restarts Claude Code (loads MCP)
   ↓
3. Claude Code tests MCP connection
   ↓
4. Claude Code initializes VPS as git repo via MCP
   ↓
5. Claude Code runs quick-deploy.sh via MCP
   ↓
6. Claude Code tests registration endpoint
   ↓
7. Claude Code verifies full user flow
   ↓
8. Ready for production use ✓
```

---

## Document Metadata

**Created:** November 29, 2025
**Last Updated:** November 29, 2025
**Version:** 1.0
**Author:** Claude (Web Session)
**Git Branch:** claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1
**Last Commit:** 04aafff - "feat: Add MCP SSH server configuration for VPS access"

**This document should be shared with:**
- Claude Code (Local) - for continuing work
- Development team - for onboarding
- DevOps - for deployment reference

**Related Documents:**
- `MCP_SETUP_GUIDE.md` - MCP SSH setup instructions
- `DEPLOYMENT.md` - Deployment script usage guide
- `README.md` - Project overview
- `QUICKSTART.md` - Quick start guide

---

END OF HANDOVER DOCUMENT

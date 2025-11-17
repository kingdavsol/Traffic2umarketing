# MenuQR.com - Handover Documentation

## App Overview
MenuQR is a QR code digital menu builder for restaurants, cafes, and food businesses. The platform allows businesses to create beautiful, mobile-optimized menus that customers can access by scanning a QR code, eliminating the need for physical menus.

**Value Proposition**: "Digital menus made simple. QR codes for restaurants."
**Target Market**: Restaurants, cafes, bars, food trucks, hotels
**Competitive Advantage**: Affordable pricing, easy to use, instant updates

## Domain & Access Information
- **Domain**: menuqr.com
- **Development Port**: 3007
- **Dev Command**: `npm run dev:menuqr` (from monorepo root)
- **App Directory**: `/apps/menuqr`

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Shared package (`@traffic2u/ui`)
- **Database**: Prisma + PostgreSQL (shared schema)
- **Authentication**: NextAuth.js (shared config)
- **QR Code Generation**: qrcode npm package
- **Image Upload**: Not yet configured (needs AWS S3 or Cloudinary)
- **Notifications**: react-hot-toast
- **Icons**: Lucide React

## Branding
- **Primary Color**: Red (#DC2626)
- **Logo**: QR code grid theme (200x200px)
- **Favicon**: Matching red theme (32x32px)
- **Files**: `apps/menuqr/public/{logo.svg, favicon.svg}`

## File Structure
```
apps/menuqr/
├── public/
│   ├── logo.svg
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Menu management
│   │   ├── admin/
│   │   │   └── page.tsx                  # Admin dashboard
│   │   ├── auth/
│   │   │   ├── signup/page.tsx
│   │   │   └── signin/page.tsx
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   ├── terms/
│   │   │   └── page.tsx
│   │   ├── menu/
│   │   │   └── [slug]/page.tsx          # Public menu view (TO BE IMPLEMENTED)
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts
│   │       │   └── register/route.ts
│   │       ├── menus/
│   │       │   ├── create/route.ts       # Create menu (TO BE IMPLEMENTED)
│   │       │   ├── update/route.ts       # Update menu (TO BE IMPLEMENTED)
│   │       │   └── delete/route.ts       # Delete menu (TO BE IMPLEMENTED)
│   │       └── qr/
│   │           └── generate/route.ts     # Generate QR code (TO BE IMPLEMENTED)
│   └── lib/
│       ├── prisma.ts
│       └── qr-generator.ts               # QR code generation utility
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── postcss.config.js
```

## Key Features Implemented

### ✅ Landing Page
- Hero section with red gradient theme
- Feature showcase (QR Code Generation, Mobile Optimized, Image Uploads, Instant Updates, Multi-Language)
- Use case examples (Restaurants, Cafes, Hotels, Food Trucks)
- 4-tier pricing section
- Customer testimonials
- CTA sections

### ✅ Authentication System
- User signup with validation
- User signin
- Password hashing
- Session management
- Protected routes
- Automatic free subscription

### ✅ Dashboard Features (Basic)
- Menu list view with mock data
- Menu cards showing:
  - Menu name
  - Number of items
  - View count (mock)
  - Last updated date
- "Edit" and "View QR" buttons (not functional yet)
- "Create Menu" button (no modal yet)

### ✅ Admin Dashboard
- User metrics (Total Users, Total Menus, Total QR Scans, Active Users)
- Recent activity monitoring
- User management
- Menu moderation

### ✅ Legal Pages
- Terms of Service
- Privacy Policy

### ✅ Pricing Structure
| Plan | Price/mo | Features |
|------|----------|----------|
| Free | $0 | 1 menu, Up to 20 items, 1,000 scans/month, Basic design, Email support |
| Starter | $9 | 3 menus, Unlimited items, 10,000 scans/month, Image uploads, Custom branding, Priority support |
| Professional | $19 | 10 menus, Unlimited scans, Multi-language support, Analytics, Custom domain, Allergen info, Dedicated support |
| Enterprise | $49 | Unlimited menus, White-label, Multi-location, API access, Team collaboration, SLA |

**Competitor Comparison**: Affordable compared to alternatives, with focus on simplicity

## Environment Variables Required

Create `.env.local` in `apps/menuqr/`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/traffic2u?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3007"

# Image Upload (choose one)
# Option 1: AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="menuqr-images"
AWS_REGION="us-east-1"

# Option 2: Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# QR Code Storage URL
NEXT_PUBLIC_QR_CODE_URL="https://qr.menuqr.com"

# Public Menu URL
NEXT_PUBLIC_MENU_URL="https://menu.menuqr.com"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Database Setup

### Additional Schema Needed
Add these models to the shared Prisma schema:

```prisma
// Add to packages/database/prisma/schema.prisma

model Restaurant {
  id              String    @id @default(cuid())
  userId          String
  name            String
  slug            String    @unique
  description     String?
  logoUrl         String?
  address         String?
  phone           String?
  email           String?
  website         String?
  primaryColor    String    @default("#DC2626")
  customDomain    String?   @unique
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  menus           Menu[]
  @@index([userId])
  @@index([slug])
}

model Menu {
  id              String    @id @default(cuid())
  restaurantId    String
  name            String
  slug            String
  description     String?
  language        String    @default("en")
  isActive        Boolean   @default(true)
  displayOrder    Int       @default(0)
  qrCodeUrl       String?
  viewCount       Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  restaurant      Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  categories      MenuCategory[]
  @@unique([restaurantId, slug])
  @@index([restaurantId])
}

model MenuCategory {
  id              String    @id @default(cuid())
  menuId          String
  name            String
  description     String?
  displayOrder    Int       @default(0)
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  menu            Menu      @relation(fields: [menuId], references: [id], onDelete: Cascade)
  items           MenuItem[]
  @@index([menuId])
}

model MenuItem {
  id              String    @id @default(cuid())
  categoryId      String
  name            String
  description     String?
  price           Float
  currency        String    @default("USD")
  imageUrl        String?
  isAvailable     Boolean   @default(true)
  isVegetarian    Boolean   @default(false)
  isVegan         Boolean   @default(false)
  isGlutenFree    Boolean   @default(false)
  allergens       String[]  // Array of allergen names
  calories        Int?
  displayOrder    Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  category        MenuCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  @@index([categoryId])
}

model MenuView {
  id              String    @id @default(cuid())
  menuId          String
  viewedAt        DateTime  @default(now())
  userAgent       String?
  ipAddress       String?
  country         String?
  @@index([menuId])
  @@index([viewedAt])
}
```

## Development Setup

```bash
# 1. Navigate to monorepo root
cd /home/user/Traffic2umarketing

# 2. Install dependencies
npm install

# 3. Install qrcode package
cd apps/menuqr
npm install qrcode @types/qrcode

# 4. Update Prisma schema
cd ../../packages/database
# Add Restaurant, Menu, MenuCategory, MenuItem, MenuView models

# 5. Generate Prisma client
npx prisma generate

# 6. Create migration
npx prisma migrate dev --name add_menuqr_models

# 7. Create environment file
cd ../../apps/menuqr
cp .env.example .env.local
# Edit .env.local

# 8. Start development server
npm run dev:menuqr

# App available at http://localhost:3007
```

## API Endpoints (To Be Implemented)

### POST /api/menus/create
Create new menu
```typescript
// Request
{
  "restaurantId": "clu...",
  "name": "Dinner Menu",
  "language": "en",
  "categories": [
    {
      "name": "Appetizers",
      "items": [
        {
          "name": "Bruschetta",
          "description": "Toasted bread with tomatoes",
          "price": 8.99,
          "imageUrl": "https://...",
          "isVegetarian": true
        }
      ]
    }
  ]
}

// Response
{
  "success": true,
  "menuId": "clu...",
  "slug": "dinner-menu",
  "qrCodeUrl": "https://qr.menuqr.com/dinner-menu.png"
}
```

### POST /api/qr/generate
Generate QR code for menu
```typescript
// Request
{
  "menuId": "clu...",
  "size": 512,  // QR code size in pixels
  "format": "png"  // png or svg
}

// Response
{
  "success": true,
  "qrCodeUrl": "https://qr.menuqr.com/clu....png",
  "downloadUrl": "https://qr.menuqr.com/clu....png?download=true"
}
```

### GET /menu/[slug]
Public menu view (customer-facing)
```typescript
// Shows menu items grouped by category
// Mobile-optimized design
// Tracks view in MenuView table
```

### POST /api/menus/update
Update menu items
```typescript
// Request
{
  "menuId": "clu...",
  "updates": {
    "name": "Updated Menu Name",
    "categories": [...]
  }
}

// Response
{
  "success": true,
  "message": "Menu updated successfully"
}
```

### POST /api/analytics/track-view
Track menu view (called when QR code is scanned)
```typescript
// Request
{
  "menuId": "clu...",
  "userAgent": "...",
  "ipAddress": "..."
}

// Response
{
  "success": true
}
```

## Known Limitations & Issues

### 🔴 Critical - Not Implemented
1. **Menu Creation Interface**: No form to create menus
   - Need restaurant/business setup form
   - Need menu builder interface
   - Need category management
   - Need item management (CRUD)
   - Need image upload for menu items
   - File to create: `apps/menuqr/src/components/MenuBuilder.tsx`

2. **Public Menu View**: No customer-facing page
   - Need mobile-optimized menu display
   - Need category navigation
   - Need search/filter
   - Need responsive design (mobile-first)
   - File to create: `apps/menuqr/src/app/menu/[slug]/page.tsx`

3. **QR Code Generation**: Not implemented
   - Need to generate QR codes using `qrcode` library
   - Need to store QR codes (S3 or file system)
   - Need printable QR code formats (PDF, PNG)
   - Need customization (colors, logo)
   - File to create: `apps/menuqr/src/lib/qr-generator.ts`

4. **Image Upload**: Not set up
   - Need image upload for menu items
   - Need image compression
   - Need CDN for images
   - Consider AWS S3 or Cloudinary

### 🟡 Medium Priority
5. **Menu Analytics**: Basic view count only
   - Need detailed analytics dashboard
   - Need to track popular items
   - Need time-based analytics (peak hours)
   - Need geographic data

6. **Multi-Language Support**: Mentioned in Pro plan
   - Need language selector
   - Need menu translations
   - Need RTL support for Arabic, Hebrew

7. **Custom Domain**: Pro feature not implemented
   - Need DNS configuration
   - Need SSL certificates
   - Need subdomain routing

### 🟢 Nice to Have
8. **Allergen Information**: Pro feature mentioned
9. **Nutritional Info**: Calories, macros
10. **Menu Themes**: Different design templates
11. **Print-Friendly QR Codes**: Table tents, stickers
12. **Multi-Location**: Enterprise feature
13. **API Access**: Enterprise feature

## Suggested Next Steps for Improvements

### Phase 1: Core Menu Functionality (High Priority)
1. **Build Menu Builder**
   - Create restaurant/business setup form
   - Build menu creation wizard
   - Add category management (add, edit, delete, reorder)
   - Add item management (add, edit, delete, reorder)
   - Add drag-and-drop reordering
   - Add bulk import from CSV
   - Add price management with currency support

2. **Implement Image Upload**
   - Choose image service (S3 recommended)
   - Build image upload component
   - Implement image compression (sharp or similar)
   - Generate thumbnails
   - CDN integration for fast loading
   - Allow multiple images per item

3. **Create Public Menu Page**
   - Build mobile-first responsive design
   - Display categories and items
   - Add search functionality
   - Add category filtering
   - Add dietary filter (vegetarian, vegan, gluten-free)
   - Add allergen warnings
   - Track views in database
   - SEO optimization (meta tags, schema.org)

### Phase 2: QR Codes & Distribution (Medium Priority)
4. **Generate QR Codes**
   - Use `qrcode` npm package
   - Generate QR code for each menu
   - Support multiple sizes (256, 512, 1024)
   - Support PNG and SVG formats
   - Add custom colors
   - Add restaurant logo to center of QR code
   - Store QR codes in S3/CDN

5. **Printable Materials**
   - Generate PDF with QR code (using puppeteer or similar)
   - Create table tent template
   - Create sticker template
   - Create poster template
   - Allow custom text ("Scan for Menu")

6. **Analytics Dashboard**
   - Track total scans over time
   - Show popular items
   - Show peak hours/days
   - Show geographic data (if available)
   - Export analytics to CSV

### Phase 3: Advanced Features (Nice to Have)
7. **Multi-Language Support**
   - Add language field to Menu model
   - Create translation interface
   - Auto-detect user language
   - Language switcher in menu
   - Support major languages (ES, FR, DE, ZH, JA)

8. **Menu Customization**
   - Custom color themes
   - Custom fonts
   - Background images
   - Layout options (grid, list, compact)
   - Logo placement

9. **Advanced Item Features**
   - Item variations (size, extras)
   - Item modifiers (add-ons)
   - Combo meals
   - Daily specials
   - Limited availability scheduling
   - Sell out notifications

10. **Multi-Location Support**
    - Manage multiple restaurant locations
    - Location-specific menus
    - Centralized updates
    - Location analytics
    - Franchise management

## Testing Strategy

### Unit Tests
- Test QR code generation
- Test image upload and compression
- Test menu CRUD operations
- Test view tracking

### Integration Tests
- Test menu creation workflow
- Test public menu display
- Test QR code scanning
- Test analytics tracking

### Manual Testing Checklist
- [ ] User can create restaurant profile
- [ ] User can create menu with categories
- [ ] User can add menu items
- [ ] User can upload item images
- [ ] Images are compressed and optimized
- [ ] QR code is generated correctly
- [ ] Scanning QR code leads to menu
- [ ] Menu displays correctly on mobile
- [ ] Menu displays correctly on desktop
- [ ] Search works
- [ ] Filters work
- [ ] Views are tracked accurately
- [ ] User can edit menu
- [ ] User can delete items
- [ ] User can reorder items

## Deployment Considerations

### CDN for Images and QR Codes
- Use CloudFront, Cloudflare, or Vercel CDN
- Configure caching headers (1 year for QR codes, 1 day for menu images)
- Enable automatic image optimization

### DNS Configuration
- Main app: menuqr.com
- Public menus: menu.menuqr.com or [slug].menuqr.com
- QR codes: qr.menuqr.com

### Environment Variables for Production
All development variables plus:
```env
NEXT_PUBLIC_APP_URL="https://menuqr.com"
NEXT_PUBLIC_MENU_URL="https://menu.menuqr.com"
NEXT_PUBLIC_QR_CODE_URL="https://qr.menuqr.com"
CDN_URL="https://cdn.menuqr.com"
```

### Performance Requirements
- Public menu load time: <2 seconds
- QR code generation: <1 second
- Image upload: Support up to 10MB files
- Handle 1000+ concurrent menu views

### Monitoring
- Track menu view errors
- Monitor QR code generation failures
- Track image upload success rate
- Monitor CDN performance

## Performance Optimization

### Current Performance
- Dashboard loads mock data instantly

### Optimization Opportunities
1. **Public Menu Page**
   - Use Next.js ISR (Incremental Static Regeneration)
   - Cache menu data (revalidate every 60 seconds)
   - Optimize images with Next.js Image component
   - Lazy load images below the fold

2. **Image Optimization**
   - Compress images on upload (sharp library)
   - Generate WebP format
   - Create responsive image sizes
   - Use CDN for delivery

3. **QR Code Caching**
   - Generate QR code once, store in S3
   - Cache QR codes at edge (CDN)
   - Only regenerate when menu URL changes

4. **Database Queries**
   - Index on slug, restaurantId
   - Use connection pooling
   - Cache frequently accessed menus

## Security Considerations

### Current Security Measures
✅ Password hashing
✅ JWT sessions

### Security Improvements Needed
- [ ] Rate limiting on public menu views (prevent scraping)
- [ ] Validate uploaded images (file type, size)
- [ ] Scan uploaded images for malware
- [ ] CSRF protection
- [ ] Sanitize menu content (prevent XSS)
- [ ] Implement content moderation
- [ ] Audit logs for menu changes
- [ ] Backup menus regularly

### Image Upload Security
- Validate file types (JPEG, PNG, WebP only)
- Limit file size (10MB max)
- Strip EXIF data (privacy)
- Scan for viruses/malware (ClamAV)
- Use signed URLs for uploads

## Support & Maintenance

### Common Issues & Solutions
1. **"QR code not working"**: Check menu URL, check menu is active
2. **"Image upload failed"**: Check file size, check format, check S3 credentials
3. **"Menu not displaying"**: Check slug, check isActive flag
4. **"Slow loading"**: Check image sizes, enable CDN
5. **"Items out of order"**: Check displayOrder field

### Restaurant-Specific Considerations
- Busy hours: lunch (11am-2pm), dinner (6pm-9pm)
- Mobile-first design critical (customers scan with phones)
- Clear pricing important
- High-quality food images increase orders
- Allergen info legally required in some regions

### Monitoring Alerts
- Menu view failures
- Image upload failures
- QR code generation failures
- CDN errors
- Database connection errors

### Contact Information
- Support: support@menuqr.com (not configured)
- Privacy: privacy@menuqr.com (not configured)
- Legal: legal@menuqr.com (not configured)

## Handover Checklist

Before next session:
- [ ] All dependencies installed
- [ ] qrcode package installed
- [ ] Database schema updated with Restaurant, Menu, MenuItem models
- [ ] Image upload service chosen (S3 or Cloudinary)
- [ ] Environment variables configured
- [ ] App starts without errors
- [ ] Can create account and sign in
- [ ] Dashboard displays correctly
- [ ] Decided on public menu URL structure
- [ ] Reviewed QR code best practices

## Conclusion

MenuQR.com addresses a practical need for restaurants post-COVID: touchless menus. The product is straightforward, the market is large, and the pricing is accessible for small businesses.

**Estimated completion**: 30% of production-ready features
**Next priority**: Menu builder and public menu page
**Time to production**: 4-6 weeks with focused development
**Technical complexity**: Low-Medium (mostly CRUD operations and QR generation)

The key to success is simplicity. Restaurant owners are not tech-savvy, so the menu creation process must be intuitive. Mobile optimization is critical since customers scan QR codes with their phones.

---

*Last Updated: 2024-03-20*
*Version: 1.0*
*Author: AI Development Team*

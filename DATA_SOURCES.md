# Car Maintenance Hub - Vehicle Data Sources

This guide documents all available vehicle data sources and how to integrate them into the application.

## Free/Open Data Sources

### 1. NHTSA (National Highway Traffic Safety Administration)
**URL**: https://api.nhtsa.gov/api/vehicles

**What it provides**:
- Vehicle makes, models, and years
- Vehicle specifications (engine type, transmission, fuel type, etc.)
- Safety information
- Recall data
- Complaints database

**API Endpoints**:
```
GET /api/vehicles/GetMakesForYear?year=2023
GET /api/vehicles/GetModelsForMakeYear?make=Toyota&modelyear=2023
GET /api/vehicles/GetVehicleDetailsForYear?make=Toyota&model=Camry&year=2023
GET /api/vehicles/GetComplaints?make=Toyota&model=Camry
GET /api/vehicles/GetRecalls?make=Toyota
```

**Free**: Yes
**Rate Limit**: Reasonable, no key required
**Data Quality**: Official government data, very reliable

---

### 2. OpenWeather & EPA
**URL**: https://www.epa.gov/fueleconomy/find-a-car

**What it provides**:
- Fuel economy data
- EPA classifications
- CO2 emissions
- Annual fuel cost

**Free**: Yes (via web scraping or their API)
**Rate Limit**: Check their terms
**Data Quality**: Official government data

---

### 3. Wikipedia/DBpedia
**URL**: http://dbpedia.org/

**What it provides**:
- Historical vehicle data
- Specifications
- Production years
- General information

**Free**: Yes
**Rate Limit**: Standard web scraping rules
**Data Quality**: Community-maintained, variable

---

### 4. CarMD API (Freemium)
**URL**: https://www.carmd.com/

**What it provides**:
- Common car problems by make/model/year
- Engine light issues
- Repair costs

**Free Tier**: Limited queries
**Paid Tier**: $0.10-0.50 per API call
**Data Quality**: Excellent - real repair shop data

---

## Paid APIs (Recommended for Production)

### 1. RockAuto (Web Scraping)
**URL**: https://www.rockauto.com

**What it provides**:
- Auto parts catalog (huge database)
- Pricing (frequently updated)
- Availability status
- Compatible vehicle models
- OEM and aftermarket parts

**Scraping Method**:
- Selenium/Puppeteer for dynamic content
- BeautifulSoup for HTML parsing
- Check robots.txt and terms of service

**Pricing**: Free (via scraping) but be respectful of server load
**Rate Limiting**: Implement delays between requests (2-5 seconds)
**Legal**: Check their ToS - most allow reasonable scraping

**Example Parts Categories**:
- Belts & Hoses
- Brakes
- Cooling
- Electrical
- Engine
- Exhaust
- Filters (oil, air, cabin)
- Fluids
- Fuel System
- Suspension
- Transmission
- Steering
- Wheels & Tires

---

### 2. Edmunds API
**URL**: https://developer.edmunds.com/

**What it provides**:
- Vehicle specifications
- Common problems
- Maintenance schedules
- Interior/exterior photos
- Recall information
- Market value (in some tiers)

**Cost**: Free tier available, paid for higher limits
**Rate Limit**: Varies by tier
**Data Quality**: Excellent, comprehensive

**Registration**: Required, free developer account

---

### 3. Kelley Blue Book (KBB)
**URL**: https://www.kbb.com/

**What it provides**:
- Vehicle valuation
- Trade-in values
- Private party values
- Market data
- Historical pricing

**Method**: Web scraping (check ToS)
**Cost**: Free via scraping
**Data Quality**: Industry standard for valuations

---

### 4. NADA Guides
**URL**: https://www.nadaguides.com/

**What it provides**:
- Vehicle pricing
- Valuation guides
- Depreciation data
- Condition adjustments
- Regional pricing differences

**Method**: Web scraping or API (check with provider)
**Cost**: Free/Paid depending on usage
**Data Quality**: Highly trusted, detailed

---

### 5. AutoTrader API (Limited)
**URL**: https://www.autotrader.com/

**What it provides**:
- Market listings
- Pricing trends
- Inventory data
- Regional market data

**Method**: Web scraping or partnership
**Cost**: Typically requires partnership
**Data Quality**: Real-time market data

---

## Specialized Data Sources

### Common Problems Database

**Option 1: Build Your Own from Communities**
- Reddit: r/Cartalk, model-specific subreddits
- Owner forums (Toyota, Honda, Ford forums)
- YouTube repair channels
- Mechanical knowledge bases

**Option 2: Use CarMD API**
- Real repair shop data
- Specific failure rates
- Cost information

**Option 3: Combine Multiple Sources**
- NHTSA complaints database
- Edmunds common problems
- User forums

---

### Tire Data

**Option 1: Tire Manufacturers**
- Michelin, Bridgestone, Goodyear, Continental APIs
- Check if they have B2B programs

**Option 2: Tire Retailers**
- Discount Tire / America's Tire
- Tire Rack (check their API/affiliate program)
- Costco Tire Center
- Walmart Auto

**Option 3: Web Scraping**
- Tire Rack: https://www.tirerack.com/
- TiresDirect
- Amazon Automotive

---

### Modification Data

**Option 1: Community Knowledge**
- Reddit: r/cars, model subreddits
- YouTube: Car modification channels
- Enthusiast forums
- Instagram: Car modification pages

**Option 2: Aftermarket Retailers**
- Summit Racing
- CJPonyParts
- FCP Euro
- Ebay Motors

**Option 3: Build Curated Database**
- Most popular modifications per model
- Cost estimates from multiple sources
- DIY difficulty ratings
- User reviews

---

## Data Integration Strategy

### Phase 1: Foundation (Weeks 1-2)
1. Integrate NHTSA API for makes/models/years
2. Add EPA fuel economy data (scraping)
3. Basic problem database (manual seeding)
4. RockAuto parts (web scraping)

### Phase 2: Enhancement (Weeks 3-4)
1. CarMD API for common problems
2. KBB valuations (scraping or API)
3. Edmunds API integration
4. Tire data integration

### Phase 3: Optimization (Weeks 5+)
1. Caching system (Redis)
2. Background jobs for data updates
3. API aggregation and deduplication
4. User review system

---

## Implementation Examples

See `apps/api/src/services/` for:
- `nhtsa.service.ts` - NHTSA API integration
- `rockauto.scraper.ts` - RockAuto web scraping
- `edmunds.service.ts` - Edmunds API integration
- `valuation.service.ts` - KBB/NADA scraping
- `problems.scraper.ts` - Problem data collection

---

## Rate Limiting & Caching

### Recommended Approach
```
NHTSA API → Cache for 1 week
RockAuto Parts → Cache for 1 day (prices change frequently)
Vehicle Valuations → Cache for 1 month
Common Problems → Cache for 1 month
Tire Data → Cache for 1 week
```

### Tools
- **Redis**: In-memory caching
- **NodeJS Rate Limiter**: Control API request rates
- **Queue System**: Background jobs for data updates (Bull, RabbitMQ)

---

## Legal & Ethical Considerations

### Scraping Best Practices
1. ✅ Check the website's `robots.txt`
2. ✅ Review Terms of Service
3. ✅ Respect rate limits (add delays)
4. ✅ Use appropriate User-Agent headers
5. ✅ Cache data to reduce requests
6. ✅ Provide attribution when required
7. ✅ Don't overload servers with scraping

### APIs to Avoid Scraping
- Google (they explicitly forbid it)
- LinkedIn (legal issues)
- Facebook (terms violation)
- Protected content (paywalls)

### Recommended Approach
1. Use official APIs when available
2. Get permission for high-volume scraping
3. Consider partnerships for premium data
4. Always have a fallback data source

---

## Data Quality Assurance

### Validation Steps
1. **Schema Validation**: Ensure data matches database structure
2. **Duplicate Detection**: Remove duplicate parts/tires
3. **Price Sanity Check**: Flag unusually low/high prices
4. **Availability Check**: Verify part is actually in stock
5. **Freshness Check**: Update stale data

### Monitoring
- Track API response times
- Monitor error rates
- Alert on missing/stale data
- Log all scraping activities

---

## Cost Estimation

### Free Option (Basic)
- NHTSA: Free ✅
- EPA Data: Free ✅
- RockAuto Scraping: Free ✅
- Manual Problem Database: Time investment
- **Total**: $0/month

### Freemium Option (Recommended)
- NHTSA: Free ✅
- Edmunds API: Free tier ✅
- CarMD API: ~$100-500/month (optional)
- RockAuto Scraping: Free ✅
- Redis Hosting: $5-50/month
- **Total**: $5-550/month

### Premium Option (Enterprise)
- Multiple paid APIs: $500-2000/month
- Dedicated data team: $3000-10000/month
- Real-time data feeds: $1000-5000/month
- **Total**: $4500-17000+/month

---

## Recommended Starting Stack

```
1. NHTSA API (free) → Vehicle makes/models/specs
2. EPA Data (free) → Fuel economy
3. RockAuto Scraping (free) → Parts and pricing
4. Manual Problem Database (initial) → Common issues
5. Edmunds Free API (free) → Additional specs
6. KBB Scraping (free) → Valuations
7. Redis (cheap) → Caching
```

This gives you 90% of functionality for ~$50-100/month in hosting costs.

---

## Next Steps

1. Set up accounts for free APIs
2. Review each API's documentation
3. Implement services one by one
4. Test data quality
5. Set up caching layer
6. Schedule background jobs for updates
7. Build admin dashboard for data management

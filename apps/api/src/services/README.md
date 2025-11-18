# Data Integration Services

This directory contains services for integrating various vehicle data sources into the Car Maintenance Hub application.

## Available Services

### NHTSA Service (`nhtsa.service.ts`)

Integrates with the National Highway Traffic Safety Administration API to get official vehicle data.

**Features:**
- Get all vehicle makes
- Get models by year and make
- Get detailed vehicle specifications
- Get safety complaints
- Get recall information
- Built-in caching (7 days TTL)

**Usage:**
```typescript
import nhtsaService from './nhtsa.service';

// Get all makes
const makes = await nhtsaService.getMakes();

// Get models for 2023 Toyota
const models = await nhtsaService.getModelsForMakeYear('Toyota', 2023);

// Get vehicle details
const details = await nhtsaService.getVehicleDetails('Toyota', 'Camry', 2023);
const specs = nhtsaService.parseVehicleDetails(details);

// Get complaints and recalls
const complaints = await nhtsaService.getComplaints('Toyota', 'Camry');
const recalls = await nhtsaService.getRecalls('Toyota');
```

**API Endpoints:**
- `GET /api/vehicles/GetAllMakes`
- `GET /api/vehicles/GetModelsForMakeYear`
- `GET /api/vehicles/GetVehicleDetailsForYear`
- `GET /api/vehicles/GetComplaints`
- `GET /api/vehicles/GetRecalls`

**Rate Limits:** Reasonable, no API key required
**Cost:** Free

---

### RockAuto Scraper Service (`rockauto.scraper.ts`)

Web scraper for RockAuto.com to get parts and pricing information.

**Features:**
- Search parts by vehicle and category
- Get common maintenance parts
- Tire information
- Part categories listing
- Built-in caching (24 hours TTL)
- Rate limiting (2-5 second delays)

**Usage:**
```typescript
import rockAutoService from './rockauto.scraper';

// Search parts
const parts = await rockAutoService.searchParts(2023, 'Toyota', 'Camry', 'Filters');

// Get maintenance parts
const oils = rockAutoService.getCommonMaintenanceParts('oil');
const filters = rockAutoService.getCommonMaintenanceParts('filters');

// Get tires
const tires = await rockAutoService.getTires(2023, 'Toyota', 'Camry');

// Get part categories
const categories = rockAutoService.getPartCategories();
```

**Rate Limiting:** 2 second delay between requests (respects server)
**Cost:** Free (web scraping)
**Legal:** Check RockAuto's robots.txt and ToS

**Part Categories:**
- Engine, Transmission, Cooling, Fuel, Ignition
- Emission, Exhaust, Suspension, Steering, Brakes
- Tires & Wheels, Belts & Hoses, Filters, Fluids
- Electrical, Body, Interior

---

### Valuation Service (`valuation.service.ts`)

Calculate vehicle valuations based on year, mileage, and condition.

**Features:**
- Estimate private party value
- Calculate trade-in value
- Get price range
- Compare two vehicles
- Get depreciation curves
- Find best value year models
- Get market trends

**Usage:**
```typescript
import valuationService from './valuation.service';

// Get valuation
const valuation = await valuationService.getValuation({
  year: 2015,
  make: 'Toyota',
  model: 'Camry',
  mileage: 85000,
  condition: 'good'
});

console.log(valuation.estimatedValue); // $15,000
console.log(valuation.priceRange); // { low: $13,500, high: $16,500 }

// Get trade-in value (typically 75% of private party)
const tradeInValue = valuationService.getTradeInValue(valuation.estimatedValue);

// Get depreciation curve
const curve = valuationService.getDepreciationCurve(2015, 'Toyota', 'Camry');

// Find best value years (3-10 year old vehicles)
const bestValues = valuationService.getBestValueYears('Toyota', 'Camry');
```

**Depreciation Model:**
- Year 1: 15% depreciation
- Years 2-5: 10% per year
- Years 6-10: 7% per year
- Years 10+: 5% per year
- Mileage: $0.20 per mile
- Condition multipliers: Poor (0.7x), Fair (0.85x), Good (1.0x), Excellent (1.15x)

**Data Sources:** Base values from NHTSA and market data (can be updated from KBB)
**Cost:** Free (calculated) or Paid (if using actual KBB/Edmunds data)

---

## Caching Strategy

All services include built-in caching with appropriate TTLs:

| Service | TTL | Rationale |
|---------|-----|-----------|
| NHTSA Makes/Models | 7 days | Rarely changes |
| NHTSA Details | 7 days | Static vehicle specs |
| RockAuto Parts | 24 hours | Prices change frequently |
| Tires | 7 days | Inventory changes daily |
| Valuations | 30 days | Market relatively stable |
| Problems | 30 days | Problems don't change quickly |

**Manual Cache Management:**
```typescript
// Clear specific cache
nhtsaService.clearCache();
rockAutoService.clearCache();

// Global cache cleanup
import { vehicleCache, problemsCache } from '../utils/cache';
vehicleCache.clear();
problemsCache.cleanup();
```

---

## Rate Limiting

Services implement rate limiting to respect external servers:

```typescript
import { rockAutoLimiter, externalApiLimiter, withRateLimit } from '../utils/rateLimiter';

// The scraper automatically handles rate limiting
const parts = await rockAutoService.searchParts(2023, 'Toyota', 'Camry', 'Filters');

// Manual rate limiting for external APIs
const data = await withRateLimit('user-123', externalApiLimiter, async () => {
  return await fetchFromExternalAPI();
}, 3); // Max 3 retries
```

---

## Database Seeding

Seed the database with initial data:

```bash
cd packages/database
npm run db:seed
```

The seeder will populate:
- Common problems by vehicle
- Parts and components
- Tires and recommendations
- Vehicle modifications
- Maintenance guides

---

## Integration with Routes

Use services in API routes:

```typescript
// In apps/api/src/routes/vehicles.ts
import nhtsaService from '../services/nhtsa.service';
import rockAutoService from '../services/rockauto.scraper';
import valuationService from '../services/valuation.service';

router.get('/makes', async (req, res) => {
  const makes = await nhtsaService.getMakes();
  res.json({ success: true, data: makes });
});

router.get('/:make/:model/:year/parts/:category', async (req, res) => {
  const { make, model, year, category } = req.params;
  const parts = await rockAutoService.searchParts(
    parseInt(year),
    make,
    model,
    category
  );
  res.json({ success: true, data: parts });
});

router.get('/valuation/:make/:model/:year', async (req, res) => {
  const { make, model, year } = req.params;
  const { mileage, condition = 'good' } = req.query;

  const valuation = await valuationService.getValuation({
    year: parseInt(year),
    make,
    model,
    mileage: parseInt(mileage as string),
    condition: condition as any
  });

  res.json({ success: true, data: valuation });
});
```

---

## Planned Integrations

### Edmunds API (Free tier available)
```typescript
// edmunds.service.ts (planned)
const specs = await edmudsService.getVehicleSpecs(year, make, model);
const problems = await edmudsService.getCommonProblems(year, make, model);
const maintenance = await edmudsService.getMaintenanceSchedule(year, make, model);
```

### Kelley Blue Book (Web scraping)
```typescript
// kbb.scraper.ts (planned)
const valuations = await kbbService.getValuations(year, make, model, mileage);
const marketTrend = await kbbService.getMarketTrend(make, model);
```

### Tire Retailers
```typescript
// tire-retailers.service.ts (planned)
const discountTires = await tireRetailersService.search('215/55R16');
const costcoTires = await tireRetailersService.getCostcoTires('Camry 2015');
```

---

## Best Practices

1. **Always cache data** when possible
2. **Respect rate limits** - use delays for web scraping
3. **Handle API errors gracefully** - return empty data, not errors
4. **Log all API calls** for debugging
5. **Update data regularly** - schedule background jobs
6. **Monitor API health** - track response times and errors
7. **Use user-agent headers** when scraping
8. **Check robots.txt** before scraping
9. **Provide attribution** when required
10. **Test with small datasets** before full implementation

---

## Troubleshooting

### No data returned
1. Check cache - may be expired
2. Verify API/service is online
3. Check rate limiting - may be throttled
4. Review error logs

### Rate limiting errors
1. Increase delay between requests
2. Implement exponential backoff
3. Use caching to reduce API calls
4. Consider using proxies (ethically)

### Stale data
1. Reduce cache TTL
2. Manually trigger refresh
3. Implement background jobs
4. Monitor data freshness

---

## Support

For issues or questions about data integration:
1. Check service documentation
2. Review error logs
3. Test with sample data
4. Contact API providers

## References

- [NHTSA API Documentation](https://vpic.nhtsa.dot.gov/api/)
- [RockAuto](https://www.rockauto.com/)
- [Edmunds Developer](https://developer.edmunds.com/)
- [Kelley Blue Book](https://www.kbb.com/)

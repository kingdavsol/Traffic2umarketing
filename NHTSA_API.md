# NHTSA API Integration Guide

Complete documentation for the NHTSA (National Highway Traffic Safety Administration) vehicle data integration.

## Overview

The NHTSA API provides official government vehicle data including:
- Vehicle makes and models
- Technical specifications
- Safety complaints
- Recall information

**Base URL**: `http://localhost:3001/api/nhtsa`

**Data Source**: https://api.nhtsa.gov/api/vehicles

**Cache Duration**:
- Makes/Models: 7 days
- Specifications: 7 days
- Complaints/Recalls: 1 day

---

## API Endpoints

### 1. Get All Vehicle Makes

**Endpoint**: `GET /makes`

**Description**: Retrieve all available vehicle makes from NHTSA database.

**Query Parameters**: None

**Example Request**:
```bash
curl http://localhost:3001/api/nhtsa/makes
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "Make_ID": 440,
      "Make_Name": "Toyota"
    },
    {
      "Make_ID": 474,
      "Make_Name": "Honda"
    },
    ...
  ],
  "count": 1000,
  "message": "Successfully retrieved all vehicle makes"
}
```

**Status Codes**:
- `200 OK` - Success
- `500 Internal Server Error` - API error

---

### 2. Get Popular Vehicle Makes

**Endpoint**: `GET /makes/popular`

**Description**: Get a curated list of popular vehicle makes (for UI dropdowns). Faster than getting all makes.

**Query Parameters**: None

**Popular Makes**:
- Toyota, Honda, Ford, Chevrolet, BMW
- Audi, Mercedes-Benz, Volkswagen, Hyundai, Kia
- Mazda, Nissan, Subaru, Jeep, Ram, Dodge, Tesla
- Volvo, Lexus, Acura

**Example Request**:
```bash
curl http://localhost:3001/api/nhtsa/makes/popular
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    "Toyota",
    "Honda",
    "Ford",
    "Chevrolet",
    ...
  ],
  "count": 20,
  "message": "Successfully retrieved popular vehicle makes"
}
```

---

### 3. Get Models for a Make and Year

**Endpoint**: `GET /models`

**Description**: Get all models available for a specific make and year.

**Query Parameters**:
- `make` (required): Vehicle make (e.g., "Toyota")
- `year` (required): Year (e.g., "2023", range 1980-current+1)

**Example Request**:
```bash
curl "http://localhost:3001/api/nhtsa/models?make=Toyota&year=2023"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "Model_ID": 123,
      "Model_Name": "Camry",
      "Model_Year": 2023
    },
    {
      "Model_ID": 124,
      "Model_Name": "Corolla",
      "Model_Year": 2023
    },
    {
      "Model_ID": 125,
      "Model_Name": "RAV4",
      "Model_Year": 2023
    }
  ],
  "count": 15,
  "make": "Toyota",
  "year": 2023,
  "message": "Successfully retrieved Toyota models for 2023"
}
```

**Status Codes**:
- `200 OK` - Success
- `400 Bad Request` - Missing or invalid parameters
- `500 Internal Server Error` - API error

---

### 4. Get Vehicle Specifications

**Endpoint**: `GET /details`

**Description**: Get detailed technical specifications for a specific vehicle.

**Query Parameters**:
- `make` (required): Vehicle make (e.g., "Toyota")
- `model` (required): Vehicle model (e.g., "Camry")
- `year` (required): Year (e.g., "2023")

**Example Request**:
```bash
curl "http://localhost:3001/api/nhtsa/details?make=Toyota&model=Camry&year=2023"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "vehicle": {
      "year": 2023,
      "make": "Toyota",
      "model": "Camry"
    },
    "specs": {
      "transmission": "Automatic",
      "fuelType": "Gasoline",
      "engine": "2.5",
      "driveType": "Front-Wheel Drive",
      "cylinders": "4",
      "bodyType": "Sedan",
      "doors": "4",
      "wheelBase": "113"
    },
    "allDetails": {
      "Transmission Type": "Automatic",
      "Fuel Type - Primary": "Gasoline",
      ...
    },
    "rawCount": 48
  },
  "message": "Successfully retrieved specifications for 2023 Toyota Camry"
}
```

**Key Specification Fields**:
- `transmission`: Automatic, Manual, CVT, DCT
- `fuelType`: Gasoline, Diesel, Hybrid, Electric
- `engine`: Engine displacement in cc
- `driveType`: FWD, RWD, AWD, 4WD
- `cylinders`: Number of cylinders
- `bodyType`: Sedan, SUV, Truck, etc.
- `doors`: Number of doors
- `wheelBase`: Wheelbase in inches

**Status Codes**:
- `200 OK` - Success
- `400 Bad Request` - Missing or invalid parameters
- `404 Not Found` - Vehicle doesn't exist
- `500 Internal Server Error` - API error

---

### 5. Get Vehicle Complaints

**Endpoint**: `GET /complaints`

**Description**: Get safety complaints reported for a vehicle to NHTSA.

**Query Parameters**:
- `make` (required): Vehicle make
- `model` (optional): Vehicle model
- `year` (optional): Year

**Example Requests**:
```bash
# All complaints for a make
curl "http://localhost:3001/api/nhtsa/complaints?make=Toyota"

# Complaints for specific model
curl "http://localhost:3001/api/nhtsa/complaints?make=Toyota&model=Camry"

# Complaints for specific year and model
curl "http://localhost:3001/api/nhtsa/complaints?make=Toyota&model=Camry&year=2015"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "ODI_ID": 10445678,
      "Manufacturer": "Toyota Motor Corporation",
      "Subject": "Door locks fail",
      "Component": "Door and door locks",
      "Summary": "Door locks fail intermittently",
      "Complaints": 150,
      "NHTSA_Campaign_Number": "15V500027",
      "Production_Year": 2015
    },
    ...
  ],
  "count": 42,
  "filters": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2015
  },
  "message": "Found 42 complaint(s) for Toyota Camry"
}
```

**Status Codes**:
- `200 OK` - Success (even if no complaints)
- `400 Bad Request` - Missing make parameter
- `500 Internal Server Error` - API error

---

### 6. Get Vehicle Recalls

**Endpoint**: `GET /recalls`

**Description**: Get official safety recalls for a vehicle.

**Query Parameters**:
- `make` (required): Vehicle make
- `model` (optional): Vehicle model
- `year` (optional): Year

**Example Requests**:
```bash
# All recalls for a make
curl "http://localhost:3001/api/nhtsa/recalls?make=Ford"

# Recalls for specific model and year
curl "http://localhost:3001/api/nhtsa/recalls?make=Ford&model=F-150&year=2010"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "Recall_ID": "10V234000",
      "Summary": "Engine fire hazard",
      "Component": "Engine",
      "Manufacturer": "Ford",
      "Model": "F-150",
      "Model_Year": 2010,
      "Potential_Units_Affected": 145000,
      "Safety_Risk_Assessment": "HAZARD"
    },
    ...
  ],
  "count": 8,
  "filters": {
    "make": "Ford",
    "model": "F-150",
    "year": 2010
  },
  "message": "Found 8 recall(s) for Ford F-150"
}
```

**Status Codes**:
- `200 OK` - Success
- `400 Bad Request` - Missing make parameter
- `500 Internal Server Error` - API error

---

### 7. Get Complete Vehicle Information

**Endpoint**: `GET /vehicle/:year/:make/:model`

**Description**: Get all information for a vehicle in one request (specs, complaints, recalls).

**URL Parameters**:
- `year` (required): Year (e.g., 2023)
- `make` (required): Vehicle make (e.g., Toyota)
- `model` (required): Vehicle model (e.g., Camry)

**Example Request**:
```bash
curl http://localhost:3001/api/nhtsa/vehicle/2015/Toyota/Camry
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "vehicle": {
      "year": 2015,
      "make": "Toyota",
      "model": "Camry"
    },
    "specifications": {
      "transmission": "Automatic",
      "fuelType": "Gasoline",
      "engine": "2.5",
      "driveType": "Front-Wheel Drive",
      "cylinders": "4",
      "bodyType": "Sedan",
      "doors": "4",
      "wheelBase": "113"
    },
    "problems": {
      "complaints": {
        "count": 42,
        "data": [
          {
            "Subject": "Door locks fail",
            "Component": "Door and door locks",
            "Complaints": 150
          },
          ...
        ]
      },
      "recalls": {
        "count": 8,
        "data": [
          {
            "Summary": "Engine fire hazard",
            "Component": "Engine",
            "Safety_Risk_Assessment": "HAZARD"
          },
          ...
        ]
      }
    },
    "summary": {
      "totalComplaints": 42,
      "totalRecalls": 8,
      "hasKnownIssues": true
    }
  },
  "message": "Successfully retrieved complete information for 2015 Toyota Camry"
}
```

**Status Codes**:
- `200 OK` - Success
- `400 Bad Request` - Invalid parameters
- `404 Not Found` - Vehicle not found
- `500 Internal Server Error` - API error

---

### 8. Search Vehicles

**Endpoint**: `GET /search`

**Description**: Flexible search endpoint for finding vehicles.

**Query Parameters**:
- `make` (required): Vehicle make
- `model` (optional): Vehicle model
- `year` (optional): Year

**Example Requests**:
```bash
# Search by make only
curl "http://localhost:3001/api/nhtsa/search?make=Toyota"

# Search by make and year
curl "http://localhost:3001/api/nhtsa/search?make=Toyota&year=2023"

# Search by make, model, and year
curl "http://localhost:3001/api/nhtsa/search?make=Toyota&model=Camry&year=2023"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "type": "models",
    "make": "Toyota",
    "year": 2023,
    "models": [
      {
        "Model_ID": 123,
        "Model_Name": "Camry",
        "Model_Year": 2023
      },
      ...
    ],
    "count": 15
  }
}
```

**Status Codes**:
- `200 OK` - Success
- `400 Bad Request` - Missing make parameter
- `500 Internal Server Error` - API error

---

### 9. Cache Status (Admin)

**Endpoint**: `GET /cache/status`

**Description**: Check the status of the caching system.

**Example Request**:
```bash
curl http://localhost:3001/api/nhtsa/cache/status
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "cacheSize": 245,
    "message": "Cache system operational"
  }
}
```

---

### 10. Clear Cache (Admin)

**Endpoint**: `POST /cache/clear`

**Description**: Clear all cached vehicle data (admin operation).

**Example Request**:
```bash
curl -X POST http://localhost:3001/api/nhtsa/cache/clear
```

**Example Response**:
```json
{
  "success": true,
  "message": "Cache cleared successfully"
}
```

---

## Usage Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3001/api/nhtsa';

// Get popular makes
async function getPopularMakes() {
  const response = await axios.get(`${API_URL}/makes/popular`);
  return response.data.data;
}

// Get models for a make and year
async function getModels(make, year) {
  const response = await axios.get(`${API_URL}/models`, {
    params: { make, year }
  });
  return response.data.data;
}

// Get vehicle specifications
async function getVehicleSpecs(make, model, year) {
  const response = await axios.get(`${API_URL}/details`, {
    params: { make, model, year }
  });
  return response.data.data.specs;
}

// Get complete vehicle information
async function getVehicleInfo(year, make, model) {
  const response = await axios.get(`${API_URL}/vehicle/${year}/${make}/${model}`);
  return response.data.data;
}

// Get complaints
async function getComplaints(make, model, year) {
  const response = await axios.get(`${API_URL}/complaints`, {
    params: { make, model, year }
  });
  return response.data.data;
}

// Get recalls
async function getRecalls(make, model, year) {
  const response = await axios.get(`${API_URL}/recalls`, {
    params: { make, model, year }
  });
  return response.data.data;
}

// Example usage
(async () => {
  const makes = await getPopularMakes();
  console.log('Popular makes:', makes);

  const models = await getModels('Toyota', 2023);
  console.log('Toyota 2023 models:', models);

  const specs = await getVehicleSpecs('Toyota', 'Camry', 2023);
  console.log('Camry specs:', specs);

  const info = await getVehicleInfo(2015, 'Toyota', 'Camry');
  console.log('Complete info:', info);
})();
```

### React Usage

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/nhtsa';

function VehicleSelector() {
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [vehicleInfo, setVehicleInfo] = useState(null);

  // Load makes on mount
  useEffect(() => {
    axios
      .get(`${API_URL}/makes/popular`)
      .then(res => setMakes(res.data.data))
      .catch(err => console.error('Error loading makes:', err));
  }, []);

  // Load models when make or year changes
  useEffect(() => {
    if (selectedMake && selectedYear) {
      axios
        .get(`${API_URL}/models`, {
          params: { make: selectedMake, year: selectedYear }
        })
        .then(res => setModels(res.data.data))
        .catch(err => console.error('Error loading models:', err));
    }
  }, [selectedMake, selectedYear]);

  // Load vehicle info when all three are selected
  useEffect(() => {
    if (selectedMake && selectedModel && selectedYear) {
      axios
        .get(`${API_URL}/vehicle/${selectedYear}/${selectedMake}/${selectedModel}`)
        .then(res => setVehicleInfo(res.data.data))
        .catch(err => console.error('Error loading vehicle info:', err));
    }
  }, [selectedMake, selectedModel, selectedYear]);

  return (
    <div>
      <select value={selectedMake} onChange={e => setSelectedMake(e.target.value)}>
        <option value="">Select Make</option>
        {makes.map(make => (
          <option key={make} value={make}>
            {make}
          </option>
        ))}
      </select>

      <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
        {[...Array(30)].map((_, i) => {
          const year = new Date().getFullYear() - i;
          return (
            <option key={year} value={year}>
              {year}
            </option>
          );
        })}
      </select>

      <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
        <option value="">Select Model</option>
        {models.map(model => (
          <option key={model.Model_ID} value={model.Model_Name}>
            {model.Model_Name}
          </option>
        ))}
      </select>

      {vehicleInfo && (
        <div>
          <h3>Vehicle Information</h3>
          <h4>Specifications</h4>
          <ul>
            <li>Transmission: {vehicleInfo.specifications.transmission}</li>
            <li>Fuel Type: {vehicleInfo.specifications.fuelType}</li>
            <li>Engine: {vehicleInfo.specifications.engine}cc</li>
            <li>Drive Type: {vehicleInfo.specifications.driveType}</li>
          </ul>

          <h4>Safety Information</h4>
          <p>Total Complaints: {vehicleInfo.summary.totalComplaints}</p>
          <p>Total Recalls: {vehicleInfo.summary.totalRecalls}</p>

          {vehicleInfo.summary.hasKnownIssues && (
            <div style={{ backgroundColor: '#fff3cd', padding: '10px', marginTop: '10px' }}>
              ⚠️ This vehicle has known issues. Check complaints and recalls above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VehicleSelector;
```

---

## Error Handling

### Common Errors

**400 Bad Request**
```json
{
  "success": false,
  "error": "Make and year are required query parameters"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Vehicle not found: 2015 InvalidMake InvalidModel"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

### Error Handling in Code

```javascript
async function safeGetVehicleInfo(year, make, model) {
  try {
    const response = await axios.get(`${API_URL}/vehicle/${year}/${make}/${model}`);
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error(`Vehicle not found: ${year} ${make} ${model}`);
    } else if (error.response?.status === 400) {
      console.error('Invalid parameters:', error.response.data);
    } else {
      console.error('Server error:', error.message);
    }
    return null;
  }
}
```

---

## Performance & Caching

The API uses automatic caching for better performance:

| Endpoint | Cache TTL | Rationale |
|----------|-----------|-----------|
| Makes | 7 days | Vehicle makes change rarely |
| Models | 7 days | Model lineup changes annually |
| Specifications | 7 days | Specs are static for a model year |
| Complaints | 1 day | New complaints added regularly |
| Recalls | 1 day | New recalls added regularly |

### Clearing Cache

```bash
curl -X POST http://localhost:3001/api/nhtsa/cache/clear
```

Cache is also automatically cleaned of expired entries.

---

## Rate Limiting

The NHTSA API has reasonable rate limits. Our implementation:
- Caches responses to reduce API calls
- Limits external requests to 10 per second
- Respects official NHTSA API limits

No API key required for NHTSA API.

---

## Data Quality Notes

- Vehicle specifications may have missing values
- Complaints are self-reported and may not be comprehensive
- Recalls are official NHTSA records
- Data is updated regularly but may have a slight lag

---

## Integration with Other Features

### Use in Vehicle Database

```javascript
// When a user adds a vehicle, validate it exists
const specs = await getVehicleSpecs(make, model, year);
if (!specs) {
  // Invalid vehicle
  throw new Error('Vehicle not found');
}

// Store specs in database
await database.vehicles.create({
  make, model, year,
  transmission: specs.transmission,
  fuelType: specs.fuelType,
  // ... other specs
});
```

### Use in Common Problems

```javascript
// Get complaints for a vehicle and add to problems database
const complaints = await getComplaints(make, model, year);
await database.commonProblems.createMany(
  complaints.map(complaint => ({
    vehicleMake: make,
    vehicleModel: model,
    vehicleYear: year,
    title: complaint.Subject,
    description: complaint.Summary,
    // ... other fields
  }))
);
```

---

## Support & Troubleshooting

**Issue: Vehicle not found**
- Check spelling of make and model
- Verify year is within valid range
- Try getting all models first to see available options

**Issue: No complaints/recalls returned**
- This is normal - not all vehicles have reported issues
- Empty array means no known issues (which is good!)

**Issue: Slow responses**
- First request for a vehicle will hit NHTSA API (slower)
- Subsequent requests use cache (faster)
- Check cache status: `GET /cache/status`

**Issue: Outdated data**
- Clear cache manually: `POST /cache/clear`
- Complaints/Recalls cache refreshes daily

---

## References

- [NHTSA API Documentation](https://vpic.nhtsa.dot.gov/api/)
- [NHTSA Complaints Database](https://complaints.nhtsa.dot.gov/)
- [NHTSA Recalls Database](https://www.nhtsa.gov/recalls)

// Vehicle Makes and Models
export const POPULAR_MAKES = [
  'Toyota',
  'Honda',
  'Ford',
  'Chevrolet',
  'BMW',
  'Audi',
  'Mercedes-Benz',
  'Volkswagen',
  'Hyundai',
  'Kia',
  'Mazda',
  'Nissan',
  'Subaru',
  'Jeep',
  'Ram',
  'Dodge',
  'Tesla',
  'Volvo',
  'Lexus',
  'Acura'
];

export const YEAR_RANGE = {
  MIN: 1980,
  MAX: new Date().getFullYear()
};

// Common Problem Categories
export const PROBLEM_CATEGORIES = {
  ENGINE: 'engine',
  TRANSMISSION: 'transmission',
  SUSPENSION: 'suspension',
  BRAKES: 'brakes',
  ELECTRICAL: 'electrical',
  COOLING: 'cooling',
  FUEL: 'fuel_system',
  EXHAUST: 'exhaust',
  INTERIOR: 'interior',
  EXTERIOR: 'exterior',
  STEERING: 'steering'
};

// Repair Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// Severity Levels
export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Retailers
export const RETAILERS = {
  AMAZON: 'amazon',
  EBAY: 'ebay',
  ROCKAUTO: 'rockauto',
  PARTSGEEK: 'partsgeek'
};

export const RETAILER_URLS = {
  amazon: 'https://www.amazon.com',
  ebay: 'https://www.ebay.com',
  rockauto: 'https://www.rockauto.com',
  partsgeek: 'https://www.partsgeek.com'
};

// Tire Categories
export const TIRE_SEASONS = {
  ALL_SEASON: 'all-season',
  SUMMER: 'summer',
  WINTER: 'winter',
  PERFORMANCE: 'performance'
};

// Modification Categories
export const MODIFICATION_CATEGORIES = {
  PERFORMANCE: 'performance',
  APPEARANCE: 'appearance',
  COMFORT: 'comfort',
  SAFETY: 'safety',
  EFFICIENCY: 'efficiency'
};

// Fuel Types
export const FUEL_TYPES = {
  GAS: 'gas',
  DIESEL: 'diesel',
  HYBRID: 'hybrid',
  ELECTRIC: 'electric'
};

// Transmission Types
export const TRANSMISSION_TYPES = {
  MANUAL: 'manual',
  AUTOMATIC: 'automatic',
  CVT: 'cvt',
  DCT: 'dct'
};

// Drive Types
export const DRIVE_TYPES = {
  FWD: 'fwd',
  RWD: 'rwd',
  AWD: 'awd',
  FOUR_WD: '4wd'
};

// Maintenance Record Categories
export const MAINTENANCE_CATEGORIES = {
  ROUTINE: 'routine',
  REPAIR: 'repair',
  MODIFICATION: 'modification',
  INSPECTION: 'inspection'
};

// Routine Maintenance Schedule
export const MAINTENANCE_SCHEDULE = {
  OIL_CHANGE: { interval: 5000, category: 'routine', description: 'Oil and Filter Change' },
  TIRE_ROTATION: { interval: 7500, category: 'routine', description: 'Tire Rotation' },
  BRAKE_INSPECTION: { interval: 15000, category: 'routine', description: 'Brake Inspection' },
  AIR_FILTER: { interval: 15000, category: 'routine', description: 'Engine Air Filter Replacement' },
  TRANSMISSION_FLUID: { interval: 30000, category: 'routine', description: 'Transmission Fluid Check' },
  SPARK_PLUGS: { interval: 60000, category: 'routine', description: 'Spark Plug Replacement' },
  CABIN_AIR_FILTER: { interval: 15000, category: 'routine', description: 'Cabin Air Filter Replacement' },
  COOLANT_FLUSH: { interval: 30000, category: 'routine', description: 'Coolant Flush' },
  BRAKE_FLUID: { interval: 24000, category: 'routine', description: 'Brake Fluid Replacement' }
};

// Cost Ranges (in USD)
export const COST_RANGES = {
  OIL_CHANGE: { diy: 30, professional: 75 },
  TIRE_REPLACEMENT_SINGLE: { diy: 100, professional: 150 },
  BRAKE_PADS: { diy: 60, professional: 200 },
  AIR_FILTER: { diy: 15, professional: 50 },
  SPARK_PLUGS: { diy: 50, professional: 250 }
};

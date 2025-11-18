// Vehicle Information
export interface VehicleInfo {
  id?: string;
  userId?: string;
  make: string;
  model: string;
  trim?: string;
  year: number;
  mileage: number;
  vin?: string;
  transmission?: 'manual' | 'automatic' | 'cvt' | 'dct';
  fuelType?: 'gas' | 'diesel' | 'hybrid' | 'electric';
  engine?: string;
  driveType?: 'fwd' | 'rwd' | 'awd' | '4wd';
  createdAt?: Date;
  updatedAt?: Date;
}

// Common Problem
export interface CommonProblem {
  id: string;
  vehicleYear?: number;
  mileageRange: {
    min: number;
    max: number;
  };
  title: string;
  description: string;
  symptoms: string[];
  preventionTips: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimatedRepairCost: {
    diy: number;
    professional: number;
  };
  frequency: number; // percentage of vehicles affected
  createdAt?: Date;
}

// Part
export interface Part {
  id: string;
  problemId: string;
  name: string;
  oemPartNumber?: string;
  aftermarketPartNumbers: string[];
  description: string;
  estimatedCost: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tools: string[];
}

// Parts Price Listing
export interface PriceListing {
  id: string;
  partId: string;
  retailer: 'amazon' | 'ebay' | 'rockauto' | 'partsgeek';
  name: string;
  price: number;
  shippingCost: number;
  totalPrice: number;
  url: string;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  updatedAt: Date;
}

// Tire
export interface Tire {
  id: string;
  vehicleYear?: number;
  brand: string;
  model: string;
  size: string;
  season: 'all-season' | 'summer' | 'winter' | 'performance';
  treadWear: number;
  traction: string;
  temperature: string;
  price: number;
  bestValue: boolean;
  retailer: string;
  url: string;
  rating?: number;
  warrantyYears?: number;
  createdAt?: Date;
}

// Modification
export interface Modification {
  id: string;
  make: string;
  model: string;
  year?: number;
  category: 'performance' | 'appearance' | 'comfort' | 'safety' | 'efficiency';
  title: string;
  description: string;
  benefits: string[];
  estimatedCost: number;
  difficulty: 'easy' | 'medium' | 'hard';
  popularity: number; // 1-10 scale
  ratingAverage?: number;
  reviewCount?: number;
}

// Vehicle Valuation
export interface VehicleValuation {
  vehicleYear: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  condition: 'poor' | 'fair' | 'good' | 'excellent';
  estimatedValue: number;
  source: 'kbb' | 'edmunds' | 'nada';
  updatedAt: Date;
  priceRange?: {
    low: number;
    high: number;
  };
}

// Maintenance Record
export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  date: Date;
  mileage: number;
  category: 'routine' | 'repair' | 'modification' | 'inspection';
  title: string;
  description: string;
  cost: number;
  partsUsed?: string[];
  notes?: string;
}

// Cost Analysis
export interface CostAnalysis {
  problemId: string;
  diyEstimate: {
    parts: number;
    tools: number;
    labor: number;
    total: number;
  };
  professionalEstimate: {
    parts: number;
    labor: number;
    total: number;
  };
  savings: number;
  savingsPercentage: number;
  difficulty: 'easy' | 'medium' | 'hard';
  recommendedApproach: 'diy' | 'professional' | 'either';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

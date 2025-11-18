import { YEAR_RANGE } from './constants';

/**
 * Validates an email address
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates vehicle year
 */
export function validateVehicleYear(year: number): boolean {
  return year >= YEAR_RANGE.MIN && year <= YEAR_RANGE.MAX;
}

/**
 * Categorizes mileage ranges
 */
export function calculateMileageCategory(mileage: number): string {
  if (mileage < 25000) return 'Low';
  if (mileage < 50000) return 'Moderate';
  if (mileage < 100000) return 'Medium-High';
  if (mileage < 150000) return 'High';
  return 'Very High';
}

/**
 * Formats a number as currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Formats a date
 */
export function formatDate(date: Date, format: string = 'MM/DD/YYYY'): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (format === 'MM/DD/YYYY') {
    return `${month}/${day}/${year}`;
  }
  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  }
  return d.toLocaleDateString();
}

/**
 * Calculates the age of a vehicle in years
 */
export function calculateVehicleAge(vehicleYear: number): number {
  return new Date().getFullYear() - vehicleYear;
}

/**
 * Determines if a vehicle is out of warranty
 */
export function isOutOfWarranty(vehicleYear: number, mileage: number): boolean {
  const age = calculateVehicleAge(vehicleYear);
  // Standard warranty is typically 3 years / 36,000 miles
  return age > 3 || mileage > 36000;
}

/**
 * Calculates cost savings between DIY and professional repair
 */
export function calculateSavings(diyPrice: number, professionalPrice: number): number {
  return Math.max(0, professionalPrice - diyPrice);
}

/**
 * Calculates savings percentage
 */
export function calculateSavingsPercentage(savings: number, originalPrice: number): number {
  if (originalPrice === 0) return 0;
  return Math.round((savings / originalPrice) * 100);
}

/**
 * Slug generation from string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Generates a short ID
 */
export function generateShortId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Calculates maintenance cost estimate
 */
export function estimateMaintenanceCost(
  vehicleAge: number,
  mileage: number
): { estimated: number; category: string } {
  let estimate = 0;
  let category = 'Low';

  if (mileage > 100000) {
    estimate += 500;
    category = 'High';
  } else if (mileage > 50000) {
    estimate += 200;
    category = 'Medium';
  }

  if (vehicleAge > 10) {
    estimate += 300;
    category = 'High';
  } else if (vehicleAge > 5) {
    estimate += 100;
  }

  return { estimated: estimate, category };
}

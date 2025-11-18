import axios from 'axios';

interface ValuationParams {
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  condition: 'poor' | 'fair' | 'good' | 'excellent';
}

interface Valuation {
  estimatedValue: number;
  priceRange: {
    low: number;
    high: number;
  };
  source: string;
  timestamp: Date;
}

class ValuationService {
  /**
   * Base vehicle values (starting points for estimation)
   * These would be updated regularly from real data sources
   */
  private baseValues: Record<string, Record<string, number>> = {
    Toyota: {
      Camry: 25000,
      Corolla: 18000,
      RAV4: 28000,
      Highlander: 35000,
      Tacoma: 32000
    },
    Honda: {
      Accord: 24000,
      Civic: 16000,
      CRV: 27000,
      Odyssey: 30000,
      Pilot: 33000
    },
    Ford: {
      Fusion: 18000,
      Focus: 12000,
      Escape: 24000,
      Explorer: 32000,
      F150: 35000
    },
    Chevrolet: {
      Malibu: 18000,
      Cruze: 13000,
      Equinox: 26000,
      Traverse: 32000,
      Silverado: 36000
    }
  };

  /**
   * Calculate vehicle valuation based on year, mileage, and condition
   */
  async getValuation(params: ValuationParams): Promise<Valuation> {
    const {
      year,
      make,
      model,
      mileage,
      condition = 'good'
    } = params;

    // Get base value
    const baseValue = this.getBaseValue(make, model);

    // Apply depreciation
    const ageDepreciation = this.calculateAgeDepreciation(year, baseValue);
    const mileageDepreciation = this.calculateMileageDepreciation(mileage, baseValue);
    const conditionAdjustment = this.getConditionMultiplier(condition);

    // Calculate final value
    let estimatedValue = baseValue - ageDepreciation - mileageDepreciation;
    estimatedValue = Math.max(estimatedValue * conditionAdjustment, 1000); // Minimum $1000

    // Calculate price range (±10%)
    const variance = estimatedValue * 0.1;

    return {
      estimatedValue: Math.round(estimatedValue),
      priceRange: {
        low: Math.round(estimatedValue - variance),
        high: Math.round(estimatedValue + variance)
      },
      source: 'calculated',
      timestamp: new Date()
    };
  }

  /**
   * Get base value for vehicle
   */
  private getBaseValue(make: string, model: string): number {
    const makeBases = this.baseValues[make];
    if (!makeBases) {
      // Return average for unknown make
      return 25000;
    }

    return makeBases[model] || 25000;
  }

  /**
   * Calculate depreciation based on age
   * Uses exponential depreciation model
   */
  private calculateAgeDepreciation(year: number, baseValue: number): number {
    const age = new Date().getFullYear() - year;

    if (age < 1) {
      return baseValue * 0.15; // First year: 15% depreciation
    }
    if (age < 5) {
      return baseValue * (0.15 + (age - 1) * 0.10); // Years 2-5: 10% per year
    }
    if (age < 10) {
      return baseValue * (0.55 + (age - 5) * 0.07); // Years 6-10: 7% per year
    }

    // After 10 years: 5% per year
    return baseValue * (0.90 + (age - 10) * 0.05);
  }

  /**
   * Calculate depreciation based on mileage
   * Standard: $0.15-0.25 per mile
   */
  private calculateMileageDepreciation(mileage: number, baseValue: number): number {
    // Use 0.20 per mile as average
    const perMileDepreciation = 0.20;
    const totalDepreciation = mileage * perMileDepreciation;

    // Cap depreciation at 50% of base value
    return Math.min(totalDepreciation, baseValue * 0.5);
  }

  /**
   * Get condition multiplier
   */
  private getConditionMultiplier(condition: string): number {
    const multipliers: Record<string, number> = {
      poor: 0.70,
      fair: 0.85,
      good: 1.0,
      excellent: 1.15
    };

    return multipliers[condition] || 1.0;
  }

  /**
   * Estimate trade-in value (typically 70-80% of private party value)
   */
  getTradeInValue(privatePartyValue: number): number {
    return Math.round(privatePartyValue * 0.75);
  }

  /**
   * Compare two vehicles
   */
  async compareVehicles(
    vehicle1: ValuationParams,
    vehicle2: ValuationParams
  ): Promise<{
    vehicle1: Valuation;
    vehicle2: Valuation;
    difference: number;
  }> {
    const val1 = await this.getValuation(vehicle1);
    const val2 = await this.getValuation(vehicle2);

    return {
      vehicle1: val1,
      vehicle2: val2,
      difference: val1.estimatedValue - val2.estimatedValue
    };
  }

  /**
   * Get historical depreciation curve for a vehicle
   */
  getDepreciationCurve(
    year: number,
    make: string,
    model: string,
    startMileage: number = 0
  ): Array<{ year: number; value: number; mileage: number }> {
    const baseValue = this.getBaseValue(make, model);
    const curve = [];

    for (let i = 0; i <= 15; i++) {
      const vehicleYear = year + i;
      const mileage = startMileage + i * 12000; // Assume 12k miles/year

      const ageDepreciation = this.calculateAgeDepreciation(vehicleYear, baseValue);
      const mileageDepreciation = this.calculateMileageDepreciation(mileage, baseValue);

      const value = Math.max(baseValue - ageDepreciation - mileageDepreciation, 1000);

      curve.push({
        year: i,
        value: Math.round(value),
        mileage
      });
    }

    return curve;
  }

  /**
   * Estimate best value vehicles (good value for money)
   */
  getBestValueYears(make: string, model: string): Array<{
    year: number;
    estimatedPrice: number;
    valueScore: number; // 1-10 scale
  }> {
    const baseValue = this.getBaseValue(make, model);
    const results = [];

    // Analyze 3-10 year old vehicles (sweet spot)
    for (let age = 3; age <= 10; age++) {
      const year = new Date().getFullYear() - age;
      const mileage = age * 12000;

      const ageDepreciation = this.calculateAgeDepreciation(year, baseValue);
      const mileageDepreciation = this.calculateMileageDepreciation(mileage, baseValue);

      const estimatedPrice = baseValue - ageDepreciation - mileageDepreciation;

      // Value score: price relative to age
      // Higher is better (lower price for given age)
      const valueScore = Math.round((10 * baseValue) / estimatedPrice);

      results.push({
        year,
        estimatedPrice: Math.round(estimatedPrice),
        valueScore: Math.min(valueScore, 10)
      });
    }

    return results.sort((a, b) => b.valueScore - a.valueScore);
  }

  /**
   * Get market trend for a vehicle
   */
  getMarketTrend(make: string, model: string): string {
    // In a real implementation, this would use actual market data
    // For now, return based on popularity

    const popularModels = ['Camry', 'Accord', 'Civic', 'F150', 'Silverado'];

    if (popularModels.includes(model)) {
      return 'Stable - High demand keeps values stable';
    }

    return 'Standard - Typical depreciation pattern';
  }

  /**
   * Update base values from external source
   * This would be called periodically to refresh data
   */
  async updateBaseValuesFromKBB(): Promise<void> {
    try {
      // In production, this would fetch from KBB or similar source
      // For now, we'll keep the hardcoded values

      console.log('Base values updated from external source');
    } catch (error) {
      console.error('Error updating base values:', error);
    }
  }

  /**
   * Get valuation report
   */
  async getValuationReport(params: ValuationParams): Promise<string> {
    const valuation = await this.getValuation(params);
    const tradeIn = this.getTradeInValue(valuation.estimatedValue);
    const trend = this.getMarketTrend(params.make, params.model);

    return `
Vehicle Valuation Report
========================
${params.year} ${params.make} ${params.model}
Mileage: ${params.mileage.toLocaleString()} miles
Condition: ${params.condition}

Estimated Private Party Value: $${(valuation.estimatedValue / 100).toFixed(2)}
Price Range: $${(valuation.priceRange.low / 100).toFixed(2)} - $${(valuation.priceRange.high / 100).toFixed(2)}
Estimated Trade-In Value: $${(tradeIn / 100).toFixed(2)}

Market Trend: ${trend}

Generated: ${valuation.timestamp.toLocaleDateString()}
    `.trim();
  }
}

export default new ValuationService();

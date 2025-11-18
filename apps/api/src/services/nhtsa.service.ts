import axios, { AxiosInstance } from 'axios';

interface Make {
  Make_ID: number;
  Make_Name: string;
}

interface Model {
  Model_ID: number;
  Model_Name: string;
  Model_Year: number;
}

interface VehicleDetail {
  Variable: string;
  Value: string;
}

const NHTSA_API_BASE = 'https://api.nhtsa.gov/api/vehicles';

class NHTSAService {
  private api: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor() {
    this.api = axios.create({
      baseURL: NHTSA_API_BASE,
      timeout: 10000
    });
  }

  /**
   * Get all vehicle makes
   */
  async getMakes(): Promise<Make[]> {
    const cacheKey = 'nhtsa_makes';

    if (this.hasValidCache(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      const response = await this.api.get('/GetAllMakes?format=json');
      const makes = response.data.Results.map((make: any) => ({
        Make_ID: make.Make_ID,
        Make_Name: make.Make_Name
      }));

      this.setCache(cacheKey, makes);
      return makes;
    } catch (error) {
      console.error('Error fetching makes from NHTSA:', error);
      throw error;
    }
  }

  /**
   * Get models for a specific year and make
   */
  async getModelsForMakeYear(make: string, year: number): Promise<Model[]> {
    const cacheKey = `nhtsa_models_${make}_${year}`;

    if (this.hasValidCache(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      const response = await this.api.get(
        `/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`
      );

      const models = response.data.Results.map((model: any) => ({
        Model_ID: model.Model_ID,
        Model_Name: model.Model_Name,
        Model_Year: model.Model_Year
      }));

      this.setCache(cacheKey, models);
      return models;
    } catch (error) {
      console.error(`Error fetching models for ${make} ${year}:`, error);
      throw error;
    }
  }

  /**
   * Get vehicle details for a specific make, model, and year
   */
  async getVehicleDetails(make: string, model: string, year: number): Promise<VehicleDetail[]> {
    const cacheKey = `nhtsa_details_${make}_${model}_${year}`;

    if (this.hasValidCache(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      const response = await this.api.get(
        `/GetVehicleDetailsForYear/make/${make}/model/${model}/year/${year}?format=json`
      );

      const details = response.data.Results[0]?.Variables || [];

      this.setCache(cacheKey, details);
      return details;
    } catch (error) {
      console.error(`Error fetching details for ${year} ${make} ${model}:`, error);
      throw error;
    }
  }

  /**
   * Get complaints for a vehicle
   */
  async getComplaints(make: string, model?: string, year?: number): Promise<any[]> {
    const cacheKey = `nhtsa_complaints_${make}_${model}_${year}`;

    if (this.hasValidCache(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      let url = `/GetComplaints/make/${make}?format=json`;
      if (model) url += `/model/${model}`;
      if (year) url += `/year/${year}`;

      const response = await this.api.get(url);
      const complaints = response.data.Results || [];

      this.setCache(cacheKey, complaints);
      return complaints;
    } catch (error) {
      console.error(`Error fetching complaints for ${make}:`, error);
      throw error;
    }
  }

  /**
   * Get recalls for a vehicle
   */
  async getRecalls(make: string, model?: string, year?: number): Promise<any[]> {
    const cacheKey = `nhtsa_recalls_${make}_${model}_${year}`;

    if (this.hasValidCache(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      let url = `/GetRecalls/make/${make}?format=json`;
      if (model) url += `/model/${model}`;
      if (year) url += `/year/${year}`;

      const response = await this.api.get(url);
      const recalls = response.data.Results || [];

      this.setCache(cacheKey, recalls);
      return recalls;
    } catch (error) {
      console.error(`Error fetching recalls for ${make}:`, error);
      return [];
    }
  }

  /**
   * Parse vehicle details into usable format
   */
  parseVehicleDetails(details: VehicleDetail[]): Record<string, string> {
    const parsed: Record<string, string> = {};

    details.forEach((detail) => {
      parsed[detail.Variable] = detail.Value;
    });

    return parsed;
  }

  /**
   * Extract useful info from vehicle details
   */
  extractVehicleSpecs(details: Record<string, string>) {
    return {
      transmission: details['Transmission Type'] || details['Trans Type'] || null,
      fuelType: details['Fuel Type - Primary'] || null,
      engine: details['Engine Displacement (cc)'] || null,
      driveType: details['Drive Type'] || null,
      cylinders: details['Engine Number of Cylinders'] || null,
      bodyType: details['Body Type'] || null,
      doors: details['Number of Doors'] || null,
      wheelBase: details['Wheelbase (inches)'] || null
    };
  }

  /**
   * Cache management
   */
  private hasValidCache(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const now = Date.now();
    return now - cached.timestamp < this.CACHE_DURATION;
  }

  private getCache(key: string): any {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get popular makes (for performance)
   */
  async getPopularMakes(): Promise<string[]> {
    const popularMakes = [
      'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Audi',
      'Mercedes-Benz', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda',
      'Nissan', 'Subaru', 'Jeep', 'Ram', 'Dodge', 'Tesla',
      'Volvo', 'Lexus', 'Acura'
    ];

    return popularMakes;
  }
}

export default new NHTSAService();

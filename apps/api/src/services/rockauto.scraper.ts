import axios from 'axios';

interface RockAutoPart {
  name: string;
  partNumber?: string;
  price: number;
  retailer: string;
  url: string;
  inStock: boolean;
  rating?: number;
}

class RockAutoScraperService {
  private baseUrl = 'https://www.rockauto.com';
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private REQUEST_DELAY = 2000; // 2 second delay between requests to respect server

  /**
   * Search parts by vehicle and category
   * Note: RockAuto doesn't have a public API, so we construct search URLs
   */
  async searchParts(
    year: number,
    make: string,
    model: string,
    category: string,
    partName?: string
  ): Promise<RockAutoPart[]> {
    const cacheKey = `rockauto_${year}_${make}_${model}_${category}_${partName || ''}`;

    if (this.hasValidCache(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      // RockAuto URL structure: /catalog/{year}/{make}/{model}/{category}/
      const searchUrl = `${this.baseUrl}/catalog/${year}/${this.slugify(make)}/${this.slugify(model)}/${this.slugify(category)}/`;

      console.log(`Fetching parts from: ${searchUrl}`);

      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      // Parse HTML to extract part information
      const parts = this.parseRockAutoHTML(response.data, category);

      this.setCache(cacheKey, parts);
      return parts;
    } catch (error) {
      console.error(
        `Error fetching parts from RockAuto for ${year} ${make} ${model}:`,
        error
      );
      // Return empty array on error - don't throw
      return [];
    }
  }

  /**
   * Parse RockAuto HTML and extract parts
   * Note: This is simplified. Real implementation would need actual HTML parsing
   */
  private parseRockAutoHTML(html: string, category: string): RockAutoPart[] {
    // This is a placeholder. In production, you'd use cheerio or similar
    // to parse the actual HTML structure from RockAuto

    // Example of what you'd extract:
    // - Part name
    // - OEM and aftermarket part numbers
    // - Prices from different sellers
    // - In-stock status
    // - Link to part

    const parts: RockAutoPart[] = [];

    try {
      // Basic regex-based parsing (simplified)
      const partMatches = html.match(/class=".*part.*">(.*?)<\/div>/gi) || [];

      // In production, use a proper HTML parser
      // const cheerio = require('cheerio');
      // const $ = cheerio.load(html);
      // $('tr.row').each((index, element) => {
      //   const name = $(element).find('td.part').text();
      //   const price = $(element).find('td.price').text();
      //   // ... extract more info
      // });

      return parts;
    } catch (error) {
      console.error('Error parsing RockAuto HTML:', error);
      return [];
    }
  }

  /**
   * Get common parts for maintenance
   * Returns manually curated list of common maintenance parts
   */
  getCommonMaintenanceParts(category: string): RockAutoPart[] {
    const commonParts: Record<string, RockAutoPart[]> = {
      oil: [
        {
          name: 'Synthetic 5W-30 Motor Oil',
          price: 3500, // in cents
          retailer: 'rockauto',
          url: 'https://www.rockauto.com/',
          inStock: true
        }
      ],
      filters: [
        {
          name: 'Engine Air Filter',
          price: 1500,
          retailer: 'rockauto',
          url: 'https://www.rockauto.com/',
          inStock: true
        },
        {
          name: 'Cabin Air Filter',
          price: 1200,
          retailer: 'rockauto',
          url: 'https://www.rockauto.com/',
          inStock: true
        }
      ],
      brakes: [
        {
          name: 'Brake Pad Set (Front)',
          price: 4500,
          retailer: 'rockauto',
          url: 'https://www.rockauto.com/',
          inStock: true
        }
      ],
      wipers: [
        {
          name: 'Front Wiper Blade (24")',
          price: 800,
          retailer: 'rockauto',
          url: 'https://www.rockauto.com/',
          inStock: true
        }
      ]
    };

    return commonParts[category.toLowerCase()] || [];
  }

  /**
   * Build search URL for RockAuto
   */
  buildSearchUrl(year: number, make: string, model: string, category: string): string {
    return `${this.baseUrl}/catalog/${year}/${this.slugify(make)}/${this.slugify(model)}/${this.slugify(category)}/`;
  }

  /**
   * Convert to URL slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '_')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Get tire information from RockAuto
   * Structure: /catalog/{year}/{make}/{model}/Tires_Wheels/
   */
  async getTires(year: number, make: string, model: string, size?: string): Promise<RockAutoPart[]> {
    return this.searchParts(year, make, model, 'Tires_Wheels');
  }

  /**
   * Respect rate limiting - add delay between requests
   */
  private async delay(ms: number = this.REQUEST_DELAY): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
   * Get popular part categories
   */
  getPartCategories(): string[] {
    return [
      'Engine',
      'Transmission',
      'Cooling',
      'Fuel',
      'Ignition',
      'Emission',
      'Exhaust',
      'Suspension',
      'Steering',
      'Brakes',
      'Tires_Wheels',
      'Belts_Hoses',
      'Filters',
      'Fluids',
      'Electrical',
      'Body',
      'Interior'
    ];
  }
}

export default new RockAutoScraperService();

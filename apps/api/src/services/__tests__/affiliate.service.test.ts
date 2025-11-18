import affiliateService from '../affiliate.service';

describe('AffiliateService', () => {
  describe('generateAffiliateLink', () => {
    it('should generate valid Amazon affiliate link', () => {
      const link = affiliateService.generateAffiliateLink('Oil Filter', 'amazon', 'part123');

      expect(link).toBeDefined();
      expect(link.retailer).toBe('amazon');
      expect(link.url).toContain('amazon.com');
      expect(link.url).toContain('Oil%20Filter');
    });

    it('should generate valid eBay affiliate link', () => {
      const link = affiliateService.generateAffiliateLink('Air Filter', 'ebay', 'part456');

      expect(link).toBeDefined();
      expect(link.retailer).toBe('ebay');
      expect(link.url).toContain('ebay.com');
    });

    it('should generate valid RockAuto affiliate link', () => {
      const link = affiliateService.generateAffiliateLink('Brake Pads', 'rockauto', 'part789');

      expect(link).toBeDefined();
      expect(link.retailer).toBe('rockauto');
      expect(link.url).toContain('rockauto.com');
    });

    it('should handle special characters in part name', () => {
      const link = affiliateService.generateAffiliateLink('Oil & Filter (OEM)', 'amazon', 'part123');

      expect(link.url).toContain(encodeURIComponent('Oil & Filter (OEM)'));
    });
  });

  describe('calculateEstimatedEarnings', () => {
    it('should calculate Amazon commission correctly (8%)', () => {
      const earnings = affiliateService.calculateEstimatedEarnings(100, 'amazon');

      expect(earnings).toBe(8);
    });

    it('should calculate eBay commission correctly (5%)', () => {
      const earnings = affiliateService.calculateEstimatedEarnings(100, 'ebay');

      expect(earnings).toBe(5);
    });

    it('should calculate RockAuto commission correctly (6%)', () => {
      const earnings = affiliateService.calculateEstimatedEarnings(100, 'rockauto');

      expect(earnings).toBe(6);
    });

    it('should handle zero price', () => {
      const earnings = affiliateService.calculateEstimatedEarnings(0, 'amazon');

      expect(earnings).toBe(0);
    });

    it('should handle large prices', () => {
      const earnings = affiliateService.calculateEstimatedEarnings(10000, 'amazon');

      expect(earnings).toBe(800);
    });
  });

  describe('Commission rates', () => {
    it('should have correct commission rate for each retailer', () => {
      const retailers = [
        { name: 'amazon', rate: 0.08 },
        { name: 'ebay', rate: 0.05 },
        { name: 'rockauto', rate: 0.06 },
        { name: 'partsgeek', rate: 0.05 },
      ];

      retailers.forEach(({ name, rate }) => {
        const expectedEarnings = 100 * rate;
        const actual = affiliateService.calculateEstimatedEarnings(100, name);
        expect(actual).toBeCloseTo(expectedEarnings, 1);
      });
    });
  });
});

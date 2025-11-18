// Insurance types and configurations
export const INSURANCE_TYPES = {
  PET: "pet",
  DISABILITY: "disability",
  CYBER: "cyber",
  TRAVEL: "travel",
  UMBRELLA: "umbrella",
  MOTORCYCLE: "motorcycle",
  SR22: "sr22",
  WEDDING: "wedding",
  DRONE: "drone",
  LANDLORD: "landlord",
} as const;

// Site domain mappings with SEO-optimized names
export const SITES = {
  pet: {
    type: INSURANCE_TYPES.PET,
    domain: "petcovercompare.com",
    displayName: "Pet Cover Compare",
    description: "Compare pet insurance quotes from 30+ carriers and save on your pet's healthcare",
    primaryColor: "#FF6B9D",
    secondaryColor: "#FFA502",
  },
  disability: {
    type: INSURANCE_TYPES.DISABILITY,
    domain: "disabilityquotehub.com",
    displayName: "Disability Quote Hub",
    description: "Find the best income protection insurance for self-employed professionals and business owners",
    primaryColor: "#4F46E5",
    secondaryColor: "#10B981",
  },
  cyber: {
    type: INSURANCE_TYPES.CYBER,
    domain: "cybersmallbizcompare.com",
    displayName: "Cyber SMB Compare",
    description: "Get cyber insurance quotes for your small business - protect against ransomware and data breaches",
    primaryColor: "#0891B2",
    secondaryColor: "#DC2626",
  },
  travel: {
    type: INSURANCE_TYPES.TRAVEL,
    domain: "travelinsurancecompare.io",
    displayName: "Travel Insurance Compare",
    description: "Compare travel insurance policies for any trip - adventure, business, or relaxation",
    primaryColor: "#EC4899",
    secondaryColor: "#3B82F6",
  },
  umbrella: {
    type: INSURANCE_TYPES.UMBRELLA,
    domain: "umbrellainsurancequotes.com",
    displayName: "Umbrella Insurance Quotes",
    description: "Get umbrella liability insurance quotes - protect your assets with excess coverage",
    primaryColor: "#7C3AED",
    secondaryColor: "#F59E0B",
  },
  motorcycle: {
    type: INSURANCE_TYPES.MOTORCYCLE,
    domain: "motorcycleinsurancehub.com",
    displayName: "Motorcycle Insurance Hub",
    description: "Find the best motorcycle insurance rates - quotes from all major carriers",
    primaryColor: "#DC2626",
    secondaryColor: "#1F2937",
  },
  sr22: {
    type: INSURANCE_TYPES.SR22,
    domain: "sr22insurancequick.com",
    displayName: "SR22 Insurance Quick",
    description: "Get fast SR-22 insurance quotes - cheapest rates for high-risk drivers",
    primaryColor: "#F97316",
    secondaryColor: "#1E293B",
  },
  wedding: {
    type: INSURANCE_TYPES.WEDDING,
    domain: "weddinginsurancecompare.com",
    displayName: "Wedding Insurance Compare",
    description: "Compare wedding and event liability insurance - protect your big day",
    primaryColor: "#EC4899",
    secondaryColor: "#8B5CF6",
  },
  drone: {
    type: INSURANCE_TYPES.DRONE,
    domain: "droneinsurancecompare.io",
    displayName: "Drone Insurance Compare",
    description: "Get drone insurance quotes - commercial and hobbyist coverage options",
    primaryColor: "#06B6D4",
    secondaryColor: "#0891B2",
  },
  landlord: {
    type: INSURANCE_TYPES.LANDLORD,
    domain: "landlordinsurancecompare.com",
    displayName: "Landlord Insurance Compare",
    description: "Compare landlord insurance for rental properties - get the best rates",
    primaryColor: "#10B981",
    secondaryColor: "#059669",
  },
} as const;

// Affiliate configuration - Import from detailed affiliate programs database
export {
  AFFILIATE_PROGRAMS_BY_NICHE,
  PET_INSURANCE_AFFILIATES,
  DISABILITY_INSURANCE_AFFILIATES,
  CYBER_INSURANCE_AFFILIATES,
  TRAVEL_INSURANCE_AFFILIATES,
  UMBRELLA_INSURANCE_AFFILIATES,
  MOTORCYCLE_INSURANCE_AFFILIATES,
  SR22_INSURANCE_AFFILIATES,
  WEDDING_INSURANCE_AFFILIATES,
  DRONE_INSURANCE_AFFILIATES,
  LANDLORD_INSURANCE_AFFILIATES,
  getAffiliatesByNiche,
  getAffiliateById,
  getHighestPayingAffiliates,
  getVerifiedPrograms,
  getAffiliateStats,
  parseCommission,
  type AffiliateProgram,
} from "./affiliate-programs";

// API configuration
export const API_CONFIG = {
  rateLimit: {
    requests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  quoteCache: {
    ttl: 24 * 60 * 60, // 24 hours in seconds
  },
  corsOrigins: [
    "localhost:3000",
    "localhost:3001",
    "localhost:3002",
    process.env.NEXT_PUBLIC_APP_URL || "",
  ].filter(Boolean),
};

// Email configuration
export const EMAIL_CONFIG = {
  from: "noreply@traffic2umarketing.com",
  fromName: "Traffic2u Insurance Compare",
  replyTo: "support@traffic2umarketing.com",
};

// SEO configuration
export const SEO_CONFIG = {
  siteTitle: "Traffic2u Insurance Compare",
  siteDescription: "Compare insurance quotes and get the best deals. Affiliate-driven comparison sites.",
  keywords: ["insurance comparison", "get quotes", "best rates", "affiliate"],
  ogImage: "https://traffic2umarketing.com/og-image.png",
};

// Feature flags
export const FEATURES = {
  emailVerification: true,
  affiliateTracking: true,
  userReviews: true,
  insuranceCalculators: true,
  communityForums: false, // Phase 2
  mobileApp: false, // Phase 2
} as const;

export type SiteKey = keyof typeof SITES;
export type InsuranceType = typeof INSURANCE_TYPES[keyof typeof INSURANCE_TYPES];

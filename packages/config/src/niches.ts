// Detailed niche configurations for each insurance site
import { SITES, INSURANCE_TYPES } from "./index";

export interface NicheConfig {
  type: string;
  domain: string;
  displayName: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  carriers: string[];
  statsData: {
    carriers: number;
    savings: string;
    timeToCompare: string;
  };
  howItWorks: {
    step: string;
    title: string;
    description: string;
  }[];
  formSteps: {
    title: string;
    description: string;
    fields: string[];
  }[];
  primaryColor: string;
  secondaryColor: string;
  icon: string;
  tagline: string;
}

export const NICHE_CONFIGS: Record<string, NicheConfig> = {
  pet: {
    type: INSURANCE_TYPES.PET,
    domain: "petcovercompare.com",
    displayName: "Pet Cover Compare",
    description: "Compare pet insurance quotes from 30+ carriers and save on your pet's healthcare",
    heroTitle: "Find the Best Pet Insurance for Your Furry Friend",
    heroSubtitle: "Compare quotes from 30+ carriers. Save up to 50% on your pet's healthcare coverage.",
    ctaText: "Get Free Quotes",
    carriers: ["Trupanion", "Fetch Pet Insurance", "Spot Pet Insurance", "ManyPets", "MetLife"],
    statsData: {
      carriers: 30,
      savings: "50%",
      timeToCompare: "5 min",
    },
    howItWorks: [
      {
        step: "1",
        title: "Tell Us About Your Pet",
        description: "Answer a few questions about your pet's age, breed, and health",
      },
      {
        step: "2",
        title: "Get Instant Quotes",
        description: "Compare coverage options and prices from multiple carriers",
      },
      {
        step: "3",
        title: "Review Coverage",
        description: "See detailed coverage, deductibles, and customer reviews",
      },
      {
        step: "4",
        title: "Save Money",
        description: "Choose the best plan and save on your pet's healthcare",
      },
    ],
    formSteps: [
      {
        title: "Tell Us About Your Pet",
        description: "Help us find the right coverage for your furry friend",
        fields: ["petType", "breed", "age"],
      },
      {
        title: "Coverage Preferences",
        description: "Choose the type of coverage you need",
        fields: ["coverageType"],
      },
      {
        title: "Your Contact Info",
        description: "We'll send your personalized quotes to your email",
        fields: ["email", "zipCode"],
      },
    ],
    primaryColor: "#FF6B9D",
    secondaryColor: "#FFA502",
    icon: "🐾",
    tagline: "Protect your pet's health without breaking the bank",
  },

  disability: {
    type: INSURANCE_TYPES.DISABILITY,
    domain: "disabilityquotehub.com",
    displayName: "Disability Quote Hub",
    description: "Find the best income protection insurance for self-employed professionals and business owners",
    heroTitle: "Protect Your Income with Disability Insurance",
    heroSubtitle: "Compare quotes from top carriers. Ensure your family's financial security if you can't work.",
    ctaText: "Get Free Quotes",
    carriers: ["Prudential", "The Hartford", "MetLife", "Guardian", "Lincoln Financial"],
    statsData: {
      carriers: 15,
      savings: "40%",
      timeToCompare: "3 min",
    },
    howItWorks: [
      {
        step: "1",
        title: "Tell Us Your Occupation",
        description: "Share your profession and income details",
      },
      {
        step: "2",
        title: "Choose Benefit Period",
        description: "Select how long benefits should last",
      },
      {
        step: "3",
        title: "Get Quotes",
        description: "Compare coverage options and premiums",
      },
      {
        step: "4",
        title: "Peace of Mind",
        description: "Choose a plan and protect your family's future",
      },
    ],
    formSteps: [
      {
        title: "Your Professional Information",
        description: "Help us find income protection for your profession",
        fields: ["occupation", "monthlyIncome", "ageGroup"],
      },
      {
        title: "Coverage Details",
        description: "What protection do you need?",
        fields: ["benefitPeriod", "waitingPeriod"],
      },
      {
        title: "Your Contact Info",
        description: "We'll send personalized quotes to your email",
        fields: ["email", "zipCode"],
      },
    ],
    primaryColor: "#4F46E5",
    secondaryColor: "#10B981",
    icon: "💼",
    tagline: "Your family's financial security shouldn't depend on your ability to work",
  },

  cyber: {
    type: INSURANCE_TYPES.CYBER,
    domain: "cybersmallbizcompare.com",
    displayName: "Cyber SMB Compare",
    description: "Get cyber insurance quotes for your small business - protect against ransomware and data breaches",
    heroTitle: "Protect Your Business from Cyber Attacks",
    heroSubtitle: "Compare cyber insurance from top carriers. Ransomware costs average $275K. Don't be uninsured.",
    ctaText: "Get Security Quote",
    carriers: ["Hiscox", "Coalition", "Chubb", "Hartford", "Travelers"],
    statsData: {
      carriers: 12,
      savings: "45%",
      timeToCompare: "4 min",
    },
    howItWorks: [
      {
        step: "1",
        title: "Business Details",
        description: "Tell us about your company size and industry",
      },
      {
        step: "2",
        title: "Risk Assessment",
        description: "Answer questions about your security practices",
      },
      {
        step: "3",
        title: "Compare Quotes",
        description: "See coverage options from multiple carriers",
      },
      {
        step: "4",
        title: "Get Protected",
        description: "Choose coverage and activate immediately",
      },
    ],
    formSteps: [
      {
        title: "Business Information",
        description: "Help us find cyber coverage for your company",
        fields: ["employeeCount", "industry", "annualRevenue"],
      },
      {
        title: "Coverage Preferences",
        description: "What risks concern you most?",
        fields: ["hasDataBreachInsurance", "hasRansomwareInsurance", "hasBusinessInterruptionInsurance"],
      },
      {
        title: "Your Contact Info",
        description: "Get instant cyber insurance quotes",
        fields: ["email", "zipCode"],
      },
    ],
    primaryColor: "#0891B2",
    secondaryColor: "#DC2626",
    icon: "🔒",
    tagline: "One breach can cost your business everything. Don't take that risk.",
  },

  travel: {
    type: INSURANCE_TYPES.TRAVEL,
    domain: "travelinsurancecompare.io",
    displayName: "Travel Insurance Compare",
    description: "Compare travel insurance policies for any trip - adventure, business, or relaxation",
    heroTitle: "Travel with Confidence",
    heroSubtitle: "Compare travel insurance from trusted carriers. Protect your trips from cancellation, delays & emergencies.",
    ctaText: "Compare Policies",
    carriers: ["Visitors Coverage", "World Nomads", "InsureMyTrip", "Travel Insured", "IMG Global"],
    statsData: {
      carriers: 24,
      savings: "35%",
      timeToCompare: "2 min",
    },
    howItWorks: [
      {
        step: "1",
        title: "Trip Details",
        description: "When and where are you traveling?",
      },
      {
        step: "2",
        title: "Coverage Needs",
        description: "What protections matter to you?",
      },
      {
        step: "3",
        title: "Compare Plans",
        description: "See coverage and prices side-by-side",
      },
      {
        step: "4",
        title: "Book Coverage",
        description: "Get instant protection for your trip",
      },
    ],
    formSteps: [
      {
        title: "Trip Information",
        description: "Tell us about your upcoming trip",
        fields: ["departureDate", "returnDate", "destination", "tripCost"],
      },
      {
        title: "Coverage Type",
        description: "What type of trip is this?",
        fields: ["tripType", "numberOfTravelers"],
      },
      {
        title: "Your Contact Info",
        description: "We'll send instant travel insurance quotes",
        fields: ["email", "age"],
      },
    ],
    primaryColor: "#EC4899",
    secondaryColor: "#3B82F6",
    icon: "✈️",
    tagline: "Your perfect trip deserves protection",
  },

  umbrella: {
    type: INSURANCE_TYPES.UMBRELLA,
    domain: "umbrellainsurancequotes.com",
    displayName: "Umbrella Insurance Quotes",
    description: "Get umbrella liability insurance quotes - protect your assets with excess coverage",
    heroTitle: "Protect Your Wealth with Umbrella Insurance",
    heroSubtitle: "One lawsuit can devastate your wealth. Umbrella insurance provides extra protection for $1-5M+ coverage.",
    ctaText: "Get Your Quote",
    carriers: ["Chubb", "AIG", "Allstate Premium", "Nationwide", "Travelers"],
    statsData: {
      carriers: 10,
      savings: "30%",
      timeToCompare: "3 min",
    },
    howItWorks: [
      {
        step: "1",
        title: "Your Assets",
        description: "How much are you worth?",
      },
      {
        step: "2",
        title: "Current Coverage",
        description: "What liability limits do you have?",
      },
      {
        step: "3",
        title: "Coverage Amount",
        description: "How much umbrella coverage do you need?",
      },
      {
        step: "4",
        title: "Get Protected",
        description: "Quote umbrella insurance immediately",
      },
    ],
    formSteps: [
      {
        title: "Asset Protection",
        description: "Help us understand your wealth",
        fields: ["netWorth", "homeValue", "propertyCount"],
      },
      {
        title: "Current Coverage",
        description: "What liability limits do you have?",
        fields: ["homeInsuranceLimit", "autoInsuranceLimit"],
      },
      {
        title: "Your Contact Info",
        description: "Get umbrella insurance quotes",
        fields: ["email", "zipCode"],
      },
    ],
    primaryColor: "#7C3AED",
    secondaryColor: "#F59E0B",
    icon: "☂️",
    tagline: "Wealth protection for high-net-worth individuals",
  },

  motorcycle: {
    type: INSURANCE_TYPES.MOTORCYCLE,
    domain: "motorcycleinsurancehub.com",
    displayName: "Motorcycle Insurance Hub",
    description: "Find the best motorcycle insurance rates - quotes from all major carriers",
    heroTitle: "Get the Best Motorcycle Insurance Rates",
    heroSubtitle: "Compare motorcycle coverage from top carriers. Ride with confidence knowing you're protected.",
    ctaText: "Get Your Rate",
    carriers: ["Progressive", "Dairyland", "GEICO", "Allstate", "Nationwide"],
    statsData: {
      carriers: 18,
      savings: "35%",
      timeToCompare: "3 min",
    },
    howItWorks: [
      {
        step: "1",
        title: "Your Bike",
        description: "Tell us about your motorcycle",
      },
      {
        step: "2",
        title: "Riding Profile",
        description: "Your experience and riding habits",
      },
      {
        step: "3",
        title: "Coverage Options",
        description: "Choose coverage that fits your needs",
      },
      {
        step: "4",
        title: "Hit the Road",
        description: "Get covered and enjoy the ride",
      },
    ],
    formSteps: [
      {
        title: "Your Motorcycle",
        description: "Tell us about your bike",
        fields: ["make", "model", "year", "mileage"],
      },
      {
        title: "Your Experience",
        description: "Your riding profile and history",
        fields: ["yearsRiding", "violations", "safetyCoursing"],
      },
      {
        title: "Your Contact Info",
        description: "Get instant motorcycle insurance quotes",
        fields: ["email", "zipCode"],
      },
    ],
    primaryColor: "#DC2626",
    secondaryColor: "#1F2937",
    icon: "🏍️",
    tagline: "For riders who understand risk and embrace freedom",
  },

  sr22: {
    type: INSURANCE_TYPES.SR22,
    domain: "sr22insurancequick.com",
    displayName: "SR22 Insurance Quick",
    description: "Get fast SR-22 insurance quotes - cheapest rates for high-risk drivers",
    heroTitle: "Get SR-22 Insurance Quotes Fast",
    heroSubtitle: "SR-22 filing required? Compare quotes and get the lowest rates to restore your driving privileges.",
    ctaText: "Get SR-22 Quote",
    carriers: ["GEICO", "Erie", "State Farm", "Progressive", "Dairyland"],
    statsData: {
      carriers: 14,
      savings: "40%",
      timeToCompare: "2 min",
    },
    howItWorks: [
      {
        step: "1",
        title: "Your Situation",
        description: "Why do you need SR-22?",
      },
      {
        step: "2",
        title: "Vehicle Info",
        description: "Tell us about your car",
      },
      {
        step: "3",
        title: "Get Quotes",
        description: "Compare SR-22 rates instantly",
      },
      {
        step: "4",
        title: "Get Back on Road",
        description: "File SR-22 and restore your license",
      },
    ],
    formSteps: [
      {
        title: "Why You Need SR-22",
        description: "Tell us about your situation",
        fields: ["reason", "yearsAgo", "violations"],
      },
      {
        title: "Vehicle Information",
        description: "Details about your vehicle",
        fields: ["make", "model", "year", "usage"],
      },
      {
        title: "Your Contact Info",
        description: "Get instant SR-22 quotes",
        fields: ["email", "zipCode"],
      },
    ],
    primaryColor: "#F97316",
    secondaryColor: "#1E293B",
    icon: "⚡",
    tagline: "Get back on the road with affordable SR-22 coverage",
  },

  wedding: {
    type: INSURANCE_TYPES.WEDDING,
    domain: "weddinginsurancecompare.com",
    displayName: "Wedding Insurance Compare",
    description: "Compare wedding and event liability insurance - protect your big day",
    heroTitle: "Protect Your Perfect Day",
    heroSubtitle: "Wedding insurance covers cancellations, weather, vendor issues & liability. Compare quotes now.",
    ctaText: "Protect Your Wedding",
    carriers: ["WedSafe", "eWed", "BriteCo", "EventGuard", "Travelers"],
    statsData: {
      carriers: 8,
      savings: "25%",
      timeToCompare: "5 min",
    },
    howItWorks: [
      {
        step: "1",
        title: "Wedding Details",
        description: "When and where is your wedding?",
      },
      {
        step: "2",
        title: "Coverage Needs",
        description: "What risks concern you?",
      },
      {
        step: "3",
        title: "Compare Quotes",
        description: "See protection options and prices",
      },
      {
        step: "4",
        title: "Peace of Mind",
        description: "Get protected and enjoy your day",
      },
    ],
    formSteps: [
      {
        title: "Your Wedding",
        description: "Tell us about your big day",
        fields: ["weddingDate", "location", "guestCount", "budget"],
      },
      {
        title: "Coverage Type",
        description: "What protection do you need?",
        fields: ["cancellationCoverage", "vendorCoverage", "liabilityCoverage"],
      },
      {
        title: "Your Contact Info",
        description: "Get wedding insurance quotes",
        fields: ["email", "zipCode"],
      },
    ],
    primaryColor: "#EC4899",
    secondaryColor: "#8B5CF6",
    icon: "💒",
    tagline: "Your dream wedding deserves protection",
  },

  drone: {
    type: INSURANCE_TYPES.DRONE,
    domain: "droneinsurancecompare.io",
    displayName: "Drone Insurance Compare",
    description: "Get drone insurance quotes - commercial and hobbyist coverage options",
    heroTitle: "Get Drone Insurance Quotes",
    heroSubtitle: "Protect your drone and business with affordable liability coverage. Commercial & hobbyist options available.",
    ctaText: "Get Drone Quote",
    carriers: ["AirModo", "Coverdash", "The Hartford", "NEXT Insurance", "CoverWallet"],
    statsData: {
      carriers: 9,
      savings: "30%",
      timeToCompare: "3 min",
    },
    howItWorks: [
      {
        step: "1",
        title: "Your Drone",
        description: "Tell us about your drone(s)",
      },
      {
        step: "2",
        title: "How You Use It",
        description: "Hobby or commercial operations?",
      },
      {
        step: "3",
        title: "Coverage Options",
        description: "Hourly, annual, or project-based coverage",
      },
      {
        step: "4",
        title: "Get Protected",
        description: "Activate coverage immediately",
      },
    ],
    formSteps: [
      {
        title: "Your Drone",
        description: "Tell us about your drone",
        fields: ["droneModel", "value", "numberOfDrones"],
      },
      {
        title: "Your Operations",
        description: "How do you use your drone?",
        fields: ["operationType", "useCase", "hasPartCertification"],
      },
      {
        title: "Your Contact Info",
        description: "Get drone insurance quotes",
        fields: ["email", "zipCode"],
      },
    ],
    primaryColor: "#06B6D4",
    secondaryColor: "#0891B2",
    icon: "🚁",
    tagline: "Professional drone coverage for modern operators",
  },

  landlord: {
    type: INSURANCE_TYPES.LANDLORD,
    domain: "landlordinsurancecompare.com",
    displayName: "Landlord Insurance Compare",
    description: "Compare landlord insurance for rental properties - get the best rates",
    heroTitle: "Find Affordable Landlord Insurance",
    heroSubtitle: "Protect your rental property investment. Compare coverage and rates from top carriers.",
    ctaText: "Get Your Quote",
    carriers: ["State Farm", "American Family", "Allstate", "Erie", "Liberty Mutual"],
    statsData: {
      carriers: 16,
      savings: "35%",
      timeToCompare: "4 min",
    },
    howItWorks: [
      {
        step: "1",
        title: "Property Details",
        description: "Tell us about your rental property",
      },
      {
        step: "2",
        title: "Coverage Needs",
        description: "What protection do you need?",
      },
      {
        step: "3",
        title: "Compare Quotes",
        description: "See rates from multiple carriers",
      },
      {
        step: "4",
        title: "Protect Your Investment",
        description: "Get covered and manage your property",
      },
    ],
    formSteps: [
      {
        title: "Property Information",
        description: "Tell us about your rental property",
        fields: ["propertyType", "yearBuilt", "numberOfUnits", "propertyValue"],
      },
      {
        title: "Coverage Details",
        description: "What liability protection do you need?",
        fields: ["hasMortgage", "numberOfTenants", "wantsLossOfRent"],
      },
      {
        title: "Your Contact Info",
        description: "Get landlord insurance quotes",
        fields: ["email", "zipCode"],
      },
    ],
    primaryColor: "#10B981",
    secondaryColor: "#059669",
    icon: "🏠",
    tagline: "Landlord insurance that protects your investment",
  },
};

// Export configurations indexed by site type
export const getNicheConfig = (siteType: string): NicheConfig | undefined => {
  return NICHE_CONFIGS[siteType];
};

// Get all niche configs
export const getAllNicheConfigs = (): NicheConfig[] => {
  return Object.values(NICHE_CONFIGS);
};

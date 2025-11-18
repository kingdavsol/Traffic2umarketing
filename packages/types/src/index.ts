// User and Authentication
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  userId: string;
  email: string;
  emailVerified: boolean;
}

// Quote Request and Comparison
export interface QuoteRequest {
  id: string;
  userId: string;
  siteType: string;
  responses: Record<string, any>;
  status: "pending" | "completed" | "error";
  createdAt: Date;
  updatedAt: Date;
}

export interface Quote {
  id: string;
  quoteRequestId: string;
  carrierName: string;
  monthlyPremium: number;
  annualPremium: number;
  coverageDetails: Record<string, any>;
  deductibles: Record<string, number>;
  affiliateLink: string;
  affiliateProgram: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface CarrierInfo {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  founded: number;
  headquarters: string;
  am_best_rating: string;
}

// Forms and Questionnaires
export interface FormField {
  id: string;
  type: "text" | "email" | "number" | "select" | "radio" | "checkbox" | "textarea";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string }[];
  validation?: ValidationRule[];
  helpText?: string;
}

export interface ValidationRule {
  type: "required" | "email" | "phone" | "pattern" | "min" | "max";
  message: string;
  value?: string | number;
}

export interface QuestionnaireStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  progressLabel: string;
}

export interface Questionnaire {
  id: string;
  siteType: string;
  title: string;
  description: string;
  steps: QuestionnaireStep[];
  estimatedTime: number; // minutes
}

// Email and Verification
export interface EmailVerificationToken {
  id: string;
  email: string;
  token: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

export interface EmailSubscription {
  id: string;
  userId: string;
  email: string;
  siteType: string;
  status: "subscribed" | "unsubscribed" | "bounced";
  createdAt: Date;
  updatedAt: Date;
}

// Analytics and Tracking
export interface AffiliateClick {
  id: string;
  userId: string;
  quoteId: string;
  carrierName: string;
  siteType: string;
  affiliateProgram: string;
  timestamp: Date;
  sessionId: string;
}

export interface Conversion {
  id: string;
  affiliateClickId: string;
  carrierName: string;
  siteType: string;
  commissionsAmount: number;
  status: "pending" | "confirmed" | "rejected";
  confirmedAt?: Date;
  createdAt: Date;
}

export interface PageMetrics {
  pageUrl: string;
  visitCount: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  conversionRate: number;
  date: Date;
}

// Reviews and Ratings
export interface InsuranceReview {
  id: string;
  userId: string;
  carrierName: string;
  siteType: string;
  rating: number; // 1-5
  title: string;
  content: string;
  verified: boolean; // customer verified
  helpfulCount: number;
  unhelpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Content
export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  siteType: string;
  author: string;
  tags: string[];
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

// Insurance-specific types
export interface PetInsuranceData {
  petType: "dog" | "cat" | "other";
  breed: string;
  age: number;
  preExistingConditions: string[];
  coverageType: "accident_only" | "accident_illness" | "wellness_included";
}

export interface DisabilityInsuranceData {
  occupation: string;
  monthlyIncome: number;
  benefitPeriod: "short_term" | "long_term" | "both";
  waitingPeriod: number; // days
  ageGroup: string;
}

export interface CyberInsuranceData {
  employeeCount: number;
  industry: string;
  hasDataBreachInsurance: boolean;
  hasRansomwareInsurance: boolean;
  annualRevenue: number;
}

// Settings
export interface SiteSettings {
  siteType: string;
  maintenanceMode: boolean;
  maxQuotesPerDay: number;
  emailVerificationRequired: boolean;
  enableAffiliateTracking: boolean;
  enableUserReviews: boolean;
  features: Record<string, boolean>;
}

// Error types
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: Record<string, any>
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super("VALIDATION_ERROR", message, 422, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super("NOT_FOUND", message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super("UNAUTHORIZED", message, 401);
  }
}

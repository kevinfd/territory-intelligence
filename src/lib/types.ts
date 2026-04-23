export type LngLat = [number, number];

export type Territory = {
  id: string;
  name: string;
  polygon: LngLat[];
  center: LngLat;
  zoom: number;
};

export type Banker = {
  id: string;
  name: string;
  title: string;
  avatarInitials: string;
  territoryIds: string[];
  targetRevenueBand: [number, number];
};

export type Industry =
  | "Manufacturing"
  | "Wholesale Distribution"
  | "Healthcare Services"
  | "Professional Services"
  | "Logistics & Transportation"
  | "Real Estate"
  | "Construction"
  | "Food & Beverage"
  | "Technology"
  | "Media & Entertainment"
  | "Retail";

export type DigitalMaturity = "low" | "medium" | "high";
export type DataConfidence = "high" | "medium" | "low";
export type CrmStatus = "in_crm" | "new_lead";

export type Executive = {
  name: string;
  role: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  priorEmployers: string[];
  pedigreeScore: number;
  tenureYears: number;
};

export type GrowthSignal = {
  type: "funding" | "move" | "filing" | "expansion" | "hiring" | "news";
  description: string;
  recencyMonths: number;
  weight: number;
};

export type CrmIssue = {
  type:
    | "duplicate_of"
    | "outdated"
    | "weak_record"
    | "better_hq"
    | "better_contact"
    | "revenue_mismatch";
  description: string;
  severity: "low" | "medium" | "high";
};

export type BankingRelationship = {
  likelyBank: string;
  evidence: string;
  lockInScore: number;
};

export type Company = {
  id: string;
  name: string;
  hq: {
    address: string;
    city: string;
    state: string;
    zip: string;
    lat: number;
    lng: number;
  };
  industry: Industry;
  subIndustry?: string;
  employeeCount: number;
  employeeCountConfidence: DataConfidence;
  knownRevenue?: number;
  knownRevenueSource?: "CRM" | "ZoomInfo" | "D&B" | "filing";
  officeFootprintSqFt?: number;
  numberOfLocations: number;
  yearFounded: number;
  websiteQualityScore: number;
  digitalMaturity: DigitalMaturity;
  executives: Executive[];
  crmStatus: CrmStatus;
  crmIssues: CrmIssue[];
  growthSignals: GrowthSignal[];
  bankingRelationship?: BankingRelationship;
  productAngle?: string;
  onRoute?: boolean;
};

export type BusinessLogicConfig = {
  targetRevenueBand: [number, number];
  includedIndustries: Industry[];
  excludedIndustries: Industry[];
  activeTerritoryId: string;
  weights: {
    territoryFit: number;
    revenueFit: number;
    confidence: number;
    growth: number;
    executive: number;
    whitespace: number;
    relationshipLockIn: number;
  };
};

export type SignalContribution = {
  label: string;
  contribution: number;
  detail: string;
};

export type RevenueEstimate = {
  rangeLow: number;
  rangeHigh: number;
  midpoint: number;
  confidence: number;
  contributingSignals: SignalContribution[];
  conflicts: string[];
};

export type PriorityTier = "Tier 1" | "Tier 2" | "Tier 3";

export type PriorityBreakdown = {
  territoryFit: number;
  revenueFit: number;
  confidence: number;
  growth: number;
  executive: number;
  whitespace: number;
  relationshipLockIn: number;
};

export type PriorityScore = {
  priorityScore: number;
  tier: PriorityTier;
  reason: string;
  suggestedAction: string;
  breakdown: PriorityBreakdown;
  topContributors: { label: string; value: number }[];
};

export type Scored = {
  company: Company;
  revenue: RevenueEstimate;
  priority: PriorityScore;
  inTerritory: boolean;
};

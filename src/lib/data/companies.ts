import type {
  Company,
  CrmIssue,
  DataConfidence,
  DigitalMaturity,
  Executive,
  GrowthSignal,
  Industry,
} from "@/lib/types";
import { INDUSTRY_META, INDUSTRIES } from "./industries";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type CityEntry = {
  city: string;
  zip: string;
  lat: number;
  lng: number;
  streets: string[];
};

const CITIES: CityEntry[] = [
  { city: "Los Angeles", zip: "90015", lat: 34.05, lng: -118.24, streets: ["Grand Ave", "Figueroa St", "Olympic Blvd", "Wilshire Blvd"] },
  { city: "Long Beach", zip: "90802", lat: 33.77, lng: -118.19, streets: ["Ocean Blvd", "Pine Ave", "Broadway", "Atlantic Ave"] },
  { city: "Santa Monica", zip: "90401", lat: 34.02, lng: -118.49, streets: ["Main St", "Ocean Ave", "Broadway", "Colorado Ave"] },
  { city: "Burbank", zip: "91502", lat: 34.18, lng: -118.31, streets: ["Olive Ave", "San Fernando Blvd", "Magnolia Blvd"] },
  { city: "Pasadena", zip: "91101", lat: 34.15, lng: -118.14, streets: ["Colorado Blvd", "Lake Ave", "Arroyo Pkwy"] },
  { city: "Glendale", zip: "91203", lat: 34.15, lng: -118.26, streets: ["Brand Blvd", "Central Ave", "Glendale Ave"] },
  { city: "Torrance", zip: "90503", lat: 33.84, lng: -118.34, streets: ["Hawthorne Blvd", "Del Amo Blvd", "Crenshaw Blvd"] },
  { city: "El Segundo", zip: "90245", lat: 33.92, lng: -118.4, streets: ["Sepulveda Blvd", "Rosecrans Ave", "Grand Ave"] },
  { city: "Culver City", zip: "90232", lat: 34.02, lng: -118.4, streets: ["Jefferson Blvd", "Washington Blvd", "Venice Blvd"] },
  { city: "Anaheim", zip: "92805", lat: 33.84, lng: -117.91, streets: ["Katella Ave", "Ball Rd", "La Palma Ave"] },
  { city: "Irvine", zip: "92614", lat: 33.68, lng: -117.83, streets: ["Jamboree Rd", "Alton Pkwy", "Von Karman Ave"] },
  { city: "Santa Ana", zip: "92701", lat: 33.75, lng: -117.87, streets: ["Main St", "Bristol St", "Grand Ave"] },
  { city: "Huntington Beach", zip: "92648", lat: 33.66, lng: -118.0, streets: ["Beach Blvd", "Main St", "Edinger Ave"] },
  { city: "Newport Beach", zip: "92660", lat: 33.62, lng: -117.93, streets: ["MacArthur Blvd", "Jamboree Rd", "Coast Hwy"] },
  { city: "Costa Mesa", zip: "92626", lat: 33.64, lng: -117.92, streets: ["Bristol St", "Harbor Blvd", "Baker St"] },
  { city: "Ontario", zip: "91764", lat: 34.06, lng: -117.65, streets: ["Mountain Ave", "4th St", "Euclid Ave"] },
  { city: "Riverside", zip: "92501", lat: 33.98, lng: -117.37, streets: ["Mission Inn Ave", "Market St", "University Ave"] },
  { city: "San Bernardino", zip: "92408", lat: 34.09, lng: -117.28, streets: ["Hospitality Ln", "Tippecanoe Ave", "Waterman Ave"] },
  { city: "Rancho Cucamonga", zip: "91730", lat: 34.1, lng: -117.59, streets: ["Haven Ave", "Foothill Blvd", "Milliken Ave"] },
  { city: "Corona", zip: "92879", lat: 33.88, lng: -117.57, streets: ["Sampson Ave", "Hamner Ave", "Magnolia Ave"] },
  { city: "Fontana", zip: "92335", lat: 34.09, lng: -117.44, streets: ["Sierra Ave", "Valley Blvd", "Foothill Blvd"] },
  { city: "Moreno Valley", zip: "92553", lat: 33.94, lng: -117.23, streets: ["Sunnymead Blvd", "Alessandro Blvd"] },
  { city: "Palm Springs", zip: "92262", lat: 33.82, lng: -116.55, streets: ["Palm Canyon Dr", "Sunrise Way", "Tahquitz Canyon Way"] },
  { city: "Ventura", zip: "93001", lat: 34.27, lng: -119.23, streets: ["Main St", "Thompson Blvd", "Telegraph Rd"] },
  { city: "Oxnard", zip: "93030", lat: 34.2, lng: -119.18, streets: ["Rose Ave", "Oxnard Blvd", "5th St"] },
  { city: "San Diego (North)", zip: "92121", lat: 32.91, lng: -117.22, streets: ["Mira Mesa Blvd", "Sorrento Valley Rd"] },
];

const NAME_PREFIXES = [
  "Pacific", "Golden State", "Crescent", "Horizon", "Pinnacle", "Redwood", "Beacon",
  "Harbor", "Summit", "Cascade", "Meridian", "Coastal", "Orange Grove", "Valley",
  "Vanguard", "Cornerstone", "Westbridge", "Sierra", "Sunstone", "Cypress",
  "Catalina", "Avalon", "Sequoia", "Anchor", "Ironwood", "Silverline", "Emerald",
  "Juniper", "Oakridge", "Highland",
];

const NAME_SUFFIXES_BY_INDUSTRY: Record<Industry, string[]> = {
  Manufacturing: ["Manufacturing", "Industries", "Fabrication", "Machining", "Metalworks"],
  "Wholesale Distribution": ["Distribution", "Supply Co", "Wholesale", "Trade Group"],
  "Healthcare Services": ["Health Partners", "Medical Group", "Care Network", "Clinics"],
  "Professional Services": ["Partners", "Advisory", "Consulting", "Group", "Legal"],
  "Logistics & Transportation": ["Logistics", "Freight", "Transport", "Cargo"],
  "Real Estate": ["Properties", "Realty", "Capital", "Holdings"],
  Construction: ["Construction", "Builders", "Contracting", "Development"],
  "Food & Beverage": ["Foods", "Beverage Co", "Brands", "Kitchens"],
  Technology: ["Systems", "Labs", "Technologies", "Software"],
  "Media & Entertainment": ["Media", "Studios", "Productions", "Entertainment"],
  Retail: ["Retail", "Outfitters", "Markets", "Shops"],
};

const FIRST_NAMES = [
  "Sarah", "Michael", "Jennifer", "David", "Jessica", "Robert", "Maria", "James",
  "Linda", "John", "Patricia", "William", "Elizabeth", "Richard", "Barbara",
  "Carlos", "Priya", "Wei", "Aisha", "Jin", "Raj", "Lucia", "Samir",
  "Nora", "Hector", "Aki", "Diego", "Tomás", "Naomi", "Kenji",
];
const LAST_NAMES = [
  "Garcia", "Martinez", "Rodriguez", "Hernandez", "Lopez", "Gonzalez", "Chen",
  "Patel", "Nguyen", "Kim", "Singh", "Cohen", "Reyes", "Mendoza", "Johnson",
  "Williams", "Brown", "Davis", "Miller", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Torres", "Ramirez", "Nakamura",
];

const PRIOR_EMPLOYERS_COMMON = [
  "Deloitte", "PwC", "EY", "KPMG", "McKinsey", "Bain", "BCG",
  "Wells Fargo", "Bank of America", "JPMorgan", "Goldman Sachs",
];
const PRIOR_EMPLOYERS_BY_INDUSTRY: Record<Industry, string[]> = {
  Manufacturing: ["Honeywell", "3M", "GE", "Raytheon", "Emerson Electric", "Siemens"],
  "Wholesale Distribution": ["Sysco", "US Foods", "Grainger", "HD Supply", "Reliance Steel"],
  "Healthcare Services": ["Kaiser Permanente", "Sutter Health", "Cedars-Sinai", "DaVita", "HCA"],
  "Professional Services": ["Latham & Watkins", "Accenture", "Gibson Dunn", "Marsh McLennan"],
  "Logistics & Transportation": ["FedEx", "UPS", "XPO Logistics", "Ryder", "Knight-Swift"],
  "Real Estate": ["CBRE", "JLL", "Cushman & Wakefield", "Irvine Company", "Kilroy Realty"],
  Construction: ["Bechtel", "Turner Construction", "AECOM", "Parsons", "Kiewit"],
  "Food & Beverage": ["PepsiCo", "Nestlé", "Tyson Foods", "Constellation Brands"],
  Technology: ["Google", "Apple", "Microsoft", "Meta", "Amazon", "Salesforce", "Snowflake"],
  "Media & Entertainment": ["Disney", "Warner Bros", "Paramount", "NBCUniversal", "Netflix"],
  Retail: ["Nordstrom", "Target", "Gap Inc", "Best Buy", "Macy's"],
};

const LIKELY_BANKS = [
  "Wells Fargo",
  "Bank of America",
  "JPMorgan Chase",
  "US Bank",
  "City National",
  "Pacific Western Bank",
  "East West Bank",
  "First Republic",
];

const GROWTH_DESCRIPTIONS: Record<GrowthSignal["type"], string[]> = {
  funding: [
    "Closed Series C led by a growth-equity firm",
    "Raised mezzanine debt from an alternative lender",
    "Announced $40M growth round",
  ],
  move: [
    "Relocated HQ to a larger facility",
    "Consolidated into a new flagship office",
    "Signed long-term lease at a new Class-A location",
  ],
  filing: [
    "New DBA filed with California SOS",
    "Filed for an SBA-backed expansion loan",
    "UCC filing indicating new equipment financing",
  ],
  expansion: [
    "Opened a new Southern California location",
    "Expanded distribution footprint into Inland Empire",
    "Announced a second manufacturing line",
  ],
  hiring: [
    "Hiring surge: 30+ open roles on LinkedIn",
    "Added senior finance leadership",
    "Expanded sales team by 40% in the last 6 months",
  ],
  news: [
    "Featured in a regional business journal",
    "Named on a local fastest-growing private companies list",
    "CEO interviewed about expansion plans",
  ],
};

function pick<T>(r: () => number, arr: readonly T[]): T {
  return arr[Math.floor(r() * arr.length)];
}
function pickInt(r: () => number, lo: number, hi: number): number {
  return Math.floor(lo + r() * (hi - lo + 1));
}
function pickChance(r: () => number, p: number): boolean {
  return r() < p;
}

const LA_AREA_CODES = [
  "213", "310", "323", "424", "562", "626", "657", "714", "747",
  "818", "909", "949",
];

function makeExecutive(
  r: () => number,
  industry: Industry,
  role: string,
  emailDomain: string,
): Executive {
  const priorPool = [
    ...PRIOR_EMPLOYERS_BY_INDUSTRY[industry],
    ...PRIOR_EMPLOYERS_COMMON,
  ];
  const nPrior = pickInt(r, 1, 3);
  const seen = new Set<string>();
  const priors: string[] = [];
  while (priors.length < nPrior) {
    const p = pick(r, priorPool);
    if (!seen.has(p)) {
      seen.add(p);
      priors.push(p);
    }
  }
  const prestigious = new Set([
    "McKinsey", "Bain", "BCG", "Google", "Apple", "Microsoft", "Meta", "Amazon",
    "Goldman Sachs", "JPMorgan", "Deloitte", "PwC", "EY", "KPMG",
    "Disney", "Netflix", "Salesforce",
  ]);
  const prestigeHits = priors.filter((p) => prestigious.has(p)).length;
  const pedigreeBase = pickInt(r, 35, 70);
  const pedigreeScore = Math.min(
    100,
    pedigreeBase + prestigeHits * 12 + (role === "CEO" ? 5 : 0),
  );
  const first = pick(r, FIRST_NAMES);
  const last = pick(r, LAST_NAMES);
  const lowerFirst = first.toLowerCase();
  const lowerLast = last.toLowerCase();
  const emailLocal = `${lowerFirst}.${lowerLast}`.replace(/[^a-z.]/g, "");
  const area = pick(r, LA_AREA_CODES);
  const line = String(pickInt(r, 100, 199)).padStart(3, "0");
  const slug = `${lowerFirst}-${lowerLast}`.replace(/[^a-z-]/g, "");
  const handle = String(pickInt(r, 10000, 99999));
  return {
    name: `${first} ${last}`,
    role,
    email: `${emailLocal}@${emailDomain}`,
    phone: `(${area}) 555-0${line}`,
    linkedinUrl: `https://www.linkedin.com/in/${slug}-${handle}`,
    priorEmployers: priors,
    pedigreeScore,
    tenureYears: pickInt(r, 1, 14),
  };
}

function makeGrowthSignals(r: () => number): GrowthSignal[] {
  const count = pickChance(r, 0.7) ? pickInt(r, 1, 3) : 0;
  const signals: GrowthSignal[] = [];
  const types: GrowthSignal["type"][] = [
    "funding", "move", "filing", "expansion", "hiring", "news",
  ];
  const used = new Set<string>();
  for (let i = 0; i < count; i++) {
    const type = pick(r, types);
    if (used.has(type)) continue;
    used.add(type);
    signals.push({
      type,
      description: pick(r, GROWTH_DESCRIPTIONS[type]),
      recencyMonths: pickInt(r, 1, 18),
      weight: pickInt(r, 2, 5),
    });
  }
  return signals;
}

function makeCrmIssues(r: () => number, isInCrm: boolean): CrmIssue[] {
  if (!isInCrm) return [];
  const roll = r();
  if (roll < 0.45) return [];
  const options: CrmIssue[] = [
    {
      type: "outdated",
      severity: "medium",
      description: "CRM record last updated >18 months ago.",
    },
    {
      type: "better_hq",
      severity: "low",
      description: "CRM lists an old HQ; more recent address available.",
    },
    {
      type: "better_contact",
      severity: "medium",
      description: "CRM primary contact no longer at company; current CFO identified.",
    },
    {
      type: "revenue_mismatch",
      severity: "high",
      description: "CRM stored revenue differs significantly from refreshed estimate.",
    },
    {
      type: "duplicate_of",
      severity: "medium",
      description: "Likely duplicate of a separate CRM record.",
    },
    {
      type: "weak_record",
      severity: "low",
      description: "Sparse CRM record — missing employee count and executives.",
    },
  ];
  const issues: CrmIssue[] = [];
  const count = roll < 0.7 ? 1 : 2;
  const seen = new Set<string>();
  while (issues.length < count) {
    const o = pick(r, options);
    if (seen.has(o.type)) continue;
    seen.add(o.type);
    issues.push(o);
  }
  return issues;
}

function makeCompany(r: () => number, index: number): Company {
  const industry = pick(r, INDUSTRIES);
  const city = pick(r, CITIES);
  const street = pick(r, city.streets);
  const streetNumber = pickInt(r, 100, 9999);

  const jitterLat = (r() - 0.5) * 0.05;
  const jitterLng = (r() - 0.5) * 0.05;
  const lat = city.lat + jitterLat;
  const lng = city.lng + jitterLng;

  const prefix = pick(r, NAME_PREFIXES);
  const suffix = pick(r, NAME_SUFFIXES_BY_INDUSTRY[industry]);
  const namePart2 = pick(r, ["", "Bay", "Ridge", "Point", "Hills", "Coast", "Harbor"]);
  const name = namePart2
    ? `${prefix} ${namePart2} ${suffix}`
    : `${prefix} ${suffix}`;

  const employeeCount = pickInt(r, 25, 1200);
  const meta = INDUSTRY_META[industry];

  const digitalMaturity: DigitalMaturity =
    r() + meta.digitalMaturityBias > 0.66
      ? "high"
      : r() + meta.digitalMaturityBias > 0.33
        ? "medium"
        : "low";

  const employeeCountConfidence: DataConfidence =
    r() < 0.5 ? "high" : r() < 0.8 ? "medium" : "low";

  const emailDomain =
    name
      .toLowerCase()
      .split(/\s+/)
      .slice(0, 2)
      .join("")
      .replace(/[^a-z0-9]/g, "") + ".com";

  const roles = ["CEO", "CFO", "COO", "President", "VP Finance"];
  const execCount = pickInt(r, 2, 4);
  const executives: Executive[] = [];
  for (let i = 0; i < execCount; i++) {
    executives.push(
      makeExecutive(r, industry, roles[i % roles.length], emailDomain),
    );
  }

  const growthSignals = makeGrowthSignals(r);

  const hasFootprint = pickChance(r, 0.7);
  const officeFootprintSqFt = hasFootprint
    ? Math.round(employeeCount * meta.sqFtPerEmployee * (0.7 + r() * 0.9))
    : undefined;

  const isInCrm = index < 60;
  const crmIssues = makeCrmIssues(r, isInCrm);

  let knownRevenue: number | undefined;
  if (isInCrm && pickChance(r, 0.85)) {
    const rough = employeeCount * meta.revenuePerEmployee;
    const isMismatch = crmIssues.some((i) => i.type === "revenue_mismatch");
    const drift = isMismatch ? 0.6 + r() * 0.7 : 0.85 + r() * 0.25;
    knownRevenue = Math.round(rough * drift);
  }

  let bankingRelationship;
  if (pickChance(r, 0.55)) {
    const lockIn = pickInt(r, 20, 95);
    bankingRelationship = {
      likelyBank: pick(r, LIKELY_BANKS),
      evidence: pickChance(r, 0.5)
        ? "UCC filing lists financing statement with this institution."
        : "Public relationship disclosure in recent debt facility announcement.",
      lockInScore: lockIn,
    };
  }

  const productAngle = pick(r, meta.productAngles);

  const onRoute = index >= 60 && index < 70;

  return {
    id: `co-${String(index + 1).padStart(3, "0")}`,
    name,
    hq: {
      address: `${streetNumber} ${street}`,
      city: city.city,
      state: "CA",
      zip: city.zip,
      lat,
      lng,
    },
    industry,
    employeeCount,
    employeeCountConfidence,
    knownRevenue,
    knownRevenueSource: knownRevenue
      ? pick(r, ["CRM", "ZoomInfo", "D&B"] as const)
      : undefined,
    officeFootprintSqFt,
    numberOfLocations: pickChance(r, 0.4)
      ? pickInt(r, 2, 6)
      : 1,
    yearFounded: pickInt(r, 1975, 2022),
    websiteQualityScore: pickInt(r, 30, 95),
    digitalMaturity,
    executives,
    crmStatus: isInCrm ? "in_crm" : "new_lead",
    crmIssues,
    growthSignals,
    bankingRelationship,
    productAngle,
    onRoute,
  };
}

function generateCompanies(seed: number, count: number): Company[] {
  const r = mulberry32(seed);
  const out: Company[] = [];
  for (let i = 0; i < count; i++) out.push(makeCompany(r, i));
  return out;
}

export const COMPANIES: Company[] = generateCompanies(20260421, 150);

export const companyById = (id: string) =>
  COMPANIES.find((c) => c.id === id);

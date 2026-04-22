import type {
  BusinessLogicConfig,
  Company,
  Scored,
  Territory,
} from "@/lib/types";
import { estimateRevenue } from "./revenue";
import { scorePriority } from "./priority";
import { inTerritory } from "./geo";

export const DEFAULT_CONFIG: BusinessLogicConfig = {
  targetRevenueBand: [25_000_000, 250_000_000],
  includedIndustries: [],
  excludedIndustries: [],
  activeTerritoryId: "la-oc",
  weights: {
    territoryFit: 0.25,
    revenueFit: 0.2,
    confidence: 0.15,
    growth: 0.15,
    executive: 0.1,
    whitespace: 0.15,
    relationshipLockIn: 0.3,
  },
};

export function scoreCompany(
  company: Company,
  config: BusinessLogicConfig,
  territory: Territory,
): Scored {
  const revenue = estimateRevenue(company);
  const priority = scorePriority(company, revenue, config, territory);
  return {
    company,
    revenue,
    priority,
    inTerritory: inTerritory([company.hq.lng, company.hq.lat], territory),
  };
}

export function scoreAll(
  companies: Company[],
  config: BusinessLogicConfig,
  territory: Territory,
): Scored[] {
  return companies.map((c) => scoreCompany(c, config, territory));
}

export { estimateRevenue } from "./revenue";
export { scorePriority } from "./priority";
export { inTerritory, distanceKm, distanceFromLineKm } from "./geo";
export { formatMoney, formatRevenueRange } from "./revenue";

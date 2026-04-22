import type {
  BusinessLogicConfig,
  Company,
  PriorityBreakdown,
  PriorityScore,
  PriorityTier,
  RevenueEstimate,
  Territory,
} from "@/lib/types";
import { inTerritory } from "./geo";

export function territoryFit(company: Company, territory: Territory): number {
  return inTerritory([company.hq.lng, company.hq.lat], territory) ? 100 : 0;
}

export function revenueFit(
  estimate: RevenueEstimate,
  band: [number, number],
): number {
  const [lo, hi] = band;
  const m = estimate.midpoint;
  if (m >= lo && m <= hi) return 100;
  const refDistance = m < lo ? (lo - m) / lo : (m - hi) / hi;
  return Math.max(0, Math.round(100 - refDistance * 160));
}

export function growthScore(company: Company): number {
  const raw = company.growthSignals
    .map((s) => s.weight * Math.max(0, 1 - s.recencyMonths / 24))
    .reduce((a, b) => a + b, 0);
  return Math.min(100, Math.round(raw * 22));
}

export function executiveScore(company: Company): number {
  if (company.executives.length === 0) return 0;
  const top = [...company.executives]
    .sort((a, b) => b.pedigreeScore - a.pedigreeScore)
    .slice(0, 3);
  return Math.round(
    top.reduce((s, e) => s + e.pedigreeScore, 0) / top.length,
  );
}

export function whitespaceScore(company: Company): number {
  return company.crmStatus === "new_lead" ? 100 : 30;
}

export function relationshipLockInPenalty(company: Company): number {
  return company.bankingRelationship?.lockInScore ?? 0;
}

export function industryAllowed(
  company: Company,
  config: BusinessLogicConfig,
): boolean {
  if (config.excludedIndustries.includes(company.industry)) return false;
  if (
    config.includedIndustries.length > 0 &&
    !config.includedIndustries.includes(company.industry)
  )
    return false;
  return true;
}

const tierFor = (score: number): PriorityTier =>
  score >= 80 ? "Tier 1" : score >= 60 ? "Tier 2" : "Tier 3";

const reasonFor = (
  breakdown: PriorityBreakdown,
  weights: BusinessLogicConfig["weights"],
): { reason: string; topContributors: { label: string; value: number }[] } => {
  const positive: { label: string; value: number }[] = [
    {
      label: "in territory",
      value: breakdown.territoryFit * weights.territoryFit,
    },
    {
      label: "fits revenue band",
      value: breakdown.revenueFit * weights.revenueFit,
    },
    {
      label: "high confidence",
      value: breakdown.confidence * weights.confidence,
    },
    { label: "growth signals", value: breakdown.growth * weights.growth },
    {
      label: "strong executives",
      value: breakdown.executive * weights.executive,
    },
    { label: "new to CRM", value: breakdown.whitespace * weights.whitespace },
  ]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const topLabels = positive
    .filter((p) => p.value > 8)
    .slice(0, 2)
    .map((p) => p.label);

  let reason =
    topLabels.length === 0
      ? "Limited positive signals against current weighting."
      : `Drivers: ${topLabels.join(", ")}.`;
  if (
    breakdown.relationshipLockIn * weights.relationshipLockIn >=
    15
  ) {
    reason += ` Suppressed by likely entrenched banking relationship.`;
  }
  return { reason, topContributors: positive };
};

const actionFor = (
  breakdown: PriorityBreakdown,
  score: number,
  company: Company,
  estimate: RevenueEstimate,
): string => {
  const tier = tierFor(score);
  if (tier === "Tier 1" && estimate.confidence >= 70) {
    return company.crmStatus === "new_lead"
      ? "Schedule intro outreach this week."
      : "Re-engage — high-priority CRM name.";
  }
  if (tier === "Tier 1" && estimate.confidence < 70) {
    return "Validate HQ and exec team before outreach.";
  }
  if (tier === "Tier 2" && breakdown.growth >= 55) {
    return "Monitor for expansion — add to watchlist.";
  }
  if (tier === "Tier 2" && company.crmStatus === "new_lead") {
    return "Add to watchlist; re-evaluate next quarter.";
  }
  if (tier === "Tier 3" && breakdown.relationshipLockIn >= 70) {
    return "Likely entrenched with competitor bank — deprioritize.";
  }
  if (tier === "Tier 3" && breakdown.revenueFit < 40) {
    return "Revenue outside target band — skip.";
  }
  if (tier === "Tier 3" && breakdown.territoryFit === 0) {
    return "Outside territory — skip.";
  }
  return "Monitor for change; low current priority.";
};

export function scorePriority(
  company: Company,
  estimate: RevenueEstimate,
  config: BusinessLogicConfig,
  territory: Territory,
): PriorityScore {
  const breakdown: PriorityBreakdown = {
    territoryFit: territoryFit(company, territory),
    revenueFit: revenueFit(estimate, config.targetRevenueBand),
    confidence: estimate.confidence,
    growth: growthScore(company),
    executive: executiveScore(company),
    whitespace: whitespaceScore(company),
    relationshipLockIn: relationshipLockInPenalty(company),
  };
  const { weights } = config;

  const positive =
    breakdown.territoryFit * weights.territoryFit +
    breakdown.revenueFit * weights.revenueFit +
    breakdown.confidence * weights.confidence +
    breakdown.growth * weights.growth +
    breakdown.executive * weights.executive +
    breakdown.whitespace * weights.whitespace;
  const penalty = breakdown.relationshipLockIn * weights.relationshipLockIn;
  const industryPenalty = industryAllowed(company, config) ? 0 : 40;
  const priorityScore = Math.max(
    0,
    Math.min(100, Math.round(positive - penalty - industryPenalty)),
  );

  const tier = tierFor(priorityScore);
  const { reason, topContributors } = reasonFor(breakdown, weights);
  const suggestedAction = actionFor(
    breakdown,
    priorityScore,
    company,
    estimate,
  );

  return {
    priorityScore,
    tier,
    reason,
    suggestedAction,
    breakdown,
    topContributors,
  };
}

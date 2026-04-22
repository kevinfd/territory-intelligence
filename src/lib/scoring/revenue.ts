import type { Company, RevenueEstimate, SignalContribution } from "@/lib/types";
import { INDUSTRY_META } from "@/lib/data/industries";

const fmtMoney = (n: number) => {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};

export function estimateRevenue(company: Company): RevenueEstimate {
  const meta = INDUSTRY_META[company.industry];
  const contributions: SignalContribution[] = [];

  const employeeBased = company.employeeCount * meta.revenuePerEmployee;
  contributions.push({
    label: "Employee count × industry benchmark",
    contribution: 0,
    detail: `${company.employeeCount.toLocaleString()} employees × ${fmtMoney(
      meta.revenuePerEmployee,
    )}/employee (${company.industry}) → ${fmtMoney(employeeBased)}`,
  });

  let footprintBased: number | null = null;
  if (company.officeFootprintSqFt) {
    const implied = company.officeFootprintSqFt / meta.sqFtPerEmployee;
    footprintBased = implied * meta.revenuePerEmployee;
    contributions.push({
      label: "HQ / office footprint proxy",
      contribution: 0,
      detail: `${company.officeFootprintSqFt.toLocaleString()} sq ft ÷ ${meta.sqFtPerEmployee} sq ft/employee → ~${Math.round(
        implied,
      )} staff-equivalents → ${fmtMoney(footprintBased)}`,
    });
  }

  const pedigreeAvg =
    company.executives.reduce((s, e) => s + e.pedigreeScore, 0) /
    Math.max(company.executives.length, 1);
  const pedigreeMultiplier =
    pedigreeAvg >= 85 ? 1.18 : pedigreeAvg >= 70 ? 1.09 : 1.0;
  if (pedigreeMultiplier > 1) {
    contributions.push({
      label: "Executive pedigree uplift",
      contribution: 0,
      detail: `Avg exec pedigree ${pedigreeAvg.toFixed(
        0,
      )}/100 (prior employers like ${company.executives[0]?.priorEmployers.slice(0, 2).join(", ")}) → ×${pedigreeMultiplier.toFixed(2)} multiplier`,
    });
  }

  const locationMultiplier = 1 + (company.numberOfLocations - 1) * 0.06;
  if (company.numberOfLocations > 1) {
    contributions.push({
      label: "Multi-location footprint",
      contribution: 0,
      detail: `${company.numberOfLocations} locations → ×${locationMultiplier.toFixed(2)} multiplier`,
    });
  }

  const digitalMaturityAdj =
    company.digitalMaturity === "high"
      ? 0.05
      : company.digitalMaturity === "low"
        ? -0.05
        : 0;
  if (digitalMaturityAdj !== 0) {
    contributions.push({
      label: "Digital maturity signal",
      contribution: 0,
      detail: `Digital maturity ${company.digitalMaturity} → ${digitalMaturityAdj > 0 ? "+" : ""}${(digitalMaturityAdj * 100).toFixed(0)}%`,
    });
  }

  const growthBoost = Math.min(
    0.15,
    company.growthSignals
      .filter((s) => s.recencyMonths <= 12)
      .reduce((a, s) => a + s.weight * 0.02, 0),
  );
  if (growthBoost > 0) {
    contributions.push({
      label: "Recent growth signals",
      contribution: 0,
      detail: `Expansion/funding/filing signals in last 12 months → +${(growthBoost * 100).toFixed(0)}%`,
    });
  }

  const primary = footprintBased
    ? (employeeBased + footprintBased) / 2
    : employeeBased;
  const midpoint =
    primary *
    pedigreeMultiplier *
    locationMultiplier *
    (1 + digitalMaturityAdj + growthBoost);

  let confidence = 50;
  if (company.employeeCountConfidence === "high") confidence += 25;
  else if (company.employeeCountConfidence === "medium") confidence += 10;
  if (company.officeFootprintSqFt) confidence += 8;
  if (company.executives.some((e) => e.pedigreeScore > 60)) confidence += 5;
  if (company.growthSignals.some((s) => s.type === "filing")) confidence += 8;
  if (company.growthSignals.some((s) => s.type === "funding")) confidence += 4;
  if (company.knownRevenue) confidence += 4;

  const conflicts: string[] = [];
  if (footprintBased) {
    const ratio =
      Math.max(employeeBased, footprintBased) /
      Math.min(employeeBased, footprintBased);
    if (ratio > 1.6) {
      confidence -= 12;
      conflicts.push(
        `Employee-based (${fmtMoney(employeeBased)}) and footprint-based (${fmtMoney(footprintBased)}) estimates disagree by ${((ratio - 1) * 100).toFixed(0)}%.`,
      );
    }
  }
  if (company.knownRevenue) {
    const diff = Math.abs(company.knownRevenue - midpoint) / midpoint;
    if (diff > 0.5) {
      confidence -= 10;
      conflicts.push(
        `${company.knownRevenueSource ?? "CRM"} revenue ${fmtMoney(company.knownRevenue)} differs from estimated ${fmtMoney(midpoint)} by ${(diff * 100).toFixed(0)}%.`,
      );
    }
  }
  confidence = Math.max(0, Math.min(100, confidence));

  const spread = confidence >= 75 ? 0.15 : confidence >= 55 ? 0.22 : 0.35;
  const rangeLow = midpoint * (1 - spread);
  const rangeHigh = midpoint * (1 + spread);

  const totalAbsWeight =
    employeeBased +
    (footprintBased ?? 0) +
    midpoint * (pedigreeMultiplier - 1) +
    midpoint * (locationMultiplier - 1) +
    midpoint * Math.abs(digitalMaturityAdj) +
    midpoint * growthBoost;

  contributions[0].contribution = totalAbsWeight
    ? employeeBased / totalAbsWeight
    : 1;
  let i = 1;
  if (footprintBased) {
    contributions[i++].contribution = footprintBased / totalAbsWeight;
  }
  if (pedigreeMultiplier > 1) {
    contributions[i++].contribution =
      (midpoint * (pedigreeMultiplier - 1)) / totalAbsWeight;
  }
  if (company.numberOfLocations > 1) {
    contributions[i++].contribution =
      (midpoint * (locationMultiplier - 1)) / totalAbsWeight;
  }
  if (digitalMaturityAdj !== 0) {
    contributions[i++].contribution =
      (midpoint * Math.abs(digitalMaturityAdj)) / totalAbsWeight;
  }
  if (growthBoost > 0) {
    contributions[i++].contribution = (midpoint * growthBoost) / totalAbsWeight;
  }

  return {
    rangeLow,
    rangeHigh,
    midpoint,
    confidence,
    contributingSignals: contributions,
    conflicts,
  };
}

export function formatRevenueRange(est: RevenueEstimate) {
  return `${fmtMoney(est.rangeLow)} – ${fmtMoney(est.rangeHigh)}`;
}

export function formatMoney(n: number) {
  return fmtMoney(n);
}

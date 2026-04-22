"use client";

import { useScoredCompanies } from "@/lib/hooks/use-scored";
import type { Scored } from "@/lib/types";
import { cn } from "@/lib/utils";

type HeroKpi = {
  label: string;
  value: number;
  hint: string;
  tone: "dark" | "neutral" | "intel";
};

type MinorKpi = {
  label: string;
  value: number;
  hint: string;
  tone: "neutral" | "warning" | "positive";
};

function computeKpis(scored: Scored[]): { hero: HeroKpi[]; minor: MinorKpi[] } {
  const inTer = scored.filter((s) => s.inTerritory);
  const crmInTer = inTer.filter((s) => s.company.crmStatus === "in_crm");
  const newLeadInTer = inTer.filter((s) => s.company.crmStatus === "new_lead");
  const tier1InTer = inTer.filter((s) => s.priority.tier === "Tier 1");
  const newHighFit = newLeadInTer.filter((s) => s.priority.tier === "Tier 1");
  const lowConfidence = inTer.filter((s) => s.revenue.confidence < 55);
  const growth = inTer.filter((s) =>
    s.company.growthSignals.some((g) => g.recencyMonths <= 6),
  );

  return {
    hero: [
      {
        label: "Total in Territory",
        value: inTer.length,
        hint: "Accounts",
        tone: "dark",
      },
      {
        label: "In CRM",
        value: crmInTer.length,
        hint: "Active Portfolios",
        tone: "neutral",
      },
      {
        label: "New Leads",
        value: newLeadInTer.length,
        hint: "Discovery Mode",
        tone: "intel",
      },
    ],
    minor: [
      {
        label: "Tier 1 opportunities",
        value: tier1InTer.length,
        hint: "Score ≥ 80",
        tone: "positive",
      },
      {
        label: "New high-fit leads",
        value: newHighFit.length,
        hint: "Tier 1 & not in CRM",
        tone: "positive",
      },
      {
        label: "Low-confidence records",
        value: lowConfidence.length,
        hint: "Confidence < 55%",
        tone: "warning",
      },
      {
        label: "Active growth signals",
        value: growth.length,
        hint: "Signal in last 6 months",
        tone: "neutral",
      },
    ],
  };
}

const heroClass = {
  dark: "bg-primary-container border-primary-container text-primary-foreground",
  neutral:
    "bg-surface-container-lowest border-outline-variant text-on-surface",
  intel: "bg-intel-fixed border-intel text-on-intel-container",
} as const;

const heroHintClass = {
  dark: "text-on-primary-container",
  neutral: "text-on-surface-variant",
  intel: "text-intel-dark",
} as const;

const heroLabelClass = {
  dark: "text-on-primary-container",
  neutral: "text-outline",
  intel: "text-on-intel-container",
} as const;

const minorToneClass = {
  neutral: "text-on-surface",
  warning: "text-warning",
  positive: "text-success",
} as const;

export function KpiCards() {
  const scored = useScoredCompanies();
  const { hero, minor } = computeKpis(scored);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {hero.map((kpi) => (
          <div
            key={kpi.label}
            className={cn(
              "flex flex-col justify-between rounded-xl border p-5 shadow-sm",
              heroClass[kpi.tone],
            )}
          >
            <span
              className={cn(
                "text-[11px] font-semibold uppercase tracking-wider",
                heroLabelClass[kpi.tone],
              )}
            >
              {kpi.label}
            </span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono-num text-[36px] font-bold leading-none tracking-tight">
                {kpi.value}
              </span>
              <span
                className={cn("text-xs", heroHintClass[kpi.tone])}
              >
                {kpi.hint}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {minor.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-outline">
              {kpi.label}
            </p>
            <p
              className={cn(
                "mt-1 font-mono-num text-[22px] font-bold leading-none tracking-tight",
                minorToneClass[kpi.tone],
              )}
            >
              {kpi.value}
            </p>
            <p className="mt-1 text-[11px] text-on-surface-variant">
              {kpi.hint}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

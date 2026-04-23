"use client";

import { useScoredCompanies } from "@/lib/hooks/use-scored";
import type { Scored } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DitherPanel } from "@/components/dither-panel";

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

const minorToneClass = {
  neutral: "text-on-surface",
  warning: "text-warning",
  positive: "text-intel-dark",
} as const;

function HeroCard({ kpi }: { kpi: HeroKpi }) {
  if (kpi.tone === "dark") {
    return (
      <DitherPanel
        variant="gray-black"
        className="flex flex-col justify-between rounded-2xl p-5 text-primary-foreground shadow-sm"
        noiseOpacity={0.35}
      >
        <span className="text-[11px] font-semibold uppercase tracking-widest text-intel-fixed-dim">
          {kpi.label}
        </span>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono-num text-[36px] font-bold leading-none tracking-tight">
            {kpi.value}
          </span>
          <span className="text-xs text-intel-fixed-dim">{kpi.hint}</span>
        </div>
      </DitherPanel>
    );
  }
  if (kpi.tone === "intel") {
    return (
      <DitherPanel
        variant="everglade"
        className="flex flex-col justify-between rounded-2xl p-5 shadow-sm"
        noiseOpacity={0.45}
      >
        <span className="text-[11px] font-semibold uppercase tracking-widest text-on-intel-container">
          {kpi.label}
        </span>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono-num text-[36px] font-bold leading-none tracking-tight text-primary-container">
            {kpi.value}
          </span>
          <span className="text-xs text-on-intel-container">{kpi.hint}</span>
        </div>
      </DitherPanel>
    );
  }
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-outline">
        {kpi.label}
      </span>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono-num text-[36px] font-bold leading-none tracking-tight text-on-surface">
          {kpi.value}
        </span>
        <span className="text-xs text-on-surface-variant">{kpi.hint}</span>
      </div>
    </div>
  );
}

export function KpiCards({ stacked = false }: { stacked?: boolean }) {
  const scored = useScoredCompanies();
  const { hero, minor } = computeKpis(scored);

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "grid gap-3",
          stacked ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3",
        )}
      >
        {hero.map((kpi) => (
          <HeroCard key={kpi.label} kpi={kpi} />
        ))}
      </div>
      <div
        className={cn(
          "grid gap-3",
          stacked ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-4",
        )}
      >
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

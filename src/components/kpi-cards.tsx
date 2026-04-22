"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useScoredCompanies } from "@/lib/hooks/use-scored";
import type { Scored } from "@/lib/types";

type Kpi = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "positive" | "warning";
};

function computeKpis(scored: Scored[]): Kpi[] {
  const inTer = scored.filter((s) => s.inTerritory);
  const crmInTer = inTer.filter((s) => s.company.crmStatus === "in_crm");
  const newLeadInTer = inTer.filter((s) => s.company.crmStatus === "new_lead");
  const tier1InTer = inTer.filter((s) => s.priority.tier === "Tier 1");
  const newHighFit = newLeadInTer.filter((s) => s.priority.tier === "Tier 1");
  const lowConfidence = inTer.filter((s) => s.revenue.confidence < 55);
  const growth = inTer.filter((s) =>
    s.company.growthSignals.some((g) => g.recencyMonths <= 6),
  );

  return [
    {
      label: "Companies in territory",
      value: inTer.length,
      hint: `${crmInTer.length} CRM · ${newLeadInTer.length} new leads`,
    },
    {
      label: "CRM names in territory",
      value: crmInTer.length,
      hint: `${crmInTer.filter((s) => s.company.crmIssues.length > 0).length} with data issues`,
    },
    {
      label: "New high-fit leads",
      value: newHighFit.length,
      hint: "Not currently in CRM",
      tone: "positive",
    },
    {
      label: "Tier 1 opportunities",
      value: tier1InTer.length,
      hint: "Score ≥ 80",
      tone: "positive",
    },
    {
      label: "Low-confidence records",
      value: lowConfidence.length,
      hint: "Revenue confidence < 55%",
      tone: "warning",
    },
    {
      label: "Active growth signals",
      value: growth.length,
      hint: "Signal in last 6 months",
    },
  ];
}

const toneClass: Record<NonNullable<Kpi["tone"]>, string> = {
  default: "",
  positive: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
};

export function KpiCards() {
  const scored = useScoredCompanies();
  const kpis = computeKpis(scored);
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="py-4">
          <CardContent className="px-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {kpi.label}
            </p>
            <p
              className={`mt-1 text-2xl font-semibold tracking-tight ${toneClass[kpi.tone ?? "default"]}`}
            >
              {kpi.value}
            </p>
            {kpi.hint && (
              <p className="mt-0.5 text-xs text-muted-foreground">{kpi.hint}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

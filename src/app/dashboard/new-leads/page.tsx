"use client";

import { ProspectTable } from "@/components/prospect-table";
import { TerritoryMap } from "@/components/territory-map";
import { useScoredCompanies } from "@/lib/hooks/use-scored";
import { useRequireBanker } from "@/lib/hooks/use-require-banker";

export default function NewLeadsPage() {
  const activeBankerId = useRequireBanker();
  const scored = useScoredCompanies();
  if (!activeBankerId) return null;

  const rows = scored
    .filter((s) => s.inTerritory && s.company.crmStatus === "new_lead")
    .sort((a, b) => b.priority.priorityScore - a.priority.priorityScore);

  const tier1 = rows.filter((r) => r.priority.tier === "Tier 1").length;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-outline">
          Discovery · New Leads
        </p>
        <h1 className="mt-1 text-[24px] font-bold tracking-tight text-on-surface sm:text-[28px]">
          {rows.length} prospects not in your CRM
        </h1>
        <p className="mt-1 text-[13px] text-on-surface-variant">
          {tier1} Tier&nbsp;1 matches. High-propensity fits with your territory
          and revenue band.
        </p>
      </div>
      <TerritoryMap
        highlightFilter={(s) => s.company.crmStatus === "new_lead"}
        className="relative h-[320px] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm sm:h-[400px]"
      />
      <ProspectTable
        rows={rows}
        columns={["name", "revenue", "confidence", "signal", "tier", "action"]}
      />
    </div>
  );
}

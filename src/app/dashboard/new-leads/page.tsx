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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          New leads (not in CRM)
        </h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} prospects identified in territory · {tier1} Tier&nbsp;1
          matches.
        </p>
      </div>
      <TerritoryMap
        highlightFilter={(s) => s.company.crmStatus === "new_lead"}
      />
      <ProspectTable
        rows={rows}
        columns={[
          "tier",
          "name",
          "industry",
          "city",
          "revenue",
          "confidence",
          "signal",
          "action",
        ]}
      />
    </div>
  );
}

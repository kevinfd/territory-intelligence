"use client";

import { ProspectTable } from "@/components/prospect-table";
import { TerritoryMap } from "@/components/territory-map";
import { useScoredCompanies } from "@/lib/hooks/use-scored";
import { useRequireBanker } from "@/lib/hooks/use-require-banker";

export default function CrmPage() {
  const activeBankerId = useRequireBanker();
  const scored = useScoredCompanies();
  if (!activeBankerId) return null;

  const rows = scored
    .filter((s) => s.inTerritory && s.company.crmStatus === "in_crm")
    .sort((a, b) => b.priority.priorityScore - a.priority.priorityScore);

  const withIssues = rows.filter((r) => r.company.crmIssues.length > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Existing CRM names
        </h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} companies in your CRM for this territory · {withIssues}{" "}
          with refreshed data suggestions.
        </p>
      </div>
      <TerritoryMap
        highlightFilter={(s) => s.company.crmStatus === "in_crm"}
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
          "issue",
          "action",
        ]}
      />
    </div>
  );
}

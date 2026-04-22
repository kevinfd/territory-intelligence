"use client";

import { KpiCards } from "@/components/kpi-cards";
import { ProspectTable } from "@/components/prospect-table";
import { TerritoryMap } from "@/components/territory-map";
import { useScoredCompanies } from "@/lib/hooks/use-scored";
import { useRequireBanker } from "@/lib/hooks/use-require-banker";

export default function DashboardOverviewPage() {
  const activeBankerId = useRequireBanker();
  const scored = useScoredCompanies();

  if (!activeBankerId) return null;

  const topPriorities = scored
    .filter((s) => s.inTerritory)
    .sort((a, b) => b.priority.priorityScore - a.priority.priorityScore)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Your territory</h1>
        <p className="text-sm text-muted-foreground">
          Start with the highest-priority opportunities.
        </p>
      </div>
      <KpiCards />
      <TerritoryMap />
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Top priorities in territory
        </h2>
        <ProspectTable rows={topPriorities} />
      </div>
    </div>
  );
}

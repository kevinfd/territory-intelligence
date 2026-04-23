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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-outline">
          Dashboard · Overview
        </p>
        <h1 className="mt-1 text-[24px] font-semibold tracking-tight text-on-surface sm:text-[28px]">
          Your territory at a glance
        </h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
        <KpiCards stacked />
        <TerritoryMap className="relative h-[360px] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm lg:h-full lg:min-h-[460px]" />
      </div>
      <div>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-outline">
            Top priorities in territory
          </h2>
        </div>
        <ProspectTable rows={topPriorities} />
      </div>
    </div>
  );
}

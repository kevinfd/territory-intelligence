"use client";

import { ProspectTable } from "@/components/prospect-table";
import { useScoredCompanies } from "@/lib/hooks/use-scored";
import { useAppStore } from "@/lib/store";
import { useRequireBanker } from "@/lib/hooks/use-require-banker";

export default function WatchlistPage() {
  const activeBankerId = useRequireBanker();
  const watchlistIds = useAppStore((s) => s.watchlistIds);
  const scored = useScoredCompanies();
  if (!activeBankerId) return null;

  const rows = scored
    .filter((s) => watchlistIds.includes(s.company.id))
    .sort((a, b) => b.priority.priorityScore - a.priority.priorityScore);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-outline">
          Watchlist
        </p>
        <h1 className="mt-1 text-[24px] font-bold tracking-tight text-on-surface sm:text-[28px]">
          Saved for follow-up
        </h1>
        <p className="mt-1 text-[13px] text-on-surface-variant">
          {rows.length} compan{rows.length === 1 ? "y" : "ies"} on your list.
        </p>
      </div>
      <ProspectTable
        rows={rows}
        columns={["name", "revenue", "confidence", "tier", "action"]}
        emptyLabel="Your watchlist is empty. Save prospects from any view."
      />
    </div>
  );
}

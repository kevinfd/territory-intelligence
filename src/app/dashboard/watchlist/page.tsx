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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Watchlist</h1>
        <p className="text-sm text-muted-foreground">
          Companies you&apos;ve saved for later follow-up.
        </p>
      </div>
      <ProspectTable
        rows={rows}
        emptyLabel="Your watchlist is empty. Save prospects from any view."
      />
    </div>
  );
}

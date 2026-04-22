"use client";

import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, Building2, Route } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TerritoryMap } from "@/components/territory-map";
import { useScoredCompanies } from "@/lib/hooks/use-scored";
import { useRequireBanker } from "@/lib/hooks/use-require-banker";
import { useAppStore } from "@/lib/store";
import { ROUTE_HUBS, hubById } from "@/lib/data/route-hubs";
import { distanceFromLineKm, formatMoney } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import type { PriorityTier } from "@/lib/types";

const tierPill = (t: PriorityTier) => {
  if (t === "Tier 1") return "bg-intel-dark text-white border-transparent";
  if (t === "Tier 2")
    return "bg-on-primary-container text-white border-transparent";
  return "bg-surface-container-highest text-on-surface-variant border-outline-variant";
};

export default function RouteBriefPage() {
  const activeBankerId = useRequireBanker();
  const scored = useScoredCompanies();
  const routeStart = useAppStore((s) => s.routeStart);
  const routeEnd = useAppStore((s) => s.routeEnd);
  const setRoute = useAppStore((s) => s.setRoute);
  const toggleWatchlist = useAppStore((s) => s.toggleWatchlist);
  const watchlistIds = useAppStore((s) => s.watchlistIds);
  const selectCompany = useAppStore((s) => s.selectCompany);
  const [bufferKm, setBufferKm] = useState(8);

  const start = hubById(routeStart);
  const end = hubById(routeEnd);

  const routeLine = useMemo(() => {
    if (!start || !end) return null;
    return [
      [start.lng, start.lat],
      [end.lng, end.lat],
    ] as [[number, number], [number, number]];
  }, [start, end]);

  const nearby = useMemo(() => {
    if (!start || !end) return [];
    const a: [number, number] = [start.lng, start.lat];
    const b: [number, number] = [end.lng, end.lat];
    return scored
      .filter((s) => s.inTerritory)
      .map((s) => ({
        scored: s,
        distanceKm: distanceFromLineKm(
          [s.company.hq.lng, s.company.hq.lat],
          a,
          b,
        ),
      }))
      .filter((x) => x.distanceKm <= bufferKm)
      .sort((a, b) =>
        a.scored.priority.priorityScore === b.scored.priority.priorityScore
          ? a.distanceKm - b.distanceKm
          : b.scored.priority.priorityScore - a.scored.priority.priorityScore,
      )
      .slice(0, 12);
  }, [start, end, scored, bufferKm]);

  if (!activeBankerId) return null;

  const saveAll = () => {
    for (const { scored: s } of nearby) {
      if (!watchlistIds.includes(s.company.id)) toggleWatchlist(s.company.id);
    }
  };

  const totalRevenue = nearby.reduce(
    (sum, { scored: s }) => sum + s.revenue.midpoint,
    0,
  );
  const tier1Count = nearby.filter(
    (n) => n.scored.priority.tier === "Tier 1",
  ).length;

  const estimatedMinutes = start && end
    ? Math.round(
        ((start.lat - end.lat) ** 2 + (start.lng - end.lng) ** 2) ** 0.5 * 180,
      )
    : 0;
  const estHours = Math.floor(estimatedMinutes / 60);
  const estMins = estimatedMinutes % 60;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-outline">
          Active Route
        </p>
        <h1 className="mt-1 text-[24px] font-bold tracking-tight text-on-surface sm:text-[28px]">
          {start && end
            ? `${start.label} → ${end.label}`
            : "Plan a route through your territory"}
        </h1>
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-outline">
              Start
            </label>
            <Select
              value={routeStart ?? undefined}
              onValueChange={(v) => setRoute(v || null, routeEnd)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick a starting hub" />
              </SelectTrigger>
              <SelectContent>
                {ROUTE_HUBS.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-outline">
              Destination
            </label>
            <Select
              value={routeEnd ?? undefined}
              onValueChange={(v) => setRoute(routeStart, v || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick a destination" />
              </SelectTrigger>
              <SelectContent>
                {ROUTE_HUBS.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-outline">
              Buffer · {bufferKm} km
            </label>
            <div className="flex h-10 items-center">
              <Slider
                min={2}
                max={20}
                step={1}
                value={[bufferKm]}
                onValueChange={(v) =>
                  setBufferKm(Array.isArray(v) ? v[0] : (v as number))
                }
                className="w-full"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setRoute(null, null)}
              className="h-10 rounded-lg border border-outline-variant px-4 text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container-low md:w-auto"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <TerritoryMap
        routeLine={routeLine}
        className="relative h-[320px] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm sm:h-[380px]"
      />

      {start && end ? (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-[20px] font-bold tracking-tight text-on-surface">
                <span className="font-mono-num">{nearby.length}</span>{" "}
                Opportunities Found
              </h2>
              <p className="text-[13px] text-on-surface-variant">
                High-propensity leads along your route.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {tier1Count > 0 && (
                <span className="rounded-full bg-intel-dark px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  {tier1Count} Tier 1
                </span>
              )}
              <button
                onClick={saveAll}
                disabled={nearby.length === 0}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary-container active:scale-[0.98] disabled:opacity-50"
              >
                <BookmarkCheck className="h-4 w-4" />
                Save all to watchlist
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {nearby.map(({ scored: s, distanceKm }) => {
              const watching = watchlistIds.includes(s.company.id);
              return (
                <div
                  key={s.company.id}
                  className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition-colors hover:border-intel-fixed-dim"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-intel-fixed text-on-intel-container">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex flex-1 flex-wrap items-start justify-between gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold text-on-surface">
                          {s.company.name}
                        </p>
                        <p className="text-[12px] text-on-surface-variant">
                          {s.company.hq.city}, {s.company.hq.state} ·{" "}
                          {distanceKm.toFixed(1)} km off route
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            tierPill(s.priority.tier),
                          )}
                        >
                          {s.priority.tier}
                        </span>
                        <span className="font-mono-num text-[14px] font-bold text-on-surface">
                          {s.priority.priorityScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => selectCompany(s.company.id)}
                      className="flex h-9 items-center justify-center rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary-container"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => toggleWatchlist(s.company.id)}
                      className={cn(
                        "flex h-9 items-center justify-center gap-1.5 rounded-lg border text-[13px] font-semibold transition-colors",
                        watching
                          ? "border-success bg-success-soft text-success"
                          : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low",
                      )}
                    >
                      {watching ? (
                        <>
                          <BookmarkCheck className="h-4 w-4" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {nearby.length > 0 && (
            <div className="rounded-xl bg-primary-container p-5 text-primary-foreground shadow-md">
              <div className="mb-3 flex items-center gap-2">
                <Route className="h-4 w-4 text-intel-fixed" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-on-primary-container">
                  Concise Drive Summary
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-on-primary-container">
                    Estimated Time
                  </p>
                  <p className="font-mono-num mt-1 text-[22px] font-bold leading-none text-primary-foreground">
                    {estHours > 0 ? `${estHours}h ` : ""}
                    {estMins}m
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-on-primary-container">
                    Revenue Potential
                  </p>
                  <p className="font-mono-num mt-1 text-[22px] font-bold leading-none text-intel-fixed">
                    {formatMoney(totalRevenue)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-5 text-primary-foreground/90">
                Optimal path detected with {nearby.length} qualified prospects
                within {bufferKm} km. {tier1Count} are Tier&nbsp;1 matches —
                prioritize these first and save the rest to your watchlist for
                follow-up.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center">
          <Route className="mx-auto mb-3 h-8 w-8 text-outline-variant" />
          <p className="text-[14px] font-semibold text-on-surface">
            Pick a start and destination
          </p>
          <p className="mt-1 text-[12px] text-on-surface-variant">
            We&apos;ll surface high-fit prospects along your route.
          </p>
        </div>
      )}
    </div>
  );
}

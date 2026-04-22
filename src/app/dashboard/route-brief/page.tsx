"use client";

import { useMemo, useState } from "react";
import { BookmarkPlus, Route } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProspectTable } from "@/components/prospect-table";
import { TerritoryMap } from "@/components/territory-map";
import { useScoredCompanies } from "@/lib/hooks/use-scored";
import { useRequireBanker } from "@/lib/hooks/use-require-banker";
import { useAppStore } from "@/lib/store";
import { ROUTE_HUBS, hubById } from "@/lib/data/route-hubs";
import { distanceFromLineKm, formatMoney } from "@/lib/scoring";

export default function RouteBriefPage() {
  const activeBankerId = useRequireBanker();
  const scored = useScoredCompanies();
  const routeStart = useAppStore((s) => s.routeStart);
  const routeEnd = useAppStore((s) => s.routeEnd);
  const setRoute = useAppStore((s) => s.setRoute);
  const toggleWatchlist = useAppStore((s) => s.toggleWatchlist);
  const watchlistIds = useAppStore((s) => s.watchlistIds);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Route brief</h1>
        <p className="text-sm text-muted-foreground">
          Set a start and end point to see prospects along your drive.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Plan your route</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
              Start
            </p>
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
            <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
              Destination
            </p>
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
            <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
              Buffer around route
            </p>
            <div className="flex items-center gap-3 pt-1.5">
              <Slider
                min={2}
                max={20}
                step={1}
                value={[bufferKm]}
                onValueChange={(v) =>
                  setBufferKm(Array.isArray(v) ? v[0] : (v as number))
                }
                className="flex-1"
              />
              <Badge variant="secondary" className="font-mono">
                {bufferKm} km
              </Badge>
            </div>
          </div>
          <div className="flex items-end">
            <Button
              variant="ghost"
              onClick={() => setRoute(null, null)}
              className="w-full md:w-auto"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <TerritoryMap routeLine={routeLine} />

      {start && end ? (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                <Route className="mr-1.5 -mt-0.5 inline-block h-4 w-4" />
                {start.label} → {end.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Prospects along route</p>
                <p className="text-2xl font-semibold">{nearby.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tier 1 matches</p>
                <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                  {tier1Count}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Combined revenue potential (midpoints)
                </p>
                <p className="text-2xl font-semibold font-mono">
                  {formatMoney(totalRevenue)}
                </p>
              </div>
              <div className="sm:col-span-3">
                <Button onClick={saveAll} disabled={nearby.length === 0}>
                  <BookmarkPlus className="mr-1.5 h-4 w-4" />
                  Save all {nearby.length} to watchlist
                </Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Passed on your route
            </h2>
            <ProspectTable
              rows={nearby.map((n) => n.scored)}
              columns={[
                "tier",
                "name",
                "industry",
                "city",
                "revenue",
                "score",
                "action",
              ]}
              emptyLabel="No prospects within the current buffer."
            />
          </div>
        </>
      ) : (
        <div className="rounded-lg border bg-muted/20 p-12 text-center text-sm text-muted-foreground">
          Pick a start and destination to see prospects along the route.
        </div>
      )}
    </div>
  );
}

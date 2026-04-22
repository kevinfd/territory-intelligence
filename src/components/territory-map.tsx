"use client";

import { useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useActiveTerritory, useScoredCompanies } from "@/lib/hooks/use-scored";
import { useAppStore } from "@/lib/store";
import type { Scored } from "@/lib/types";

type Props = {
  onSelectCompany?: (id: string) => void;
  highlightFilter?: (s: Scored) => boolean;
  routeLine?: [[number, number], [number, number]] | null;
  className?: string;
};

const TIER_COLOR = {
  "Tier 1": "#10b981",
  "Tier 2": "#f59e0b",
  "Tier 3": "#64748b",
} as const;

function TerritoryOverlay() {
  const map = useMap();
  const territory = useActiveTerritory();
  const mapsLib = useMapsLibrary("maps");

  useEffect(() => {
    if (!map || !mapsLib) return;
    const outer: google.maps.LatLngLiteral[] = [
      { lat: 85, lng: -180 },
      { lat: 85, lng: 180 },
      { lat: -85, lng: 180 },
      { lat: -85, lng: -180 },
    ];
    const inner: google.maps.LatLngLiteral[] = territory.polygon.map(
      ([lng, lat]) => ({ lat, lng }),
    );
    const mask = new google.maps.Polygon({
      paths: [outer, inner],
      strokeWeight: 0,
      fillColor: "#0f172a",
      fillOpacity: 0.55,
      clickable: false,
      zIndex: 1,
    });
    const boundary = new google.maps.Polygon({
      paths: inner,
      strokeColor: "#10b981",
      strokeOpacity: 0.9,
      strokeWeight: 2,
      fillOpacity: 0,
      clickable: false,
      zIndex: 2,
    });
    mask.setMap(map);
    boundary.setMap(map);

    map.panTo({ lat: territory.center[1], lng: territory.center[0] });
    map.setZoom(territory.zoom);

    return () => {
      mask.setMap(null);
      boundary.setMap(null);
    };
  }, [map, mapsLib, territory]);

  return null;
}

function CompanyDots({
  highlightFilter,
  onSelectCompany,
}: {
  highlightFilter?: (s: Scored) => boolean;
  onSelectCompany?: (id: string) => void;
}) {
  const map = useMap();
  const mapsLib = useMapsLibrary("maps");
  const scored = useScoredCompanies();

  useEffect(() => {
    if (!map || !mapsLib) return;
    const cleanups: (() => void)[] = [];

    for (const s of scored) {
      if (!s.inTerritory) continue;
      const tier = s.priority.tier;
      const color = TIER_COLOR[tier];
      const dim = highlightFilter && !highlightFilter(s);

      const marker = new google.maps.Marker({
        position: { lat: s.company.hq.lat, lng: s.company.hq.lng },
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: tier === "Tier 1" ? 7 : tier === "Tier 2" ? 6 : 5,
          fillColor: color,
          fillOpacity: dim ? 0.3 : 0.95,
          strokeColor: "#ffffff",
          strokeOpacity: dim ? 0.4 : 1,
          strokeWeight: 1.5,
        },
        title: `${s.company.name} · ${tier}`,
        zIndex: tier === "Tier 1" ? 30 : tier === "Tier 2" ? 20 : 10,
      });
      if (onSelectCompany) {
        const listener = marker.addListener("click", () =>
          onSelectCompany(s.company.id),
        );
        cleanups.push(() => listener.remove());
      }
      cleanups.push(() => marker.setMap(null));
    }

    return () => {
      for (const fn of cleanups) fn();
    };
  }, [map, mapsLib, scored, highlightFilter, onSelectCompany]);

  return null;
}

function RouteLine({
  routeLine,
}: {
  routeLine: Props["routeLine"];
}) {
  const map = useMap();
  const mapsLib = useMapsLibrary("maps");
  const ref = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !mapsLib) return;
    if (ref.current) ref.current.setMap(null);
    if (!routeLine) return;
    const path = routeLine.map(([lng, lat]) => ({ lat, lng }));
    const poly = new google.maps.Polyline({
      path,
      strokeColor: "#3b82f6",
      strokeOpacity: 0.9,
      strokeWeight: 3,
      icons: [
        {
          icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3 },
          offset: "100%",
        },
      ],
      clickable: false,
      zIndex: 50,
    });
    poly.setMap(map);
    ref.current = poly;
    return () => {
      poly.setMap(null);
      ref.current = null;
    };
  }, [map, mapsLib, routeLine]);

  return null;
}

function MapLegend() {
  return (
    <div className="absolute bottom-3 left-3 z-10 rounded-md border border-white/20 bg-slate-900/85 px-3 py-2 text-[11px] text-white shadow-sm backdrop-blur">
      <div className="mb-1 font-medium uppercase tracking-wide text-white/70">
        Priority
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Tier 1
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
          Tier 2
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-500" />
          Tier 3
        </span>
      </div>
    </div>
  );
}

export function TerritoryMap({
  onSelectCompany,
  highlightFilter,
  routeLine = null,
  className,
}: Props) {
  const territory = useActiveTerritory();
  const selectCompany = useAppStore((s) => s.selectCompany);
  const handleSelect = onSelectCompany ?? selectCompany;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || undefined;

  if (!apiKey) {
    return (
      <div
        className={
          className ??
          "flex h-[420px] items-center justify-center rounded-lg border bg-muted/20 p-6 text-sm text-muted-foreground"
        }
      >
        Add <code className="mx-1 rounded bg-muted px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to{" "}
        <code className="mx-1 rounded bg-muted px-1">.env.local</code> to enable the territory map.
      </div>
    );
  }

  return (
    <div
      className={
        className ??
        "relative h-[420px] overflow-hidden rounded-lg border bg-slate-900"
      }
    >
      <APIProvider apiKey={apiKey} libraries={["marker"]}>
        <Map
          defaultCenter={{
            lat: territory.center[1],
            lng: territory.center[0],
          }}
          defaultZoom={territory.zoom}
          mapId={mapId}
          disableDefaultUI
          gestureHandling="greedy"
          clickableIcons={false}
          styles={
            mapId
              ? undefined
              : [
                  { featureType: "poi", stylers: [{ visibility: "off" }] },
                  {
                    featureType: "transit",
                    stylers: [{ visibility: "off" }],
                  },
                  {
                    elementType: "labels.icon",
                    stylers: [{ visibility: "off" }],
                  },
                ]
          }
        >
          <TerritoryOverlay />
          <CompanyDots
            highlightFilter={highlightFilter}
            onSelectCompany={handleSelect}
          />
          <RouteLine routeLine={routeLine} />
        </Map>
      </APIProvider>
      <MapLegend />
    </div>
  );
}

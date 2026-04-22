"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { useRequireBanker } from "@/lib/hooks/use-require-banker";
import { bankerById } from "@/lib/data/bankers";
import { territoryById } from "@/lib/data/territories";
import { INDUSTRIES } from "@/lib/data/industries";
import { formatMoney } from "@/lib/scoring";
import type { BusinessLogicConfig, Industry } from "@/lib/types";
import { cn } from "@/lib/utils";

const REV_STEP = 5_000_000;
const REV_MIN = 0;
const REV_MAX = 1_000_000_000;

const WEIGHT_LABELS: {
  key: keyof BusinessLogicConfig["weights"];
  label: string;
  hint: string;
  tone: "default" | "penalty";
}[] = [
  {
    key: "territoryFit",
    label: "Territory fit",
    hint: "In-territory prospects score higher.",
    tone: "default",
  },
  {
    key: "revenueFit",
    label: "Revenue fit",
    hint: "Reward prospects inside your target band.",
    tone: "default",
  },
  {
    key: "confidence",
    label: "Data confidence",
    hint: "Favor prospects we're more sure about.",
    tone: "default",
  },
  {
    key: "growth",
    label: "Growth signals",
    hint: "Boost companies with recent moves, hiring, filings.",
    tone: "default",
  },
  {
    key: "executive",
    label: "Executive strength",
    hint: "Weight exec pedigree (prior employers, tenure).",
    tone: "default",
  },
  {
    key: "whitespace",
    label: "Whitespace (new to CRM)",
    hint: "Prefer names that aren't already in the CRM.",
    tone: "default",
  },
  {
    key: "relationshipLockIn",
    label: "Relationship lock-in penalty",
    hint: "Deprioritize names entrenched with a competitor bank.",
    tone: "penalty",
  },
];

export default function SettingsPage() {
  const activeBankerId = useRequireBanker();
  const config = useAppStore((s) => s.config);
  const setConfig = useAppStore((s) => s.setConfig);
  const resetConfig = useAppStore((s) => s.resetConfig);
  const markRecompute = useAppStore((s) => s.markRecompute);

  if (!activeBankerId) return null;
  const banker = bankerById(activeBankerId);

  const onWeightChange = (
    key: keyof BusinessLogicConfig["weights"],
    value: number,
  ) => {
    setConfig((c) => ({ ...c, weights: { ...c.weights, [key]: value } }));
    markRecompute();
  };

  const onRevenueChange = ([lo, hi]: number[]) => {
    setConfig((c) => ({ ...c, targetRevenueBand: [lo, hi] }));
    markRecompute();
  };

  const toggleIndustry = (industry: Industry, mode: "include" | "exclude") => {
    setConfig((c) => {
      if (mode === "include") {
        return {
          ...c,
          includedIndustries: c.includedIndustries.includes(industry)
            ? c.includedIndustries.filter((i) => i !== industry)
            : [...c.includedIndustries, industry],
          excludedIndustries: c.excludedIndustries.filter((i) => i !== industry),
        };
      }
      return {
        ...c,
        excludedIndustries: c.excludedIndustries.includes(industry)
          ? c.excludedIndustries.filter((i) => i !== industry)
          : [...c.excludedIndustries, industry],
        includedIndustries: c.includedIndustries.filter((i) => i !== industry),
      };
    });
    markRecompute();
  };

  const positiveWeightsSum = WEIGHT_LABELS.filter(
    (w) => w.tone === "default",
  ).reduce((s, w) => s + config.weights[w.key], 0);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
        </Link>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Prioritization logic
            </h1>
            <p className="text-sm text-muted-foreground">
              Change the inputs and watch every ranking update instantly.
            </p>
          </div>
          <Button variant="ghost" onClick={resetConfig}>
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Reset to defaults
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Territory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={config.activeTerritoryId}
            onValueChange={(v) => {
              if (!v) return;
              setConfig((c) => ({ ...c, activeTerritoryId: v }));
              markRecompute();
            }}
          >
            <SelectTrigger className="w-full md:w-96">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {banker.territoryIds.map((id) => (
                <SelectItem key={id} value={id}>
                  {territoryById(id).name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            disabled
            className="w-full md:w-auto"
            title="Polygon editing is stubbed for this demo."
          >
            Edit territory boundary (coming soon)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Target revenue band</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <Badge variant="secondary">
              {formatMoney(config.targetRevenueBand[0])}
            </Badge>
            <span className="text-xs text-muted-foreground">to</span>
            <Badge variant="secondary">
              {formatMoney(config.targetRevenueBand[1])}
            </Badge>
          </div>
          <Slider
            min={REV_MIN}
            max={REV_MAX}
            step={REV_STEP}
            value={config.targetRevenueBand as unknown as number[]}
            onValueChange={(v) => {
              const arr = Array.isArray(v) ? v : [v];
              if (arr.length >= 2) onRevenueChange([arr[0], arr[1]]);
            }}
          />
          <p className="text-xs text-muted-foreground">
            Companies outside this band lose priority. Midpoints inside get the full
            revenue-fit boost.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Industries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Click to toggle include or exclude. Default is all industries in play.
          </p>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((industry) => {
              const included = config.includedIndustries.includes(industry);
              const excluded = config.excludedIndustries.includes(industry);
              return (
                <div key={industry} className="inline-flex rounded-md border">
                  <button
                    onClick={() => toggleIndustry(industry, "include")}
                    className={cn(
                      "rounded-l-md px-2.5 py-1 text-xs",
                      included
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "hover:bg-accent",
                    )}
                  >
                    {industry}
                  </button>
                  <button
                    onClick={() => toggleIndustry(industry, "exclude")}
                    className={cn(
                      "rounded-r-md border-l px-2 py-1 text-xs",
                      excluded
                        ? "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                        : "text-muted-foreground hover:bg-accent",
                    )}
                    aria-label={`Exclude ${industry}`}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Priority weights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-xs text-muted-foreground">
            Positive-weights sum: {(positiveWeightsSum * 100).toFixed(0)}%. Each
            slider is 0 to 1.
          </p>
          {WEIGHT_LABELS.map((w) => {
            const value = config.weights[w.key];
            return (
              <div key={w.key}>
                <div className="mb-1 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {w.label}
                      {w.tone === "penalty" && (
                        <Badge
                          variant="outline"
                          className="ml-2 border-rose-500/40 text-rose-700 dark:text-rose-400"
                        >
                          penalty
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{w.hint}</p>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    {value.toFixed(2)}
                  </Badge>
                </div>
                <Slider
                  min={0}
                  max={1}
                  step={0.05}
                  value={[value]}
                  onValueChange={(v) => {
                    const arr = Array.isArray(v) ? v : [v];
                    onWeightChange(w.key, arr[0]);
                  }}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

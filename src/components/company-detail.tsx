"use client";

import Link from "next/link";
import { BookmarkPlus, BookmarkCheck, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { formatMoney, formatRevenueRange } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import type { Scored } from "@/lib/types";

const tierClass = {
  "Tier 1":
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  "Tier 2":
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  "Tier 3": "bg-muted text-muted-foreground border-border",
} as const;

function Bar({
  value,
  max = 100,
  tone = "default",
  label,
  right,
}: {
  value: number;
  max?: number;
  tone?: "default" | "positive" | "warning" | "danger";
  label: string;
  right?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color =
    tone === "positive"
      ? "bg-emerald-500"
      : tone === "warning"
        ? "bg-amber-500"
        : tone === "danger"
          ? "bg-rose-500"
          : "bg-foreground/80";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{right ?? Math.round(value)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

type Variant = "drawer" | "page";

export function CompanyDetail({
  scored,
  variant = "page",
}: {
  scored: Scored;
  variant?: Variant;
}) {
  const { company, revenue, priority } = scored;
  const watchlistIds = useAppStore((s) => s.watchlistIds);
  const toggleWatchlist = useAppStore((s) => s.toggleWatchlist);
  const watching = watchlistIds.includes(company.id);

  const topSignals = [...revenue.contributingSignals]
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className={cn(
                "font-semibold tracking-tight",
                variant === "page" ? "text-2xl" : "text-xl",
              )}
            >
              {company.name}
            </h1>
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-xs font-medium",
                tierClass[priority.tier],
              )}
            >
              {priority.tier}
            </span>
            <Badge variant="secondary">
              {company.crmStatus === "in_crm" ? "In CRM" : "New lead"}
            </Badge>
            {!scored.inTerritory && (
              <Badge variant="outline" className="border-muted-foreground/30">
                Out of territory
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {company.industry} · {company.hq.city}, {company.hq.state} ·
            Founded {company.yearFounded} · {company.employeeCount.toLocaleString()} employees
          </p>
        </div>
        <div className="flex items-center gap-2">
          {variant === "drawer" && (
            <Link
              href={`/company/${company.id}`}
              className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs hover:bg-accent"
            >
              Open full page <ExternalLink className="h-3 w-3" />
            </Link>
          )}
          <Button
            variant={watching ? "secondary" : "default"}
            onClick={() => toggleWatchlist(company.id)}
          >
            {watching ? (
              <>
                <BookmarkCheck className="mr-1.5 h-4 w-4" />
                Saved to watchlist
              </>
            ) : (
              <>
                <BookmarkPlus className="mr-1.5 h-4 w-4" />
                Save to watchlist
              </>
            )}
          </Button>
        </div>
      </div>

      <Card className="border-foreground/20 bg-foreground/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recommendation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">{priority.reason}</p>
          <p className="text-base font-semibold">
            {priority.suggestedAction}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Revenue estimate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="font-mono text-2xl font-semibold">
                  {formatRevenueRange(revenue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Midpoint {formatMoney(revenue.midpoint)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="font-mono text-lg">
                  {Math.round(revenue.confidence)}%
                </p>
              </div>
            </div>
            <Bar
              value={revenue.confidence}
              label="Confidence"
              tone={
                revenue.confidence >= 70
                  ? "positive"
                  : revenue.confidence >= 50
                    ? "warning"
                    : "danger"
              }
              right={`${Math.round(revenue.confidence)}%`}
            />
            {company.knownRevenue && (
              <p className="text-xs text-muted-foreground">
                {company.knownRevenueSource} has {formatMoney(company.knownRevenue)} on file.
              </p>
            )}
            {revenue.conflicts.length > 0 && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs text-amber-900 dark:text-amber-300">
                <p className="mb-1 font-medium">Conflicting signals</p>
                <ul className="list-disc space-y-0.5 pl-4">
                  {revenue.conflicts.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                Contributing signals
              </p>
              <div className="space-y-2.5">
                {topSignals.map((s) => (
                  <div key={s.label}>
                    <div className="mb-0.5 flex items-center justify-between text-xs">
                      <span>{s.label}</span>
                      <span className="font-mono text-muted-foreground">
                        {Math.round(s.contribution * 100)}%
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-foreground/60"
                        style={{
                          width: `${Math.max(2, s.contribution * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {s.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Priority breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-2xl font-semibold">
                {priority.priorityScore}
              </p>
              <p className="text-xs text-muted-foreground">out of 100</p>
            </div>
            <Bar
              label="Territory fit"
              value={priority.breakdown.territoryFit}
              tone="positive"
            />
            <Bar
              label="Revenue fit"
              value={priority.breakdown.revenueFit}
              tone="positive"
            />
            <Bar
              label="Data confidence"
              value={priority.breakdown.confidence}
            />
            <Bar
              label="Growth signals"
              value={priority.breakdown.growth}
              tone="positive"
            />
            <Bar
              label="Executive strength"
              value={priority.breakdown.executive}
            />
            <Bar
              label="Whitespace (new to CRM)"
              value={priority.breakdown.whitespace}
              tone="positive"
            />
            <Bar
              label="Relationship lock-in (penalty)"
              value={priority.breakdown.relationshipLockIn}
              tone="danger"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Executives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {company.executives.map((exec) => (
              <div
                key={exec.name}
                className="rounded-md border p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{exec.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {exec.role} · {exec.tenureYears}y tenure
                    </p>
                  </div>
                  <Badge
                    variant={exec.pedigreeScore >= 75 ? "default" : "secondary"}
                  >
                    Pedigree {exec.pedigreeScore}
                  </Badge>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Prior: {exec.priorEmployers.join(", ")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Banking relationship</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {company.bankingRelationship ? (
                <>
                  <p className="text-sm">
                    Likely bank:{" "}
                    <span className="font-medium">
                      {company.bankingRelationship.likelyBank}
                    </span>
                  </p>
                  <Bar
                    label="Lock-in score"
                    value={company.bankingRelationship.lockInScore}
                    tone={
                      company.bankingRelationship.lockInScore >= 70
                        ? "danger"
                        : company.bankingRelationship.lockInScore >= 40
                          ? "warning"
                          : "positive"
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {company.bankingRelationship.evidence}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No observable banking relationship yet. Whitespace opportunity.
                </p>
              )}
              {company.productAngle && (
                <div className="mt-2 rounded-md border bg-muted/30 p-2.5 text-xs">
                  <p className="font-medium">Product angle</p>
                  <p className="mt-0.5 text-muted-foreground">
                    {company.productAngle}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Growth signals</CardTitle>
            </CardHeader>
            <CardContent>
              {company.growthSignals.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No recent growth signals detected.
                </p>
              ) : (
                <ul className="space-y-2">
                  {company.growthSignals.map((g, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <div>
                        <p className="font-medium capitalize">{g.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {g.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {g.recencyMonths}mo ago
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {company.crmStatus === "in_crm" && company.crmIssues.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">CRM data issues</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {company.crmIssues.map((issue, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium capitalize">
                      {issue.type.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {issue.description}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      issue.severity === "high"
                        ? "border-rose-500/40 text-rose-700 dark:text-rose-400"
                        : "border-amber-500/40 text-amber-700 dark:text-amber-400"
                    }
                  >
                    {issue.severity}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Territory & location</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              HQ address
            </p>
            <p className="text-sm">
              {company.hq.address}
              <br />
              {company.hq.city}, {company.hq.state} {company.hq.zip}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Footprint
            </p>
            <p className="text-sm">
              {company.numberOfLocations} location
              {company.numberOfLocations === 1 ? "" : "s"}
              {company.officeFootprintSqFt
                ? ` · ~${company.officeFootprintSqFt.toLocaleString()} sq ft HQ`
                : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Digital maturity: {company.digitalMaturity}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

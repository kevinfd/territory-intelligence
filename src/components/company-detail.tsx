"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BadgeCheck,
  BookmarkPlus,
  BookmarkCheck,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MapPinned,
  Phone,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

function LinkedInMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      fill="currentColor"
      className={className}
    >
      <path d="M4.98 3.5a2.5 2.5 0 1 1 .02 5 2.5 2.5 0 0 1-.02-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.96 1.83-1.98 3.77-1.98 4.03 0 4.78 2.53 4.78 5.83V21h-4v-5.7c0-1.36-.03-3.11-1.9-3.11-1.9 0-2.2 1.47-2.2 3v5.81h-4V9Z" />
    </svg>
  );
}
import { useAppStore } from "@/lib/store";
import { formatMoney, formatRevenueRange } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import type { PriorityTier, Scored } from "@/lib/types";
import { DitherPanel } from "@/components/dither-panel";

const tierPill = (t: PriorityTier) => {
  if (t === "Tier 1")
    return "bg-intel-dark text-white border-transparent";
  if (t === "Tier 2")
    return "bg-on-primary-container text-white border-transparent";
  return "bg-surface-container-highest text-on-surface-variant border-outline-variant";
};

function pedigreeLabel(avg: number) {
  if (avg >= 75) return "HIGH";
  if (avg >= 55) return "MEDIUM";
  return "LOW";
}

function Bar({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "positive" | "warning" | "danger";
}) {
  const pct = Math.max(0, Math.min(100, value));
  const color =
    tone === "positive"
      ? "bg-success"
      : tone === "warning"
        ? "bg-warning"
        : tone === "danger"
          ? "bg-error"
          : "bg-primary-container";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[12px]">
        <span className="text-on-surface-variant">{label}</span>
        <span className="font-mono-num font-semibold text-on-surface">
          {Math.round(value)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-container">
        <div className={cn("h-full", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-on-surface-variant" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
          {label}
        </span>
      </div>
      <p className="font-mono-num mt-2 text-[20px] font-bold leading-none tracking-tight text-on-surface">
        {value}
      </p>
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

  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  const primaryContact = company.executives[0];

  function handleScheduleOutreach() {
    if (!primaryContact) return;
    setDraftError(null);
    setDrafting(true);
    try {
      const firstName = primaryContact.name.split(" ")[0];
      const signal = company.growthSignals[0]?.description;
      const subject = `Quick intro — ${company.name} + Pacific Commercial Bank`;
      const body = [
        `Hi ${firstName},`,
        "",
        `I've been following ${company.name}${signal ? ` and noticed ${signal.toLowerCase()}` : ""}. The combination of your ${company.industry.toLowerCase()} footprint in ${company.hq.city} and your ~${company.employeeCount.toLocaleString()}-person team puts you in the sweet spot for the work our commercial team does with operators at your stage.`,
        "",
        `${priority.suggestedAction}. Would you be open to a 20-minute call in the next week or two to compare notes? Happy to share a few benchmarks from similar ${company.industry.toLowerCase()} clients either way.`,
        "",
        "Best,",
        "Alex Chen",
        "Pacific Commercial Bank",
      ].join("\n");
      const href = `mailto:${encodeURIComponent(primaryContact.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : "Draft failed");
    } finally {
      setDrafting(false);
    }
  }

  const topSignals = [...revenue.contributingSignals]
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 4);

  const pedigreeAvg =
    company.executives.reduce((s, e) => s + e.pedigreeScore, 0) /
    Math.max(company.executives.length, 1);

  const hiringSignal = company.growthSignals.filter(
    (g) => g.type === "hiring" || g.type === "expansion",
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
            tierPill(priority.tier),
          )}
        >
          {priority.tier} Focus
        </span>
        {scored.inTerritory && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-success">
            <BadgeCheck className="h-3 w-3" />
            Verified Territory
          </span>
        )}
        <span className="inline-flex items-center rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
          {company.crmStatus === "in_crm" ? "In CRM" : "New Lead"}
        </span>
      </div>

      <div>
        <h1
          className={cn(
            "font-bold tracking-tight text-on-surface",
            variant === "page" ? "text-[32px] leading-9" : "text-[24px] leading-8",
          )}
        >
          {company.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {company.hq.city}, {company.hq.state}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            {company.industry}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Founded {company.yearFounded}
          </span>
        </div>
      </div>

      <DitherPanel
        variant="gray-black"
        className="rounded-2xl p-5 text-primary-foreground shadow-sm"
        noiseOpacity={0.35}
      >
        <div className="mb-1.5 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-orange" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-intel-fixed-dim">
            AI Recommendation
          </span>
        </div>
        <p className="text-[14px] leading-6 text-primary-foreground">
          {priority.reason}
        </p>
        <p className="mt-3 text-[16px] font-semibold text-orange">
          {priority.suggestedAction}
        </p>
      </DitherPanel>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Estimated Annual Revenue
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-intel-fixed px-3 py-1 text-[11px] font-bold text-on-intel-container">
            <CheckCircle2 className="h-3 w-3" />
            {Math.round(revenue.confidence)}% Confidence
          </span>
        </div>
        <p className="font-mono-num mt-3 text-[40px] font-bold leading-none tracking-tight text-on-surface sm:text-[48px]">
          {formatRevenueRange(revenue)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-outline-variant pt-4 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-outline">
              Midpoint
            </p>
            <p className="font-mono-num mt-0.5 text-[15px] font-bold text-on-surface">
              {formatMoney(revenue.midpoint)}
            </p>
          </div>
          {company.knownRevenue && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-outline">
                {company.knownRevenueSource ?? "CRM"} on file
              </p>
              <p className="font-mono-num mt-0.5 text-[15px] font-bold text-on-surface">
                {formatMoney(company.knownRevenue)}
              </p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-outline">
              Priority Score
            </p>
            <p className="font-mono-num mt-0.5 text-[15px] font-bold text-intel-dark">
              {priority.priorityScore} / 100
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-outline">
            Contributing signals
          </p>
          {topSignals.map((s) => (
            <div key={s.label}>
              <div className="mb-0.5 flex items-center justify-between text-[12px]">
                <span className="text-on-surface">{s.label}</span>
                <span className="font-mono-num text-on-surface-variant">
                  {Math.round(s.contribution * 100)}%
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-surface-container">
                <div
                  className="h-full bg-intel"
                  style={{
                    width: `${Math.max(2, s.contribution * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-0.5 text-[11px] text-outline">{s.detail}</p>
            </div>
          ))}
        </div>
        {revenue.conflicts.length > 0 && (
          <div className="mt-4 rounded-lg border border-warning/40 bg-warning-soft p-3 text-[12px] text-on-surface">
            <p className="mb-1 font-bold uppercase tracking-wider text-warning">
              Conflicting signals
            </p>
            <ul className="list-disc space-y-0.5 pl-4">
              {revenue.conflicts.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <button
          onClick={handleScheduleOutreach}
          disabled={drafting || !primaryContact}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-[14px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-on-surface active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {drafting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Drafting email…
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4" />
              Schedule Outreach
            </>
          )}
        </button>
        <button className="flex h-12 items-center justify-center gap-2 rounded-full border border-intel text-[14px] font-semibold text-intel-dark transition-colors hover:bg-intel-fixed/40">
          <BadgeCheck className="h-4 w-4" />
          Validate HQ
        </button>
        <button
          onClick={() => toggleWatchlist(company.id)}
          className={cn(
            "flex h-12 items-center justify-center gap-2 rounded-full border text-[14px] font-semibold transition-colors",
            watching
              ? "border-intel bg-intel-fixed text-on-intel-container"
              : "border-outline-variant text-on-surface hover:bg-surface-container-low",
          )}
        >
          {watching ? (
            <>
              <BookmarkCheck className="h-4 w-4" />
              In Watchlist
            </>
          ) : (
            <>
              <BookmarkPlus className="h-4 w-4" />
              Add to Watchlist
            </>
          )}
        </button>
      </div>

      {draftError && (
        <p className="-mt-2 text-[12px] text-error">
          Couldn&apos;t draft email: {draftError}
        </p>
      )}

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-outline">
          Signals at a glance
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <StatTile
            icon={Users}
            label="Employees"
            value={company.employeeCount.toLocaleString()}
          />
          <StatTile
            icon={MapPinned}
            label="Locations"
            value={company.numberOfLocations.toLocaleString()}
          />
          <StatTile
            icon={Building2}
            label="HQ Footprint"
            value={
              company.officeFootprintSqFt
                ? `${Math.round(company.officeFootprintSqFt / 1000)}k sq ft`
                : "—"
            }
          />
          <StatTile
            icon={Globe}
            label={`Digital · ${company.digitalMaturity}`}
            value={`${company.websiteQualityScore}/100`}
          />
          <StatTile
            icon={Sparkles}
            label="Exec Pedigree"
            value={pedigreeLabel(pedigreeAvg)}
          />
          <StatTile
            icon={TrendingUp}
            label="Growth Signals"
            value={hiringSignal > 0 ? `+${hiringSignal} active` : "—"}
          />
        </div>
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-outline">
              Executive Panel
            </p>
            <p className="text-[13px] text-on-surface-variant">
              {company.executives.length} verified contact
              {company.executives.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {company.executives.map((exec) => (
            <div
              key={exec.name}
              className="flex items-start justify-between gap-3 rounded-lg border border-outline-variant bg-surface-bright p-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-[11px] font-semibold text-primary-foreground">
                  {exec.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-on-surface">
                    {exec.name}
                  </p>
                  <p className="text-[12px] text-on-surface-variant">
                    {exec.role} · {exec.tenureYears}y tenure
                  </p>
                  <p className="mt-1 text-[11px] text-outline">
                    Ex-{exec.priorEmployers.slice(0, 2).join(", Ex-")}
                  </p>
                  <div className="mt-1.5 flex flex-col gap-0.5 text-[11px] text-on-surface-variant">
                    <a
                      href={`mailto:${exec.email}`}
                      className="inline-flex items-center gap-1 truncate hover:text-on-surface"
                    >
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{exec.email}</span>
                    </a>
                    <a
                      href={`tel:${exec.phone.replace(/[^0-9+]/g, "")}`}
                      className="inline-flex items-center gap-1 hover:text-on-surface"
                    >
                      <Phone className="h-3 w-3 shrink-0" />
                      {exec.phone}
                    </a>
                    <a
                      href={exec.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 truncate hover:text-intel-dark"
                    >
                      <LinkedInMark className="h-3 w-3 shrink-0" />
                      <span className="truncate">LinkedIn profile</span>
                    </a>
                  </div>
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  exec.pedigreeScore >= 75
                    ? "bg-intel-fixed text-on-intel-container"
                    : "bg-surface-container-high text-on-surface-variant",
                )}
              >
                {exec.pedigreeScore}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-outline">
            Banking Relationship
          </p>
          {company.bankingRelationship ? (
            <>
              <p className="text-[14px] text-on-surface">
                Likely bank:{" "}
                <span className="font-bold">
                  {company.bankingRelationship.likelyBank}
                </span>
              </p>
              <div className="mt-3">
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
              </div>
              <p className="mt-2 text-[12px] text-on-surface-variant">
                {company.bankingRelationship.evidence}
              </p>
            </>
          ) : (
            <p className="text-[13px] text-on-surface-variant">
              No observable banking relationship yet — whitespace opportunity.
            </p>
          )}
          {company.productAngle && (
            <div className="mt-3 rounded-lg border border-outline-variant bg-surface-container-low p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-outline">
                Product angle
              </p>
              <p className="mt-1 text-[13px] text-on-surface">
                {company.productAngle}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-outline">
            Priority Breakdown
          </p>
          <div className="space-y-2.5">
            <Bar label="Territory fit" value={priority.breakdown.territoryFit} tone="positive" />
            <Bar label="Revenue fit" value={priority.breakdown.revenueFit} tone="positive" />
            <Bar label="Data confidence" value={priority.breakdown.confidence} />
            <Bar label="Growth signals" value={priority.breakdown.growth} tone="positive" />
            <Bar label="Executive strength" value={priority.breakdown.executive} />
            <Bar label="Whitespace" value={priority.breakdown.whitespace} tone="positive" />
            <Bar
              label="Lock-in penalty"
              value={priority.breakdown.relationshipLockIn}
              tone="danger"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-5">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-outline">
          Growth Signals Timeline
        </p>
        {company.growthSignals.length === 0 ? (
          <p className="text-[13px] text-on-surface-variant">
            No recent growth signals detected.
          </p>
        ) : (
          <ul className="space-y-2">
            {company.growthSignals.map((g, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-3 border-b border-outline-variant/60 pb-2 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-[13px] font-semibold capitalize text-on-surface">
                    {g.type}
                  </p>
                  <p className="text-[12px] text-on-surface-variant">
                    {g.description}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-outline-variant bg-surface-container-low px-2 py-0.5 text-[10px] font-semibold text-on-surface-variant">
                  {g.recencyMonths}mo ago
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {company.crmStatus === "in_crm" && company.crmIssues.length > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning-soft p-4 sm:p-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-warning">
            CRM Data Issues
          </p>
          <ul className="space-y-2">
            {company.crmIssues.map((issue, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 text-[13px]"
              >
                <div>
                  <p className="font-semibold capitalize text-on-surface">
                    {issue.type.replace(/_/g, " ")}
                  </p>
                  <p className="text-[12px] text-on-surface-variant">
                    {issue.description}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    issue.severity === "high"
                      ? "border-error/40 bg-error-soft text-error"
                      : "border-warning/40 bg-white/60 text-warning",
                  )}
                >
                  {issue.severity}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {variant === "drawer" && (
        <div className="flex justify-end">
          <Link
            href={`/company/${company.id}`}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-intel-dark hover:underline"
          >
            Open full profile
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { formatRevenueRange } from "@/lib/scoring";
import type { PriorityTier, Scored } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

type Column =
  | "name"
  | "revenue"
  | "confidence"
  | "issue"
  | "signal"
  | "score"
  | "tier"
  | "action";

type Props = {
  rows: Scored[];
  columns?: Column[];
  emptyLabel?: string;
  pageSize?: number;
  totalLabel?: string;
};

const tierPill = (t: PriorityTier) => {
  if (t === "Tier 1")
    return "bg-intel-dark text-white border-transparent";
  if (t === "Tier 2")
    return "bg-on-primary-container text-white border-transparent";
  return "bg-surface-container-highest text-on-surface-variant border-outline-variant";
};

const confidenceDot = (pct: number) => {
  if (pct >= 80) return "bg-intel";
  if (pct >= 60) return "bg-on-primary-container";
  return "bg-outline";
};

const DEFAULT_COLUMNS: Column[] = [
  "name",
  "revenue",
  "confidence",
  "tier",
];

export function ProspectTable({
  rows,
  columns = DEFAULT_COLUMNS,
  emptyLabel = "No prospects match the current filter.",
  pageSize,
  totalLabel,
}: Props) {
  const [sortKey, setSortKey] = useState<"score" | "revenue" | "confidence">(
    "score",
  );
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const selectCompany = useAppStore((s) => s.selectCompany);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant">
        {emptyLabel}
      </div>
    );
  }

  const sorted = [...rows].sort((a, b) => {
    const factor = dir === "asc" ? 1 : -1;
    switch (sortKey) {
      case "score":
        return (a.priority.priorityScore - b.priority.priorityScore) * factor;
      case "revenue":
        return (a.revenue.midpoint - b.revenue.midpoint) * factor;
      case "confidence":
        return (a.revenue.confidence - b.revenue.confidence) * factor;
    }
  });
  const visible = pageSize ? sorted.slice(0, pageSize) : sorted;

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setDir("desc");
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant">
              {columns.includes("name") && (
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider sm:px-6">
                  Company
                </th>
              )}
              {columns.includes("revenue") && (
                <th
                  className="cursor-pointer select-none px-4 py-3 text-[11px] font-semibold uppercase tracking-wider sm:px-6"
                  onClick={() => toggleSort("revenue")}
                >
                  Revenue{" "}
                  {sortKey === "revenue" ? (dir === "desc" ? "↓" : "↑") : ""}
                </th>
              )}
              {columns.includes("confidence") && (
                <th
                  className="cursor-pointer select-none px-4 py-3 text-[11px] font-semibold uppercase tracking-wider sm:px-6"
                  onClick={() => toggleSort("confidence")}
                >
                  Confidence{" "}
                  {sortKey === "confidence" ? (dir === "desc" ? "↓" : "↑") : ""}
                </th>
              )}
              {columns.includes("issue") && (
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider sm:px-6">
                  CRM Issue
                </th>
              )}
              {columns.includes("signal") && (
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider sm:px-6">
                  Signal
                </th>
              )}
              {columns.includes("score") && (
                <th
                  className="cursor-pointer select-none px-4 py-3 text-[11px] font-semibold uppercase tracking-wider sm:px-6"
                  onClick={() => toggleSort("score")}
                >
                  Score{" "}
                  {sortKey === "score" ? (dir === "desc" ? "↓" : "↑") : ""}
                </th>
              )}
              {columns.includes("tier") && (
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider sm:px-6">
                  Priority
                </th>
              )}
              {columns.includes("action") && (
                <th className="hidden px-4 py-3 text-[11px] font-semibold uppercase tracking-wider sm:table-cell sm:px-6">
                  Next Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {visible.map((s) => (
              <tr
                key={s.company.id}
                className="cursor-pointer transition-colors hover:bg-surface-container-low"
                onClick={() => selectCompany(s.company.id)}
              >
                {columns.includes("name") && (
                  <td className="px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex flex-col">
                      <span className="text-[15px] font-bold text-on-surface">
                        {s.company.name}
                      </span>
                      <span className="text-[12px] text-on-surface-variant">
                        {s.company.hq.city}, {s.company.hq.state}
                        {!s.inTerritory && " · out of territory"}
                      </span>
                    </div>
                  </td>
                )}
                {columns.includes("revenue") && (
                  <td className="font-mono-num px-4 py-4 text-[14px] font-medium text-on-surface sm:px-6 sm:py-5">
                    {formatRevenueRange(s.revenue)}
                  </td>
                )}
                {columns.includes("confidence") && (
                  <td className="px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          confidenceDot(s.revenue.confidence),
                        )}
                      />
                      <span className="font-mono-num text-[14px] font-bold text-on-surface">
                        {Math.round(s.revenue.confidence)}%
                      </span>
                    </div>
                  </td>
                )}
                {columns.includes("issue") && (
                  <td className="px-4 py-4 sm:px-6 sm:py-5">
                    {s.company.crmIssues.length > 0 ? (
                      <span className="inline-flex items-center rounded-full border border-warning/30 bg-warning-soft px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
                        {s.company.crmIssues[0].type.replace(/_/g, " ")}
                      </span>
                    ) : (
                      <span className="text-[12px] text-outline-variant">—</span>
                    )}
                  </td>
                )}
                {columns.includes("signal") && (
                  <td className="px-4 py-4 sm:px-6 sm:py-5">
                    {s.company.growthSignals[0] ? (
                      <span className="inline-flex items-center rounded-full border border-intel/30 bg-intel-fixed px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-on-intel-container">
                        {s.company.growthSignals[0].type}
                      </span>
                    ) : (
                      <span className="text-[12px] text-outline-variant">—</span>
                    )}
                  </td>
                )}
                {columns.includes("score") && (
                  <td className="font-mono-num px-4 py-4 text-[14px] font-bold text-on-surface sm:px-6 sm:py-5">
                    {s.priority.priorityScore}
                  </td>
                )}
                {columns.includes("tier") && (
                  <td className="px-4 py-4 text-right sm:px-6 sm:py-5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                        tierPill(s.priority.tier),
                      )}
                    >
                      {s.priority.tier}
                    </span>
                  </td>
                )}
                {columns.includes("action") && (
                  <td className="hidden px-4 py-4 text-[13px] text-on-surface-variant sm:table-cell sm:px-6 sm:py-5">
                    {s.priority.suggestedAction}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(pageSize || totalLabel) && (
        <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low px-4 py-3 sm:px-6">
          <span className="text-[11px] uppercase tracking-wider text-on-surface-variant">
            {totalLabel ??
              `Showing ${visible.length} of ${rows.length} accounts`}
          </span>
        </div>
      )}
    </div>
  );
}

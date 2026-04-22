"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatRevenueRange } from "@/lib/scoring";
import type { PriorityTier, Scored } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

type Column =
  | "tier"
  | "name"
  | "industry"
  | "city"
  | "revenue"
  | "confidence"
  | "score"
  | "issue"
  | "signal"
  | "action";

type Props = {
  rows: Scored[];
  columns?: Column[];
  emptyLabel?: string;
};

const tierBadge = (t: PriorityTier) => {
  if (t === "Tier 1")
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
  if (t === "Tier 2")
    return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
  return "bg-muted text-muted-foreground border-border";
};

const DEFAULT_COLUMNS: Column[] = [
  "tier",
  "name",
  "industry",
  "city",
  "revenue",
  "confidence",
  "score",
  "action",
];

export function ProspectTable({
  rows,
  columns = DEFAULT_COLUMNS,
  emptyLabel = "No prospects match the current filter.",
}: Props) {
  const [sortKey, setSortKey] = useState<"score" | "revenue" | "confidence">(
    "score",
  );
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const selectCompany = useAppStore((s) => s.selectCompany);

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

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setDir("desc");
    }
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.includes("tier") && <TableHead className="w-20">Tier</TableHead>}
            {columns.includes("name") && <TableHead>Company</TableHead>}
            {columns.includes("industry") && <TableHead>Industry</TableHead>}
            {columns.includes("city") && <TableHead>City</TableHead>}
            {columns.includes("revenue") && (
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("revenue")}
              >
                Est. Revenue {sortKey === "revenue" ? (dir === "desc" ? "↓" : "↑") : ""}
              </TableHead>
            )}
            {columns.includes("confidence") && (
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("confidence")}
              >
                Conf. {sortKey === "confidence" ? (dir === "desc" ? "↓" : "↑") : ""}
              </TableHead>
            )}
            {columns.includes("score") && (
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("score")}
              >
                Score {sortKey === "score" ? (dir === "desc" ? "↓" : "↑") : ""}
              </TableHead>
            )}
            {columns.includes("issue") && <TableHead>CRM Issue</TableHead>}
            {columns.includes("signal") && <TableHead>Signal</TableHead>}
            {columns.includes("action") && <TableHead>Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((s) => (
            <TableRow
              key={s.company.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => selectCompany(s.company.id)}
            >
              {columns.includes("tier") && (
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                      tierBadge(s.priority.tier),
                    )}
                  >
                    {s.priority.tier}
                  </span>
                </TableCell>
              )}
              {columns.includes("name") && (
                <TableCell className="font-medium">
                  <span className="hover:underline">{s.company.name}</span>
                  {!s.inTerritory && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (out of territory)
                    </span>
                  )}
                </TableCell>
              )}
              {columns.includes("industry") && (
                <TableCell className="text-sm text-muted-foreground">
                  {s.company.industry}
                </TableCell>
              )}
              {columns.includes("city") && (
                <TableCell className="text-sm text-muted-foreground">
                  {s.company.hq.city}
                </TableCell>
              )}
              {columns.includes("revenue") && (
                <TableCell className="font-mono text-sm">
                  {formatRevenueRange(s.revenue)}
                </TableCell>
              )}
              {columns.includes("confidence") && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full",
                          s.revenue.confidence >= 70
                            ? "bg-emerald-500"
                            : s.revenue.confidence >= 50
                              ? "bg-amber-500"
                              : "bg-rose-500",
                        )}
                        style={{ width: `${s.revenue.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(s.revenue.confidence)}%
                    </span>
                  </div>
                </TableCell>
              )}
              {columns.includes("score") && (
                <TableCell className="font-mono text-sm">
                  {s.priority.priorityScore}
                </TableCell>
              )}
              {columns.includes("issue") && (
                <TableCell>
                  {s.company.crmIssues.length > 0 ? (
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 text-amber-700 dark:text-amber-400"
                    >
                      {s.company.crmIssues[0].type.replace(/_/g, " ")}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}
              {columns.includes("signal") && (
                <TableCell>
                  {s.company.growthSignals[0] ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                    >
                      {s.company.growthSignals[0].type}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}
              {columns.includes("action") && (
                <TableCell className="text-sm text-muted-foreground">
                  {s.priority.suggestedAction}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/crm", label: "Existing CRM" },
  { href: "/dashboard/new-leads", label: "New Leads" },
  { href: "/dashboard/route-brief", label: "Route Brief" },
  { href: "/dashboard/watchlist", label: "Watchlist" },
];

export function TabNav() {
  const pathname = usePathname();
  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-1 px-4">
        {TABS.map((tab) => {
          const active =
            tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative px-3 py-2.5 text-sm transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              {active && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 bg-foreground" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

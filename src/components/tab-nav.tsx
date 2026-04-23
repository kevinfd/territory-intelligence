"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/new-leads", label: "New Leads" },
  { href: "/dashboard/crm", label: "Existing CRM" },
  { href: "/dashboard/route-brief", label: "Route Brief" },
  { href: "/dashboard/watchlist", label: "Watchlist" },
];

export function TabNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-16 z-30 border-b border-outline-variant bg-surface-container-lowest/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-1 overflow-x-auto overflow-y-hidden px-2 sm:px-4">
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
                "relative shrink-0 px-3 py-3 text-[13px] font-medium transition-colors sm:px-4 sm:text-[14px]",
                active
                  ? "text-intel-dark"
                  : "text-outline hover:text-on-surface",
              )}
            >
              {tab.label}
              {active && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-intel sm:inset-x-4" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

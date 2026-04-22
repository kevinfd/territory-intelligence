"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Route, Settings2, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/route-brief", label: "Route", icon: Route },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Bookmark },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-outline-variant bg-surface-container-lowest shadow-[0_-2px_8px_rgba(15,23,42,0.06)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-16 items-stretch justify-around px-2">
        {ITEMS.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg transition-colors active:scale-95",
                active
                  ? "text-intel-dark"
                  : "text-outline hover:text-on-surface",
              )}
            >
              <div
                className={cn(
                  "rounded-lg p-1.5",
                  active && "bg-intel-fixed/60",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, SlidersHorizontal } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { bankerById } from "@/lib/data/bankers";
import { territoryById } from "@/lib/data/territories";

export function Topbar() {
  const router = useRouter();
  const activeBankerId = useAppStore((s) => s.activeBankerId);
  const activeTerritoryId = useAppStore((s) => s.config.activeTerritoryId);
  const signOut = useAppStore((s) => s.signOut);

  if (!activeBankerId) return null;
  const banker = bankerById(activeBankerId);
  const territory = territoryById(activeTerritoryId);
  const firstName = banker.name.split(" ")[0];

  const handleSignOut = () => {
    signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface-container-lowest/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary-foreground">
            <span className="text-sm font-semibold">
              {banker.avatarInitials}
            </span>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[15px] font-bold leading-tight tracking-tight text-on-surface">
              Territory 1
            </span>
            <span className="truncate text-[11px] font-medium text-on-surface-variant">
              {firstName} · {territory.name}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/settings"
            className="hidden h-9 items-center gap-1.5 rounded-full border border-outline-variant px-3 text-[12px] font-semibold text-on-surface-variant transition-colors hover:border-primary-container hover:text-on-surface sm:inline-flex"
            title="Prioritization logic"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Logic
          </Link>

          <Link
            href="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-colors hover:bg-surface-container-low hover:text-on-surface sm:hidden"
            aria-label="Prioritization logic"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Link>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-colors hover:bg-surface-container-low hover:text-on-surface"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>

          <button
            onClick={handleSignOut}
            title="Sign out and switch demo persona"
            className="group flex h-9 items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-1 pr-3 text-xs font-medium text-on-surface transition-colors hover:border-primary-container hover:bg-surface-container-low"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {banker.avatarInitials}
            </span>
            <span className="hidden sm:inline">{firstName}</span>
            <LogOut className="hidden h-3.5 w-3.5 text-on-surface-variant transition-colors group-hover:text-on-surface sm:inline" />
          </button>
        </div>
      </div>
    </header>
  );
}

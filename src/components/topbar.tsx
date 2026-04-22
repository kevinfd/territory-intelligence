"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  LogOut,
  Map as MapIcon,
  Settings2,
  UserRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/lib/store";
import { bankerById, BANKERS } from "@/lib/data/bankers";
import { territoryById } from "@/lib/data/territories";

export function Topbar() {
  const router = useRouter();
  const activeBankerId = useAppStore((s) => s.activeBankerId);
  const activeTerritoryId = useAppStore((s) => s.config.activeTerritoryId);
  const setBanker = useAppStore((s) => s.setBanker);
  const setActiveTerritory = useAppStore((s) => s.setActiveTerritory);
  const signOut = useAppStore((s) => s.signOut);

  if (!activeBankerId) return null;
  const banker = bankerById(activeBankerId);
  const territory = territoryById(activeTerritoryId);
  const firstName = banker.name.split(" ")[0];

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
              Territory Intelligence
            </span>
            <span className="truncate text-[11px] font-medium text-on-surface-variant">
              {firstName} · {territory.name}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-outline transition-colors hover:bg-surface-container-low hover:text-on-surface"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-1 pr-3 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container-low">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {banker.avatarInitials}
              </span>
              <span className="hidden sm:inline">{firstName}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
              <DropdownMenuItem disabled className="flex-col items-start gap-0.5">
                <span className="text-sm font-medium">{banker.name}</span>
                <span className="text-xs text-on-surface-variant">
                  {banker.title}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {banker.territoryIds.length > 1 && (
                <>
                  <DropdownMenuLabel>Active territory</DropdownMenuLabel>
                  {banker.territoryIds.map((id) => (
                    <DropdownMenuItem
                      key={id}
                      onClick={() => setActiveTerritory(id)}
                    >
                      <MapIcon className="mr-2 h-3.5 w-3.5" />
                      {territoryById(id).name}
                      {id === activeTerritoryId ? " ✓" : ""}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings2 className="mr-2 h-3.5 w-3.5" />
                Prioritization logic
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Switch demo persona</DropdownMenuLabel>
              {BANKERS.filter((b) => b.id !== banker.id).map((b) => (
                <DropdownMenuItem key={b.id} onClick={() => setBanker(b.id)}>
                  <UserRound className="mr-2 h-3.5 w-3.5" />
                  {b.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  signOut();
                  router.push("/login");
                }}
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

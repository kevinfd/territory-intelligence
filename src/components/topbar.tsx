"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings2, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { bankerById, BANKERS } from "@/lib/data/bankers";
import { territoryById } from "@/lib/data/territories";
import { formatMoney } from "@/lib/scoring";

export function Topbar() {
  const router = useRouter();
  const activeBankerId = useAppStore((s) => s.activeBankerId);
  const activeTerritoryId = useAppStore((s) => s.config.activeTerritoryId);
  const targetBand = useAppStore((s) => s.config.targetRevenueBand);
  const setBanker = useAppStore((s) => s.setBanker);
  const setActiveTerritory = useAppStore((s) => s.setActiveTerritory);
  const signOut = useAppStore((s) => s.signOut);

  if (!activeBankerId) return null;
  const banker = bankerById(activeBankerId);
  const territory = territoryById(activeTerritoryId);

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Territory Intelligence
          </Link>
          <span className="text-xs text-muted-foreground">
            {territory.name}
          </span>
          <Badge variant="secondary" className="hidden md:inline-flex">
            Target {formatMoney(targetBand[0])} – {formatMoney(targetBand[1])}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {banker.territoryIds.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs hover:bg-accent">
                Switch territory
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Available territories</DropdownMenuLabel>
                {banker.territoryIds.map((id) => (
                  <DropdownMenuItem
                    key={id}
                    onClick={() => setActiveTerritory(id)}
                  >
                    {territoryById(id).name}
                    {id === activeTerritoryId ? " ✓" : ""}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Link
            href="/settings"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs hover:bg-accent"
          >
            <Settings2 className="h-3.5 w-3.5" /> Logic
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs hover:bg-accent">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                {banker.avatarInitials}
              </span>
              {banker.name.split(" ")[0]}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
              <DropdownMenuItem disabled className="flex-col items-start gap-0.5">
                <span className="text-sm font-medium">{banker.name}</span>
                <span className="text-xs text-muted-foreground">
                  {banker.title}
                </span>
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

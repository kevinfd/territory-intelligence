"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  LogIn,
} from "lucide-react";
import { BANKERS } from "@/lib/data/bankers";
import { territoryById } from "@/lib/data/territories";
import { useAppStore } from "@/lib/store";
import { formatMoney } from "@/lib/scoring";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const activeBankerId = useAppStore((s) => s.activeBankerId);
  const setBanker = useAppStore((s) => s.setBanker);
  const [selectedId, setSelectedId] = useState<string | null>(
    BANKERS[0]?.id ?? null,
  );

  useEffect(() => {
    if (activeBankerId) router.replace("/dashboard");
  }, [activeBankerId, router]);

  const enter = () => {
    if (!selectedId) return;
    setBanker(selectedId);
    router.push("/dashboard");
  };

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-intel-fixed blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary-fixed-dim blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[480px]">
        <div className="mb-6 flex flex-col items-center sm:mb-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg">
            <Database className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="text-[24px] font-semibold leading-8 tracking-tight text-on-surface">
            Territory Intelligence
          </h1>
          <p className="mt-1 text-sm text-outline">
            Commercial Portfolio Command Center
          </p>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_2px_4px_rgba(15,23,42,0.05)] sm:p-8">
          <div className="mb-6">
            <h2 className="text-[20px] font-semibold leading-7 text-on-surface">
              Select Your Persona
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Choose your workspace profile to access localized intelligence and
              territory reports.
            </p>
          </div>

          <div className="mb-8 space-y-2">
            {BANKERS.map((banker) => {
              const territories = banker.territoryIds
                .map((id) => territoryById(id).name)
                .join(" · ");
              const [lo, hi] = banker.targetRevenueBand;
              const isSelected = selectedId === banker.id;
              return (
                <button
                  key={banker.id}
                  onClick={() => setSelectedId(banker.id)}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all duration-200",
                    isSelected
                      ? "border-2 border-intel bg-surface-bright"
                      : "border-outline-variant bg-white hover:border-intel-fixed-dim hover:bg-surface-container-low",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all",
                        isSelected
                          ? "bg-primary text-primary-foreground ring-2 ring-intel ring-offset-2 ring-offset-surface-bright"
                          : "bg-surface-container text-on-surface-variant",
                      )}
                    >
                      {banker.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-on-surface">
                        {banker.name}
                      </p>
                      {isSelected ? (
                        <span className="mt-1 inline-block rounded bg-intel-fixed px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-intel-container">
                          {formatMoney(lo)}–{formatMoney(hi)} Access
                        </span>
                      ) : (
                        <p className="truncate text-[13px] text-outline">
                          {territories}
                        </p>
                      )}
                    </div>
                  </div>
                  {isSelected ? (
                    <CheckCircle2
                      className="h-6 w-6 shrink-0 text-intel"
                      strokeWidth={2.5}
                      fill="var(--color-intel-fixed)"
                    />
                  ) : (
                    <ArrowRight className="h-5 w-5 shrink-0 text-outline-variant group-hover:text-intel" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={enter}
            disabled={!selectedId}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[15px] font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary-container active:scale-[0.98] disabled:opacity-50"
          >
            Enter Portal
            <LogIn className="h-4 w-4" />
          </button>

          <div className="mt-6 text-center">
            <a
              href="#"
              className="text-[11px] font-semibold uppercase tracking-wider text-intel-dark hover:underline"
            >
              Need help accessing your account?
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-outline">
            Demo Build · No Real Authentication
          </p>
          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-outline">
            <span>Privacy Policy</span>
            <span className="h-1 w-1 rounded-full bg-outline-variant" />
            <span>Terms of Service</span>
            <span className="h-1 w-1 rounded-full bg-outline-variant" />
            <span>Seeded Data</span>
          </div>
        </div>
      </div>
    </main>
  );
}

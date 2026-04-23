"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { BANKERS } from "@/lib/data/bankers";
import { territoryById } from "@/lib/data/territories";
import { useAppStore } from "@/lib/store";
import { formatMoney } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { DitherPanel } from "@/components/dither-panel";

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
    <main className="flex flex-1 flex-col md:grid md:min-h-screen md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section className="relative flex flex-1 flex-col justify-center bg-surface-container-lowest px-6 py-10 sm:px-12 md:px-16">
        <div className="mb-8 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-t1.png"
            alt="Territory Intelligence"
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg invert"
          />
          <span className="text-[13px] font-semibold tracking-tight text-on-surface">
            Territory 1
          </span>
        </div>

        <div className="mx-auto w-full max-w-[460px] space-y-6">
          <div>
            <h1 className="text-[40px] font-bold leading-[1.05] tracking-tight text-on-surface sm:text-[48px]">
              Welcome to{" "}
              <span className="rounded bg-primary-container px-2 py-0.5 text-primary-foreground">
                Territory 1
              </span>
              <span className="text-on-surface">.</span>
            </h1>
            <p className="mt-3 text-[20px] font-medium leading-snug text-on-surface-variant sm:text-[22px]">
              Your Territory Intelligence command center.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-outline">
              Select persona
            </p>
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
                    "group flex w-full items-center justify-between rounded-full border px-4 py-3 text-left transition-all duration-200",
                    isSelected
                      ? "border-primary-container bg-surface-bright shadow-sm"
                      : "border-outline-variant bg-surface-container-lowest hover:border-intel-dark",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-all",
                        isSelected
                          ? "bg-primary-container text-primary-foreground"
                          : "bg-surface-container text-on-surface-variant",
                      )}
                    >
                      {banker.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-on-surface">
                        {banker.name}
                      </p>
                      <p className="truncate text-[12px] text-outline">
                        {isSelected
                          ? `${formatMoney(lo)}–${formatMoney(hi)} · ${territories}`
                          : territories}
                      </p>
                    </div>
                  </div>
                  {isSelected ? (
                    <CheckCircle2
                      className="h-5 w-5 shrink-0 text-intel-dark"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <ArrowRight className="h-4 w-4 shrink-0 text-outline-variant group-hover:text-intel-dark" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={enter}
            disabled={!selectedId}
            className="flex h-12 w-full items-center justify-center rounded-full bg-primary-container text-[15px] font-semibold text-primary-foreground shadow-sm transition-all hover:bg-on-surface active:scale-[0.99] disabled:opacity-50"
          >
            Continue
          </button>

          <p className="text-center text-[12px] text-on-surface-variant">
            By continuing, you accept the{" "}
            <a href="#" className="underline hover:text-on-surface">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-on-surface">
              Privacy Policy
            </a>
            .
          </p>
          <div className="text-center">
            <a
              href="#"
              className="text-[12px] font-semibold text-on-surface hover:underline"
            >
              Forgot password?
            </a>
          </div>
        </div>

        <div className="mt-10 text-center text-[10px] font-semibold uppercase tracking-widest text-outline md:mt-auto md:pt-10">
          Demo build · no real authentication
        </div>
      </section>

      <section className="relative order-first h-52 md:order-last md:h-auto">
        <DitherPanel
          variant="cobalt"
          className="absolute inset-0 h-full w-full md:rounded-none"
          noiseOpacity={0.55}
          baseFrequency={0.88}
        />
      </section>
    </main>
  );
}

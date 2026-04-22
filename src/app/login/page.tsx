"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BANKERS } from "@/lib/data/bankers";
import { territoryById } from "@/lib/data/territories";
import { useAppStore } from "@/lib/store";
import { formatMoney } from "@/lib/scoring";

export default function LoginPage() {
  const router = useRouter();
  const activeBankerId = useAppStore((s) => s.activeBankerId);
  const setBanker = useAppStore((s) => s.setBanker);

  useEffect(() => {
    if (activeBankerId) router.replace("/dashboard");
  }, [activeBankerId, router]);

  const onSelect = (id: string) => {
    setBanker(id);
    router.push("/dashboard");
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-12">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          Territory Intelligence
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Sign in as a demo banker
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Each persona has a different territory and revenue band. The dashboard
          will re-rank every prospect based on who&apos;s signed in.
        </p>
      </div>
      <div className="grid items-stretch gap-4 md:grid-cols-3">
        {BANKERS.map((banker) => {
          const territories = banker.territoryIds
            .map((id) => territoryById(id).name)
            .join(" · ");
          const [lo, hi] = banker.targetRevenueBand;
          return (
            <Card
              key={banker.id}
              className="h-full cursor-pointer transition-colors hover:border-foreground"
              onClick={() => onSelect(banker.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                    {banker.avatarInitials}
                  </div>
                  <div>
                    <CardTitle className="text-base">{banker.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {banker.title}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Territories
                  </p>
                  <p className="text-sm">{territories}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Target revenue band
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {formatMoney(lo)} – {formatMoney(hi)}
                  </Badge>
                </div>
                <Button
                  className="mt-auto w-full"
                  onClick={() => onSelect(banker.id)}
                >
                  Sign in as {banker.name.split(" ")[0]}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="mt-10 text-center text-xs text-muted-foreground">
        This is a demo. No real authentication.
      </p>
    </main>
  );
}

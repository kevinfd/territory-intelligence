"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "../store";

export function useRequireBanker() {
  const router = useRouter();
  const activeBankerId = useAppStore((s) => s.activeBankerId);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useAppStore.persist;
    if (!persist) {
      setHydrated(true);
      return;
    }
    if (persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return persist.onFinishHydration(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated && activeBankerId === null) {
      router.replace("/login");
    }
  }, [hydrated, activeBankerId, router]);

  return hydrated ? activeBankerId : null;
}

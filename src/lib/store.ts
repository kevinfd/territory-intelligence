import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CONFIG } from "./scoring";
import { bankerById } from "./data/bankers";
import type { BusinessLogicConfig } from "./types";

type AppState = {
  activeBankerId: string | null;
  config: BusinessLogicConfig;
  watchlistIds: string[];
  routeStart: string | null;
  routeEnd: string | null;
  lastRecomputeAt: number | null;
  selectedCompanyId: string | null;
};

type AppActions = {
  setBanker: (id: string) => void;
  signOut: () => void;
  setConfig: (updater: (c: BusinessLogicConfig) => BusinessLogicConfig) => void;
  setActiveTerritory: (id: string) => void;
  toggleWatchlist: (id: string) => void;
  resetConfig: () => void;
  setRoute: (start: string | null, end: string | null) => void;
  markRecompute: () => void;
  selectCompany: (id: string | null) => void;
};

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      activeBankerId: null,
      config: DEFAULT_CONFIG,
      watchlistIds: [],
      routeStart: null,
      routeEnd: null,
      lastRecomputeAt: null,
      selectedCompanyId: null,
      setBanker: (id) => {
        const b = bankerById(id);
        set({
          activeBankerId: id,
          config: {
            ...DEFAULT_CONFIG,
            activeTerritoryId: b.territoryIds[0],
            targetRevenueBand: b.targetRevenueBand,
          },
        });
      },
      signOut: () =>
        set({
          activeBankerId: null,
          config: DEFAULT_CONFIG,
          watchlistIds: [],
        }),
      setConfig: (updater) => set((s) => ({ config: updater(s.config) })),
      setActiveTerritory: (id) =>
        set((s) => ({ config: { ...s.config, activeTerritoryId: id } })),
      toggleWatchlist: (id) =>
        set((s) => ({
          watchlistIds: s.watchlistIds.includes(id)
            ? s.watchlistIds.filter((x) => x !== id)
            : [...s.watchlistIds, id],
        })),
      resetConfig: () =>
        set((s) => {
          const b = s.activeBankerId ? bankerById(s.activeBankerId) : null;
          return {
            config: b
              ? {
                  ...DEFAULT_CONFIG,
                  activeTerritoryId: b.territoryIds[0],
                  targetRevenueBand: b.targetRevenueBand,
                }
              : DEFAULT_CONFIG,
          };
        }),
      setRoute: (routeStart, routeEnd) => set({ routeStart, routeEnd }),
      markRecompute: () => set({ lastRecomputeAt: Date.now() }),
      selectCompany: (id) => set({ selectedCompanyId: id }),
    }),
    {
      name: "ti-app",
      partialize: (s) => ({
        activeBankerId: s.activeBankerId,
        config: s.config,
        watchlistIds: s.watchlistIds,
        routeStart: s.routeStart,
        routeEnd: s.routeEnd,
      }),
    },
  ),
);

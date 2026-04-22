"use client";

import { useMemo } from "react";
import { useAppStore } from "../store";
import { COMPANIES } from "../data/companies";
import { territoryById } from "../data/territories";
import { scoreAll, type DEFAULT_CONFIG } from "../scoring";
import type { Scored } from "../types";

export function useScoredCompanies(): Scored[] {
  const config = useAppStore((s) => s.config);
  return useMemo(() => {
    const territory = territoryById(config.activeTerritoryId);
    return scoreAll(COMPANIES, config, territory);
  }, [config]);
}

export function useActiveTerritory() {
  const id = useAppStore((s) => s.config.activeTerritoryId);
  return territoryById(id);
}

export type { DEFAULT_CONFIG };

import type { Banker } from "@/lib/types";

export const BANKERS: Banker[] = [
  {
    id: "colby",
    name: "Colby Reeves",
    title: "Commercial Banker — Los Angeles & Orange County",
    avatarInitials: "CR",
    territoryIds: ["la-oc"],
    targetRevenueBand: [25_000_000, 250_000_000],
  },
  {
    id: "jordan",
    name: "Jordan Ma",
    title: "Commercial Banker — Inland Empire",
    avatarInitials: "JM",
    territoryIds: ["inland-empire"],
    targetRevenueBand: [15_000_000, 150_000_000],
  },
  {
    id: "regional",
    name: "Priya Anand",
    title: "Regional Sales Executive — Southern California",
    avatarInitials: "PA",
    territoryIds: ["socal-region", "la-oc", "inland-empire"],
    targetRevenueBand: [10_000_000, 500_000_000],
  },
];

export const bankerById = (id: string) =>
  BANKERS.find((b) => b.id === id) ?? BANKERS[0];

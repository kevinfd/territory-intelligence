import type { Territory } from "@/lib/types";

export const TERRITORIES: Territory[] = [
  {
    id: "la-oc",
    name: "Los Angeles + Orange County",
    center: [-118.1, 33.9],
    zoom: 9,
    polygon: [
      [-118.95, 34.35],
      [-117.65, 34.35],
      [-117.6, 33.95],
      [-117.55, 33.55],
      [-117.7, 33.4],
      [-118.1, 33.45],
      [-118.55, 33.7],
      [-118.95, 34.05],
      [-118.95, 34.35],
    ],
  },
  {
    id: "inland-empire",
    name: "Inland Empire",
    center: [-117.15, 33.9],
    zoom: 9,
    polygon: [
      [-117.65, 34.35],
      [-116.2, 34.35],
      [-116.1, 33.95],
      [-116.3, 33.55],
      [-117.0, 33.45],
      [-117.55, 33.55],
      [-117.6, 33.95],
      [-117.65, 34.35],
    ],
  },
  {
    id: "socal-region",
    name: "Southern California (Regional)",
    center: [-117.6, 33.85],
    zoom: 7,
    polygon: [
      [-119.0, 34.6],
      [-116.0, 34.6],
      [-115.5, 33.7],
      [-116.3, 33.2],
      [-117.3, 32.6],
      [-118.5, 33.2],
      [-119.25, 33.9],
      [-119.0, 34.6],
    ],
  },
];

export const territoryById = (id: string) =>
  TERRITORIES.find((t) => t.id === id) ?? TERRITORIES[0];

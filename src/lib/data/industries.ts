import type { Industry } from "@/lib/types";

type IndustryMeta = {
  revenuePerEmployee: number;
  sqFtPerEmployee: number;
  digitalMaturityBias: number;
  productAngles: string[];
};

export const INDUSTRY_META: Record<Industry, IndustryMeta> = {
  Manufacturing: {
    revenuePerEmployee: 420_000,
    sqFtPerEmployee: 500,
    digitalMaturityBias: -0.1,
    productAngles: [
      "Asset-based lending candidate",
      "Equipment financing opportunity",
      "Working capital line fit",
    ],
  },
  "Wholesale Distribution": {
    revenuePerEmployee: 950_000,
    sqFtPerEmployee: 900,
    digitalMaturityBias: -0.05,
    productAngles: [
      "Inventory financing fit",
      "Asset-based lending candidate",
      "Trade finance opportunity",
    ],
  },
  "Healthcare Services": {
    revenuePerEmployee: 220_000,
    sqFtPerEmployee: 250,
    digitalMaturityBias: 0.05,
    productAngles: [
      "Practice acquisition financing",
      "CapEx financing for new locations",
      "Revenue-cycle lending",
    ],
  },
  "Professional Services": {
    revenuePerEmployee: 260_000,
    sqFtPerEmployee: 180,
    digitalMaturityBias: 0.15,
    productAngles: [
      "Partner buy-in lending",
      "Treasury management upgrade",
      "Commercial card program",
    ],
  },
  "Logistics & Transportation": {
    revenuePerEmployee: 310_000,
    sqFtPerEmployee: 600,
    digitalMaturityBias: 0,
    productAngles: [
      "Fleet financing opportunity",
      "Working capital for fuel float",
      "Real estate term loan",
    ],
  },
  "Real Estate": {
    revenuePerEmployee: 820_000,
    sqFtPerEmployee: 220,
    digitalMaturityBias: 0.1,
    productAngles: [
      "CRE term loan candidate",
      "Construction-to-perm financing",
      "Treasury & escrow services",
    ],
  },
  Construction: {
    revenuePerEmployee: 330_000,
    sqFtPerEmployee: 300,
    digitalMaturityBias: -0.15,
    productAngles: [
      "Equipment financing opportunity",
      "Bonding line expansion",
      "Project-based working capital",
    ],
  },
  "Food & Beverage": {
    revenuePerEmployee: 270_000,
    sqFtPerEmployee: 450,
    digitalMaturityBias: -0.05,
    productAngles: [
      "Cold storage CapEx lending",
      "Working capital line fit",
      "Acquisition financing",
    ],
  },
  Technology: {
    revenuePerEmployee: 480_000,
    sqFtPerEmployee: 180,
    digitalMaturityBias: 0.3,
    productAngles: [
      "Venture debt candidate",
      "Treasury management upgrade",
      "Commercial card program",
    ],
  },
  "Media & Entertainment": {
    revenuePerEmployee: 320_000,
    sqFtPerEmployee: 220,
    digitalMaturityBias: 0.2,
    productAngles: [
      "Production financing candidate",
      "IP-backed lending opportunity",
      "Treasury services refresh",
    ],
  },
  Retail: {
    revenuePerEmployee: 360_000,
    sqFtPerEmployee: 350,
    digitalMaturityBias: 0,
    productAngles: [
      "Inventory financing fit",
      "CapEx for new-store rollouts",
      "Merchant services bundle",
    ],
  },
};

export const INDUSTRIES = Object.keys(INDUSTRY_META) as Industry[];

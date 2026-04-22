export type RouteHub = {
  id: string;
  label: string;
  lat: number;
  lng: number;
};

export const ROUTE_HUBS: RouteHub[] = [
  { id: "dtla", label: "Downtown Los Angeles", lat: 34.05, lng: -118.24 },
  { id: "santa-monica", label: "Santa Monica", lat: 34.02, lng: -118.49 },
  { id: "long-beach", label: "Long Beach", lat: 33.77, lng: -118.19 },
  { id: "el-segundo", label: "El Segundo", lat: 33.92, lng: -118.4 },
  { id: "burbank", label: "Burbank", lat: 34.18, lng: -118.31 },
  { id: "pasadena", label: "Pasadena", lat: 34.15, lng: -118.14 },
  { id: "torrance", label: "Torrance", lat: 33.84, lng: -118.34 },
  { id: "irvine", label: "Irvine", lat: 33.68, lng: -117.83 },
  { id: "anaheim", label: "Anaheim", lat: 33.84, lng: -117.91 },
  { id: "newport-beach", label: "Newport Beach", lat: 33.62, lng: -117.93 },
  { id: "santa-ana", label: "Santa Ana", lat: 33.75, lng: -117.87 },
  { id: "ontario", label: "Ontario", lat: 34.06, lng: -117.65 },
  { id: "riverside", label: "Riverside", lat: 33.98, lng: -117.37 },
];

export const hubById = (id: string | null) =>
  id ? ROUTE_HUBS.find((h) => h.id === id) : undefined;

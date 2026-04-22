import type { LngLat, Territory } from "@/lib/types";

export function inPolygon(point: LngLat, polygon: LngLat[]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function inTerritory(
  lngLat: LngLat,
  territory: Territory,
): boolean {
  return inPolygon(lngLat, territory.polygon);
}

const EARTH_KM = 6371;

export function distanceKm(a: LngLat, b: LngLat): number {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const rad = (n: number) => (n * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
}

export function distanceFromLineKm(
  point: LngLat,
  lineStart: LngLat,
  lineEnd: LngLat,
): number {
  const [px, py] = point;
  const [ax, ay] = lineStart;
  const [bx, by] = lineEnd;
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return distanceKm(point, lineStart);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  const projection: LngLat = [ax + t * dx, ay + t * dy];
  return distanceKm(point, projection);
}

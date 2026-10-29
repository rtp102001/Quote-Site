import baseTable from "../data/base-zips.json";
import serviceTable from "../data/service-zips.json";

export interface ZipInfo { city: string; lat: number; lon: number; partial: boolean }
const BASE = baseTable as Record<string, ZipInfo>;
const SERVICE = serviceTable as Record<string, ZipInfo>;

/** Any ZIP we know coordinates for (Johnston County + nearby contractor bases). */
export function lookupZip(zip: string): ZipInfo | undefined { return BASE[zip]; }
/** Johnston County service area: the only ZIPs homeowners can submit from. */
export function serviceZip(zip: string): ZipInfo | undefined { return SERVICE[zip]; }
export const SERVICE_AREA = "Johnston County, NC";

export function haversineMiles(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 3958.8;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

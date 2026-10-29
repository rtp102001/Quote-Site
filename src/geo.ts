import zipTable from "../data/nc-zips.json";

export interface ZipInfo { city: string; lat: number; lon: number }
const ZIPS = zipTable as Record<string, ZipInfo>;

export function lookupZip(zip: string): ZipInfo | undefined {
  return ZIPS[zip];
}

export function haversineMiles(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 3958.8;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

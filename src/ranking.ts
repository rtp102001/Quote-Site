import { haversineMiles, lookupZip } from "./geo";

export interface ContractorRow {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  zip: string;
  service_radius_miles: number;
  rating: number;
  review_count: number;
}

export interface RankedContractor extends ContractorRow {
  distance_miles: number;
  rating_component: number;
  volume_component: number;
  proximity_component: number;
  score: number;
}

/**
 * Ranking formula (all components 0..1):
 *   rating_component    = Bayesian-adjusted rating / 5, prior 4.0 stars weighted as 10 reviews
 *                         ((rating*n + 4.0*10) / (n + 10)) / 5  -> a 5.0 with 2 reviews doesn't beat a 4.8 with 300
 *   volume_component    = min(1, log10(1 + n) / log10(1 + 500))
 *   proximity_component = max(0, 1 - distance / MAX_DISTANCE_MILES)   (MAX = 75)
 *   score = 0.50 * rating + 0.20 * volume + 0.30 * proximity
 * Contractors are only eligible if the homeowner ZIP is within their own service radius
 * (and within MAX_DISTANCE_MILES). Ties break by distance, then id.
 */
export const WEIGHTS = { rating: 0.5, volume: 0.2, proximity: 0.3 } as const;
export const MAX_DISTANCE_MILES = 75;
export const TOP_N = 10;

export function scoreContractor(c: ContractorRow, distance: number) {
  const n = Math.max(0, c.review_count);
  const rating_component = ((c.rating * n + 4.0 * 10) / (n + 10)) / 5;
  const volume_component = Math.min(1, Math.log10(1 + n) / Math.log10(501));
  const proximity_component = Math.max(0, 1 - distance / MAX_DISTANCE_MILES);
  const score =
    WEIGHTS.rating * rating_component + WEIGHTS.volume * volume_component + WEIGHTS.proximity * proximity_component;
  return { rating_component, volume_component, proximity_component, score };
}

export function rankContractors(homeZip: string, contractors: ContractorRow[], topN = TOP_N): RankedContractor[] {
  const home = lookupZip(homeZip);
  if (!home) return [];
  const ranked: RankedContractor[] = [];
  for (const c of contractors) {
    const loc = lookupZip(c.zip);
    if (!loc) continue;
    const d = haversineMiles(home, loc);
    if (d > c.service_radius_miles || d > MAX_DISTANCE_MILES) continue;
    ranked.push({ ...c, distance_miles: Math.round(d * 10) / 10, ...scoreContractor(c, d) });
  }
  ranked.sort((a, b) => b.score - a.score || a.distance_miles - b.distance_miles || a.id.localeCompare(b.id));
  return ranked.slice(0, topN);
}

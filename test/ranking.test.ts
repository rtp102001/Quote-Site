import { describe, expect, it } from "vitest";
import contractors from "../data/contractors.json";
import serviceZips from "../data/service-zips.json";
import { haversineMiles, lookupZip, serviceZip } from "../src/geo";

const JOHNSTON = ["27501","27504","27520","27524","27527","27528","27529","27542","27555","27557","27568","27569","27576","27577","27591","27592","27593","27597","27603","28334","28366"];
import { rankContractors, scoreContractor, type ContractorRow } from "../src/ranking";

const rows: ContractorRow[] = (contractors as any[]).map((c) => ({
  id: c.id, business_name: c.businessName, contact_name: c.contactName, email: c.email, phone: c.phone,
  zip: c.zip, service_radius_miles: c.serviceRadiusMiles, rating: c.rating, review_count: c.reviewCount, _cats: c.categories,
})) as any;
const inCat = (cat: string) => rows.filter((r: any) => r._cats.includes(cat));

describe("geo", () => {
  it("Kenly to Smithfield is ~13-17 miles", () => {
    const d = haversineMiles(lookupZip("27542")!, lookupZip("27577")!);
    expect(d).toBeGreaterThan(12);
    expect(d).toBeLessThan(18);
  });
  it("service area is exactly the 21 Johnston County ZIPs", () => {
    expect(Object.keys(serviceZips).sort()).toEqual(JOHNSTON.sort());
    for (const z of ["27601", "27893", "27530", "28202"]) expect(serviceZip(z)).toBeUndefined();
  });
});

describe("ranking", () => {
  it("selects exactly 10 for each category from every Johnston County ZIP", () => {
    for (const zip of JOHNSTON) for (const cat of ["landscaping", "hvac", "roofing", "septic_plumbing", "electrical"]) {
      const top = rankContractors(zip, inCat(cat));
      expect(top).toHaveLength(10);
      for (let i = 1; i < top.length; i++) expect(top[i - 1].score).toBeGreaterThanOrEqual(top[i].score);
    }
  });
  it("excludes contractors outside their service radius", () => {
    const all = rankContractors("28366", inCat("hvac"), 100); // Newton Grove, southern edge
    expect(all.every((c) => c.distance_miles <= c.service_radius_miles)).toBe(true);
    expect(all.length).toBeLessThan(20);
  });
  it("seed contractors are based in or near Johnston County", () => {
    for (const r of rows) expect(haversineMiles(lookupZip(r.zip)!, lookupZip("27577")!)).toBeLessThan(35);
  });
  it("Bayesian rating: 4.8 with 300 reviews beats 5.0 with 2 reviews at equal distance", () => {
    const a = scoreContractor({ rating: 4.8, review_count: 300 } as ContractorRow, 10);
    const b = scoreContractor({ rating: 5.0, review_count: 2 } as ContractorRow, 10);
    expect(a.score).toBeGreaterThan(b.score);
  });
  it("closer wins when quality is equal", () => {
    const base = { rating: 4.5, review_count: 100 } as ContractorRow;
    expect(scoreContractor(base, 5).score).toBeGreaterThan(scoreContractor(base, 40).score);
  });
  it("unknown ZIP returns nobody", () => {
    expect(rankContractors("99999", rows)).toEqual([]);
  });
});

describe("seed data is clearly fake", () => {
  it("every seed contractor is SAMPLE, example.com, 555", () => {
    for (const c of contractors as any[]) {
      expect(c.businessName.startsWith("SAMPLE")).toBe(true);
      expect(c.email.endsWith("@example.com")).toBe(true);
      expect(c.phone.startsWith("555")).toBe(true);
    }
  });
});

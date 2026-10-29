import { describe, expect, it } from "vitest";
import { sniffImageType, validateQuote, validateSignup, MAX_PHOTO_BYTES } from "../src/validation";
import { JPG, PNG, photo } from "./helpers";

const good = { name: "Pat Homeowner", email: "Pat@Example.com", phone: "(919) 555-0123", zip: "27542",
  category: "roofing", description: "Shingles blew off after the storm.", photos: [photo(), photo(), photo("c.jpg", "image/jpeg", JPG)] };

describe("validateQuote", () => {
  it("accepts a valid request and normalizes", () => {
    const r = validateQuote(good);
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.value.email).toBe("pat@example.com"); expect(r.value.phone).toBe("9195550123"); }
  });
  it("requires 3-5 photos", () => {
    expect(validateQuote({ ...good, photos: [photo(), photo()] }).ok).toBe(false);
    expect(validateQuote({ ...good, photos: Array(6).fill(photo()) }).ok).toBe(false);
    expect(validateQuote({ ...good, photos: Array(5).fill(photo()) }).ok).toBe(true);
  });
  it("rejects non-images and spoofed MIME", () => {
    const txt = { name: "x.png", type: "image/png", bytes: new TextEncoder().encode("hello world") };
    expect(validateQuote({ ...good, photos: [photo(), photo(), txt] }).ok).toBe(false);
    expect(validateQuote({ ...good, photos: [photo(), photo(), { name: "d.pdf", type: "application/pdf", bytes: PNG }] }).ok).toBe(false);
  });
  it("rejects oversize photos", () => {
    const big = new Uint8Array(MAX_PHOTO_BYTES + 1); big.set(PNG);
    expect(validateQuote({ ...good, photos: [photo(), photo(), photo("big.png", "image/png", big)] }).ok).toBe(false);
  });
  it("rejects unknown category and non-NC ZIP", () => {
    expect(validateQuote({ ...good, category: "pools" }).ok).toBe(false);
    expect(validateQuote({ ...good, zip: "10001" }).ok).toBe(false);
  });
  it("sniffs image types", () => {
    expect(sniffImageType(PNG)).toBe("image/png");
    expect(sniffImageType(JPG)).toBe("image/jpeg");
    expect(sniffImageType(new Uint8Array([1, 2, 3]))).toBeNull();
  });
});

describe("validateSignup", () => {
  it("accepts valid and rejects bad categories", () => {
    const base = { contact_name: "Al", business_name: "Al's HVAC", email: "al@example.com", phone: "9195550100", zip: "27577", service_radius_miles: "40", categories: ["hvac"] };
    expect(validateSignup(base).ok).toBe(true);
    expect(validateSignup({ ...base, categories: ["pools"] }).ok).toBe(false);
    expect(validateSignup({ ...base, categories: [] }).ok).toBe(false);
  });
});

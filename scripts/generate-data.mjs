/**
 * Regenerates data/service-zips.json (Johnston County, NC — the only area we accept requests from),
 * data/base-zips.json (where contractors may be based: the county plus nearby towns),
 * data/contractors.json and seed/contractors.sql.
 *
 * Johnston County ZIP list (21 ZIPs, incl. 3 PO-box ZIPs) verified 2026-10-29 against
 * zipdatamaps.com and hometownlocator.com county ZIP lists. "partial" ZIPs straddle the
 * county line; coordinates for those are placed on the Johnston County side.
 * Coordinates are approximate community centers (for distance ranking, not survey points).
 *
 * Every contractor is FICTIONAL: business names start with "SAMPLE:", emails @example.com, phones 555-01xx.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(join(root, "data"), { recursive: true });
mkdirSync(join(root, "seed"), { recursive: true });

// zip: [city, lat, lon, partial]
const johnston = {
  "27504": ["Benson", 35.3821, -78.5486, false],
  "27520": ["Clayton", 35.6507, -78.4564, false],
  "27524": ["Four Oaks", 35.4457, -78.4264, false],
  "27527": ["Clayton / Archer Lodge", 35.6670, -78.3780, false],
  "27528": ["Clayton (PO Box)", 35.6507, -78.4564, false],
  "27542": ["Kenly", 35.5954, -78.1247, false],
  "27555": ["Micro", 35.5638, -78.2039, false],
  "27568": ["Pine Level", 35.5129, -78.2447, false],
  "27569": ["Princeton", 35.4663, -78.1603, false],
  "27576": ["Selma", 35.5363, -78.2844, false],
  "27577": ["Smithfield", 35.5085, -78.3394, false],
  "27593": ["Wilson's Mills", 35.5843, -78.3525, false],
  "27501": ["Angier (Johnston side)", 35.5150, -78.6700, true],
  "27529": ["Garner / Cleveland (Johnston side)", 35.6150, -78.5500, true],
  "27557": ["Middlesex (Johnston side)", 35.7500, -78.2300, true],
  "27591": ["Wendell (Johnston side)", 35.7300, -78.3500, true],
  "27592": ["Willow Spring", 35.5460, -78.6720, true],
  "27597": ["Zebulon (Johnston side)", 35.7500, -78.3000, true],
  "27603": ["Raleigh (Johnston side)", 35.6300, -78.6000, true],
  "28334": ["Dunn (Johnston side)", 35.3300, -78.5500, true],
  "28366": ["Newton Grove (Johnston side)", 35.2800, -78.3800, true],
};
// Nearby contractor bases outside the county.
const nearby = {
  "27893": ["Wilson", 35.7213, -77.9155],
  "27530": ["Goldsboro", 35.3849, -77.9928],
  "27610": ["Raleigh (SE)", 35.7660, -78.5800],
  "27526": ["Fuquay-Varina", 35.5843, -78.8000],
  "27546": ["Lillington", 35.3993, -78.8164],
  "27863": ["Pikeville", 35.4963, -77.9822],
};

const service = Object.fromEntries(Object.entries(johnston).map(([z, [city, lat, lon, partial]]) => [z, { city, lat, lon, partial }]));
const base = { ...service, ...Object.fromEntries(Object.entries(nearby).map(([z, [city, lat, lon]]) => [z, { city, lat, lon, partial: false }])) };
writeFileSync(join(root, "data/service-zips.json"), JSON.stringify(service, null, 2) + "\n");
writeFileSync(join(root, "data/base-zips.json"), JSON.stringify(base, null, 2) + "\n");

const categories = [
  { id: "landscaping", trade: "Lawn & Landscape" },
  { id: "hvac", trade: "Heating & Air" },
  { id: "roofing", trade: "Roofing" },
  { id: "septic_plumbing", trade: "Septic & Plumbing" },
  { id: "electrical", trade: "Electric" },
];
// 20 per category: 14 in-county, 6 nearby. Rating plan gives a spread of quality.
const homes = ["27577", "27520", "27576", "27542", "27504", "27524", "27527", "27569", "27555", "27568", "27593", "27592", "27501", "27529",
  "27893", "27530", "27610", "27526", "27546", "27863"];
const ratingPlan = [[4.9, 240], [4.85, 180], [4.8, 160], [4.7, 120], [4.6, 90], [4.55, 70], [4.4, 50], [4.3, 35], [4.2, 22], [4.95, 8],
  [4.1, 60], [3.9, 140], [4.75, 200], [4.5, 15], [4.65, 110], [4.0, 30], [4.8, 300], [4.45, 45], [3.8, 25], [4.6, 5]];
const firstNames = ["Avery", "Blake", "Casey", "Drew", "Emerson", "Finley", "Gray", "Harper", "Jordan", "Kendall", "Logan", "Morgan", "Parker", "Quinn", "Reese", "Sawyer", "Taylor", "Rowan", "Skyler", "Jamie"];
const contractors = [];
let phone = 100;
for (const category of categories) {
  homes.forEach((zip, i) => {
    const n = String(i + 1).padStart(2, "0");
    const [rating, reviewCount] = ratingPlan[(i + categories.indexOf(category) * 3) % ratingPlan.length];
    contractors.push({
      id: `seed_${category.id}_${n}`,
      contactName: `${firstNames[i]} Sample`,
      businessName: `SAMPLE: ${base[zip].city.replace(/ \(.*\)/, "")} ${category.trade}`,
      email: `sample.${category.id}.${n}@example.com`,
      phone: `555010${String(phone++).padStart(4, "0")}`.slice(0, 10),
      zip,
      serviceRadiusMiles: i < 14 ? 30 + (i % 3) * 5 : 40,
      rating,
      reviewCount,
      categories: [category.id],
    });
  });
}
writeFileSync(join(root, "data/contractors.json"), JSON.stringify(contractors, null, 2) + "\n");

const q = (v) => `'${String(v).replaceAll("'", "''")}'`;
const lines = [
  "-- SAMPLE / FAKE contractors for local development only.",
  "-- Fictional businesses: names start with SAMPLE, emails are @example.com, phones are 555.",
  "-- Do not load this seed in production and do not send these addresses real mail.",
];
for (const c of contractors) {
  lines.push(`INSERT INTO contractors (id, contact_name, business_name, email, phone, zip, service_radius_miles, rating, review_count, source, created_at) VALUES (${[q(c.id), q(c.contactName), q(c.businessName), q(c.email), q(c.phone), q(c.zip), c.serviceRadiusMiles, c.rating, c.reviewCount, "'seed'", "'2026-01-15T00:00:00.000Z'"].join(", ")});`);
  for (const cat of c.categories) lines.push(`INSERT INTO contractor_categories (contractor_id, category) VALUES (${q(c.id)}, ${q(cat)});`);
}
writeFileSync(join(root, "seed/contractors.sql"), lines.join("\n") + "\n");
console.log(`Service ZIPs: ${Object.keys(service).length}, base ZIPs: ${Object.keys(base).length}, contractors: ${contractors.length}`);

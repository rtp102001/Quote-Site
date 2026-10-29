/**
 * Regenerates data/nc-zips.json, data/contractors.json, and seed/contractors.sql.
 * Coordinates are approximate city centers for ranking, not survey points.
 * Every contractor is fictional: SAMPLE business names, 555 phones, example.com.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function round(n) {
  return Math.round(n * 10000) / 10000;
}

/** @type {Map<string, {city: string, lat: number, lon: number}>} */
const zips = new Map();

function city(name, lat, lon, zipList) {
  const mid = (zipList.length - 1) / 2;
  zipList.forEach((zip, i) => {
    if (zips.has(zip)) throw new Error(`Duplicate ZIP ${zip}`);
    const o = i - mid;
    zips.set(zip, {
      city: name,
      lat: round(lat + o * 0.012),
      lon: round(lon + o * 0.015),
    });
  });
}

// Johnston / Wilson / Wayne / Wake core, then a wider NC table.
city("Kenly", 35.5954, -78.1247, ["27542"]);
city("Micro", 35.5638, -78.2039, ["27555"]);
city("Selma", 35.5363, -78.2844, ["27576"]);
city("Smithfield", 35.5085, -78.3394, ["27577"]);
city("Four Oaks", 35.4457, -78.4264, ["27524"]);
city("Benson", 35.3821, -78.5486, ["27504"]);
city("Princeton", 35.4663, -78.1603, ["27569"]);
city("Clayton", 35.6507, -78.4564, ["27520", "27527"]);
city("Wendell", 35.781, -78.3697, ["27591"]);
city("Zebulon", 35.8243, -78.3147, ["27597"]);
city("Middlesex", 35.7902, -78.2042, ["27557"]);
city("Bailey", 35.7804, -78.118, ["27807"]);
city("Lucama", 35.6449, -78.0097, ["27851"]);
city("Wilson", 35.7213, -77.9155, ["27893", "27896"]);
city("Elm City", 35.8065, -77.8628, ["27822"]);
city("Stantonsburg", 35.6063, -77.823, ["27883"]);
city("Fremont", 35.5457, -77.9753, ["27830"]);
city("Pikeville", 35.4963, -77.9822, ["27863"]);
city("Goldsboro", 35.3849, -77.9928, ["27530", "27534"]);
city("Mount Olive", 35.1971, -78.0664, ["28365"]);
city("La Grange", 35.306, -77.7903, ["28551"]);
city("Snow Hill", 35.4513, -77.6747, ["28580"]);
city("Farmville", 35.5957, -77.5897, ["27828"]);
city("Spring Hope", 35.9452, -78.1092, ["27882"]);
city("Nashville", 35.9743, -77.9658, ["27856"]);
city("Rocky Mount", 35.9382, -77.7905, ["27801", "27803", "27804"]);
city("Tarboro", 35.8968, -77.5358, ["27886"]);
city("Greenville", 35.6127, -77.3664, ["27834", "27858"]);
city("Ayden", 35.4724, -77.4158, ["28513"]);
city("Kinston", 35.2627, -77.5816, ["28501", "28504"]);
city("Knightdale", 35.7874, -78.4806, ["27545"]);
city("Garner", 35.7113, -78.6142, ["27529"]);
city("Raleigh", 35.7796, -78.6382, [
  "27601", "27603", "27604", "27605", "27606", "27607", "27608", "27609",
  "27610", "27612", "27613", "27614", "27615", "27616", "27617",
]);
city("Cary", 35.7915, -78.7811, ["27511", "27513", "27518", "27519"]);
city("Apex", 35.7327, -78.8503, ["27502", "27523", "27539"]);
city("Holly Springs", 35.6513, -78.8336, ["27540"]);
city("Fuquay-Varina", 35.5843, -78.8, ["27526"]);
city("Morrisville", 35.8235, -78.8256, ["27560"]);
city("Wake Forest", 35.9799, -78.5097, ["27587"]);
city("Rolesville", 35.9235, -78.4575, ["27571"]);
city("Youngsville", 36.0246, -78.4744, ["27596"]);
city("Franklinton", 36.1015, -78.4569, ["27525"]);
city("Louisburg", 36.099, -78.3017, ["27549"]);
city("Durham", 35.994, -78.8986, ["27701", "27703", "27704", "27705", "27707", "27712", "27713"]);
city("Chapel Hill", 35.9132, -79.0558, ["27514", "27516", "27517"]);
city("Carrboro", 35.9101, -79.0753, ["27510"]);
city("Hillsborough", 36.0754, -79.0997, ["27278"]);
city("Creedmoor", 36.1224, -78.685, ["27522"]);
city("Butner", 36.1321, -78.7564, ["27509"]);
city("Oxford", 36.3107, -78.5908, ["27565"]);
city("Henderson", 36.3296, -78.3992, ["27536", "27537"]);
city("Roxboro", 36.3935, -78.9828, ["27573", "27574"]);
city("Dunn", 35.3063, -78.6089, ["28334", "28335"]);
city("Lillington", 35.3993, -78.8156, ["27546"]);
city("Angier", 35.5071, -78.7392, ["27501"]);
city("Erwin", 35.3254, -78.6736, ["28339"]);
city("Sanford", 35.4799, -79.1803, ["27330", "27332"]);
city("Pittsboro", 35.7202, -79.1772, ["27312"]);
city("Siler City", 35.7235, -79.4622, ["27344"]);
city("Fayetteville", 35.0527, -78.8784, ["28301", "28303", "28304", "28305", "28306", "28311", "28314"]);
city("Hope Mills", 34.9704, -78.9453, ["28348"]);
city("Spring Lake", 35.1679, -78.9759, ["28390"]);
city("Clinton", 34.9979, -78.3233, ["28328"]);
city("Newton Grove", 35.2457, -78.3556, ["28366"]);
city("Roseboro", 34.9527, -78.5097, ["28382"]);
city("Warsaw", 34.9993, -78.0911, ["28398"]);
city("Wallace", 34.7357, -77.995, ["28466"]);
city("Burgaw", 34.5521, -77.9261, ["28425"]);
city("Jacksonville", 34.754, -77.4302, ["28540", "28546"]);
city("Richlands", 34.8993, -77.5466, ["28574"]);
city("Swansboro", 34.6877, -77.1194, ["28584"]);
city("Morehead City", 34.7229, -76.726, ["28557"]);
city("Beaufort", 34.7182, -76.6638, ["28516"]);
city("Havelock", 34.8791, -76.9013, ["28532"]);
city("New Bern", 35.1085, -77.0441, ["28560", "28562"]);
city("Washington", 35.5463, -77.052, ["27889"]);
city("Williamston", 35.8546, -77.0555, ["27892"]);
city("Roanoke Rapids", 36.4615, -77.6542, ["27870"]);
city("Elizabeth City", 36.2946, -76.2511, ["27909"]);
city("Edenton", 36.0579, -76.6077, ["27932"]);
city("Ahoskie", 36.2868, -76.9847, ["27910"]);
city("Nags Head", 35.9573, -75.6241, ["27959"]);
city("Kitty Hawk", 36.0646, -75.7055, ["27949"]);
city("Manteo", 35.9082, -75.6757, ["27954"]);
city("Wilmington", 34.2257, -77.9447, ["28401", "28403", "28405", "28409", "28411", "28412"]);
city("Wrightsville Beach", 34.2082, -77.7961, ["28480"]);
city("Carolina Beach", 34.0352, -77.8936, ["28428"]);
city("Leland", 34.2563, -78.0447, ["28451"]);
city("Southport", 33.9216, -78.0203, ["28461"]);
city("Shallotte", 33.9732, -78.3836, ["28459"]);
city("Whiteville", 34.3388, -78.7031, ["28472"]);
city("Lumberton", 34.6182, -79.0086, ["28358", "28360"]);
city("Laurinburg", 34.7741, -79.4628, ["28352"]);
city("Rockingham", 34.9393, -79.7745, ["28379"]);
city("Hamlet", 34.8846, -79.6948, ["28345"]);
city("Pinehurst", 35.1954, -79.4695, ["28374"]);
city("Southern Pines", 35.174, -79.3928, ["28387"]);
city("Aberdeen", 35.1315, -79.4292, ["28315"]);
city("Raeford", 34.981, -79.2242, ["28376"]);
city("Greensboro", 36.0726, -79.792, ["27401", "27403", "27405", "27406", "27407", "27408", "27410"]);
city("High Point", 35.9557, -80.0053, ["27260", "27262", "27265"]);
city("Burlington", 36.0957, -79.4378, ["27215", "27217"]);
city("Graham", 36.069, -79.4006, ["27253"]);
city("Mebane", 36.096, -79.2669, ["27302"]);
city("Elon", 36.1029, -79.5067, ["27244"]);
city("Gibsonville", 36.1057, -79.5422, ["27249"]);
city("Reidsville", 36.3546, -79.6645, ["27320"]);
city("Eden", 36.4885, -79.7667, ["27288"]);
city("Asheboro", 35.7079, -79.8136, ["27203", "27205"]);
city("Winston-Salem", 36.0999, -80.2442, ["27101", "27103", "27104", "27105", "27106", "27107"]);
city("Kernersville", 36.1199, -80.0737, ["27284"]);
city("Clemmons", 36.0215, -80.382, ["27012"]);
city("Lewisville", 36.0993, -80.4167, ["27023"]);
city("King", 36.2807, -80.3592, ["27021"]);
city("Mount Airy", 36.4993, -80.6073, ["27030"]);
city("Lexington", 35.824, -80.2534, ["27292", "27295"]);
city("Thomasville", 35.8826, -80.0817, ["27360"]);
city("Salisbury", 35.671, -80.4742, ["28144", "28146"]);
city("Kannapolis", 35.4874, -80.6217, ["28081", "28083"]);
city("Concord", 35.4088, -80.5795, ["28025", "28027"]);
city("Harrisburg", 35.3238, -80.6487, ["28075"]);
city("Huntersville", 35.4107, -80.8428, ["28078"]);
city("Cornelius", 35.4868, -80.8601, ["28031"]);
city("Davidson", 35.4993, -80.8487, ["28036"]);
city("Mooresville", 35.5849, -80.8101, ["28115", "28117"]);
city("Statesville", 35.7826, -80.8873, ["28625", "28677"]);
city("Hickory", 35.7345, -81.3445, ["28601", "28602"]);
city("Newton", 35.6699, -81.2215, ["28658"]);
city("Morganton", 35.7454, -81.6848, ["28655"]);
city("Lenoir", 35.914, -81.5387, ["28645"]);
city("Boone", 36.2168, -81.6746, ["28607"]);
city("Blowing Rock", 36.1351, -81.6776, ["28605"]);
city("Wilkesboro", 36.1457, -81.1606, ["28697"]);
city("North Wilkesboro", 36.1585, -81.1476, ["28659"]);
city("Elkin", 36.2443, -80.8487, ["28621"]);
city("Charlotte", 35.2271, -80.8431, [
  "28202", "28203", "28204", "28205", "28206", "28207", "28208", "28209",
  "28210", "28211", "28212", "28213", "28214", "28215", "28216", "28217",
  "28226", "28227", "28262", "28269", "28270", "28277",
]);
city("Matthews", 35.1168, -80.7237, ["28105"]);
city("Indian Trail", 35.0768, -80.6692, ["28079"]);
city("Monroe", 34.9854, -80.5495, ["28110", "28112"]);
city("Waxhaw", 34.9246, -80.7434, ["28173"]);
city("Pineville", 35.0832, -80.8923, ["28134"]);
city("Gastonia", 35.2621, -81.1873, ["28052", "28054"]);
city("Belmont", 35.2429, -81.037, ["28012"]);
city("Mount Holly", 35.2982, -81.0159, ["28120"]);
city("Kings Mountain", 35.2451, -81.3412, ["28086"]);
city("Shelby", 35.2924, -81.5356, ["28150", "28152"]);
city("Lincolnton", 35.4735, -81.2545, ["28092"]);
city("Albemarle", 35.3501, -80.2001, ["28001"]);
city("Wadesboro", 35.0763, -80.0653, ["28170"]);
city("Asheville", 35.5951, -82.5515, ["28801", "28803", "28804", "28805", "28806"]);
city("Hendersonville", 35.3187, -82.4609, ["28739", "28792"]);
city("Fletcher", 35.4307, -82.5012, ["28732"]);
city("Black Mountain", 35.6179, -82.3212, ["28711"]);
city("Weaverville", 35.6971, -82.5607, ["28787"]);
city("Waynesville", 35.4887, -82.9887, ["28786"]);
city("Canton", 35.5329, -82.8374, ["28716"]);
city("Sylva", 35.3737, -83.2257, ["28779"]);
city("Franklin", 35.1823, -83.3815, ["28734"]);
city("Brevard", 35.2334, -82.7343, ["28712"]);
city("Marion", 35.684, -82.0093, ["28752"]);
city("Boone Gap", 36.2168, -81.6746, []);
city("Murphy", 35.0876, -84.0346, ["28906"]);
city("Andrews", 35.2015, -83.8257, ["28901"]);
city("Bryson City", 35.4268, -83.4477, ["28713"]);
city("Hayesville", 35.0465, -83.8177, ["28904"]);

if (zips.size < 200) {
  throw new Error(`Expected a reasonably sized NC ZIP table, got ${zips.size}`);
}

const zipObj = Object.fromEntries(
  [...zips.entries()].sort((a, b) => a[0].localeCompare(b[0])),
);
writeFileSync(join(root, "data/nc-zips.json"), JSON.stringify(zipObj, null, 2) + "\n");

const categories = [
  { id: "landscaping", trade: "Lawn & Landscape" },
  { id: "hvac", trade: "Heating & Air" },
  { id: "roofing", trade: "Roofing" },
  { id: "septic_plumbing", trade: "Septic & Plumbing" },
  { id: "electrical", trade: "Electric" },
];

// Close enough to Kenly that a 45+ mile radius covers 27542.
const localZips = [
  "27542", "27555", "27576", "27577", "27893", "27851", "27807", "27530",
  "27569", "27520", "27591", "27597", "27601", "27529", "27545", "27804",
  "27609",
];
const far = [
  { zip: "28202", radius: 25 },
  { zip: "28801", radius: 30 },
  { zip: "28401", radius: 20 },
];

const ratingPlan = [
  [4.9, 240],
  [4.85, 180],
  [4.8, 160],
  [4.7, 120],
  [4.6, 90],
  [4.55, 70],
  [4.4, 50],
  [4.3, 35],
  [4.2, 22],
  [4.95, 14],
  [3.9, 80],
  [3.7, 40],
  [4.5, 10],
  [4.1, 18],
  [4.0, 6],
  [3.6, 15],
  [4.75, 200],
];

const firstNames = ["Sam", "Pat", "Jordan", "Riley", "Casey", "Avery", "Quinn", "Drew", "Morgan", "Taylor"];

/** @type {Array<Record<string, unknown>>} */
const contractors = [];
let phone = 1001;

for (const category of categories) {
  localZips.forEach((zip, index) => {
    const [rating, reviewCount] = ratingPlan[index];
    const place = zips.get(zip);
    const n = String(index + 1).padStart(2, "0");
    const radius = 50 + (index % 5) * 5;
    contractors.push({
      id: `seed_${category.id}_${n}`,
      contactName: `${firstNames[index % firstNames.length]} Sample`,
      businessName: `SAMPLE: ${place.city} ${category.trade}`,
      email: `sample.${category.id}.${n}@example.com`,
      phone: `555010${String(phone).padStart(4, "0")}`.slice(0, 10),
      zip,
      serviceRadiusMiles: radius,
      rating,
      reviewCount,
      categories: [category.id],
    });
    phone += 1;
  });
  far.forEach((row, index) => {
    const place = zips.get(row.zip);
    const n = String(localZips.length + index + 1).padStart(2, "0");
    contractors.push({
      id: `seed_${category.id}_${n}`,
      contactName: `${firstNames[index % firstNames.length]} Sample`,
      businessName: `SAMPLE: ${place.city} ${category.trade}`,
      email: `sample.${category.id}.${n}@example.com`,
      phone: `555010${String(phone).padStart(4, "0")}`.slice(0, 10),
      zip: row.zip,
      serviceRadiusMiles: row.radius,
      rating: 4.9,
      reviewCount: 300,
      categories: [category.id],
    });
    phone += 1;
  });
}

if (phone > 1999) throw new Error("Ran out of 555-0100 fictional numbers");

writeFileSync(join(root, "data/contractors.json"), JSON.stringify(contractors, null, 2) + "\n");

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const lines = [];
lines.push("-- SAMPLE / FAKE contractors for local development only.");
lines.push("-- Fictional businesses: names start with SAMPLE, emails are @example.com, phones are 555.");
lines.push("-- Do not load this seed in production and do not send these addresses real mail.");
lines.push("BEGIN TRANSACTION;");
for (const c of contractors) {
  lines.push(
    "INSERT INTO contractors (id, contact_name, business_name, email, phone, zip, service_radius_miles, rating, review_count, source, created_at) VALUES (" +
      [
        sqlString(c.id),
        sqlString(c.contactName),
        sqlString(c.businessName),
        sqlString(c.email),
        sqlString(c.phone),
        sqlString(c.zip),
        String(c.serviceRadiusMiles),
        String(c.rating),
        String(c.reviewCount),
        "'seed'",
        "'2026-01-15T00:00:00.000Z'",
      ].join(", ") +
      ");",
  );
  for (const category of c.categories) {
    lines.push(
      `INSERT INTO contractor_categories (contractor_id, category) VALUES (${sqlString(c.id)}, ${sqlString(category)});`,
    );
  }
}
lines.push("COMMIT;");
lines.push("");
writeFileSync(join(root, "seed/contractors.sql"), lines.join("\n"));

const perCategory = Object.fromEntries(categories.map((c) => [c.id, contractors.filter((row) => row.categories.includes(c.id)).length]));
console.log(`ZIPs: ${zips.size}`);
console.log(`Contractors: ${contractors.length}`);
console.log(perCategory);

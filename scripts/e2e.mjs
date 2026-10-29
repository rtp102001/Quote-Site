// End-to-end test against a running `wrangler dev` (default http://127.0.0.1:8787).
// Submits a quote with 3 generated PNGs + the Turnstile dummy token, verifies the email link
// from the mock outbox, and checks that exactly 10 contractors were notified.
import { writeFileSync } from "node:fs";
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:8787";
const TOKEN = "XXXX.DUMMY.TOKEN.XXXX"; // accepted by Turnstile's always-pass test secret
const png = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"));
const email = `e2e+${Date.now()}@example.com`;
const log = [];
const check = (cond, msg) => { log.push(`${cond ? "PASS" : "FAIL"} ${msg}`); console.log(log.at(-1)); if (!cond) process.exitCode = 1; };

const fd = new FormData();
Object.entries({ name: "E2E Homeowner", email, phone: "919-555-0199", zip: "27542", category: "septic_plumbing",
  description: "Septic alarm is going off and the yard is soggy near the tank.", "cf-turnstile-response": TOKEN })
  .forEach(([k, v]) => fd.append(k, v));
for (let i = 1; i <= 3; i++) fd.append("photos", new Blob([png], { type: "image/png" }), `photo${i}.png`);
let res = await fetch(`${BASE}/api/quote`, { method: "POST", body: fd, headers: { Accept: "application/json" } });
const sub = await res.json();
check(res.status === 202 && sub.ok, `submit -> ${res.status} ${JSON.stringify(sub)}`);

// Negative: only 2 photos
const fd2 = new FormData();
for (const [k, v] of fd.entries()) if (k !== "photos") fd2.append(k, v);
fd2.append("photos", new Blob([png], { type: "image/png" }), "a.png"); fd2.append("photos", new Blob([png], { type: "image/png" }), "b.png");
res = await fetch(`${BASE}/api/quote`, { method: "POST", body: fd2, headers: { Accept: "application/json" } });
check(res.status === 400, `2 photos rejected -> ${res.status}`);

let outbox = await (await fetch(`${BASE}/dev/outbox.json`)).json();
const verify = outbox.find((m) => m.to_address === email && m.kind === "verify");
check(!!verify, "verification email rendered in mock outbox");
const link = verify.text_body.match(/https?:\/\/\S+verify\?token=\S+/)[0];
res = await fetch(`${link}&format=json`);
const ver = await res.json();
check(res.ok && ver.contractors.length === 10, `verify -> exactly ${ver.contractors?.length} contractors selected`);
console.table(ver.contractors);

outbox = await (await fetch(`${BASE}/dev/outbox.json`)).json();
const leads = outbox.filter((m) => m.request_id === sub.requestId && m.kind === "contractor_lead");
check(leads.length === 10, `${leads.length} contractor lead emails rendered`);
check(leads.every((m) => m.to_address.endsWith("@example.com") && m.reply_to === email), "leads go to SAMPLE @example.com contractors, reply-to homeowner");
const photoUrl = leads[0].text_body.match(/https?:\/\/\S+\/photos\/\S+/)[0];
res = await fetch(photoUrl);
check(res.ok && res.headers.get("content-type") === "image/png", `photo link serves image -> ${res.status}`);
check((await fetch(photoUrl.replace(/t=.*/, "t=bad"))).status === 404, "photo link with bad token is 404");
check(outbox.some((m) => m.request_id === sub.requestId && m.kind === "homeowner_confirm"), "homeowner confirmation rendered");
res = await fetch(`${link}&format=json`);
check(!(await res.text()).includes('"contractors"'), "second verify click does not resend");

// Rate limit per email: 3/day (one already used above, 2-photo one failed validation before counting)
let last;
for (let i = 0; i < 3; i++) last = await fetch(`${BASE}/api/quote`, { method: "POST", body: fd, headers: { Accept: "application/json" } });
check(last.status === 429, `4th submission from same email rate-limited -> ${last.status}`);

writeFileSync("E2E_RESULTS.md", `# E2E results\n\nRun: ${new Date().toString()}\nBase: ${BASE}\n\n` +
  log.map((l) => `- ${l}`).join("\n") +
  `\n\n## Top 10 selected (Septic & Plumbing, ZIP 27542 Kenly)\n\n| # | Business | Rating | Reviews | Miles | Score |\n|---|---|---|---|---|---|\n` +
  ver.contractors.map((c, i) => `| ${i + 1} | ${c.business_name} | ${c.rating} | ${c.review_count} | ${c.distance_miles} | ${c.score} |`).join("\n") +
  `\n\n## Sample rendered lead email (text)\n\n\`\`\`\nSubject: ${leads[0].subject}\nTo: ${leads[0].to_address}\nReply-To: ${leads[0].reply_to}\n\n${leads[0].text_body}\n\`\`\`\n`);

import { categoryLabel } from "./categories";
import { createEmailSender, renderContractorLead, renderHomeownerConfirm, renderVerifyEmail, type LeadRequest } from "./email";
import { esc } from "./html";
import { homePage, layout, messagePage, signupPage } from "./pages";
import { rankContractors, type ContractorRow } from "./ranking";
import { checkRateLimits, QUOTE_LIMITS, SIGNUP_LIMITS } from "./ratelimit";
import { verifyTurnstile } from "./turnstile";
import { validateQuote, validateSignup, type PhotoInput } from "./validation";

export interface Env {
  DB: D1Database; PHOTOS: R2Bucket;
  ENVIRONMENT: string; EMAIL_PROVIDER: string; EMAIL_FROM: string; PUBLIC_BASE_URL: string;
  TURNSTILE_SITE_KEY: string; TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY?: string; CLOUDFLARE_API_TOKEN?: string; CLOUDFLARE_EMAIL_API_URL?: string;
}

const wantsJson = (req: Request) => (req.headers.get("Accept") ?? "").includes("application/json");
const json = (data: unknown, status = 200) => Response.json(data, { status });
const clientIp = (req: Request) => req.headers.get("CF-Connecting-IP") ?? "127.0.0.1";

export async function sha256Hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function randomToken(): string {
  const b = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function handleQuote(req: Request, env: Env): Promise<Response> {
  const asJson = wantsJson(req);
  const fail = (errors: string[], status = 400) => asJson ? json({ ok: false, errors }, status) : withStatus(homePage(env.TURNSTILE_SITE_KEY, errors), status);
  let form: FormData;
  try { form = await req.formData(); } catch { return fail(["Invalid form submission."]); }
  const ip = clientIp(req);
  if (!(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, form.get("cf-turnstile-response") as string | null, ip)))
    return fail(["Spam check failed. Please try again."], 403);

  const photos: PhotoInput[] = [];
  for (const entry of form.getAll("photos") as unknown as (string | File)[]) {
    const f = entry;
    if (typeof f === "string") continue;
    photos.push({ name: f.name, type: f.type, bytes: new Uint8Array(await f.arrayBuffer()) });
  }
  const v = validateQuote({
    name: form.get("name") as string, email: form.get("email") as string, phone: form.get("phone") as string,
    zip: form.get("zip") as string, category: form.get("category") as string, description: form.get("description") as string, photos,
  });
  if (!v.ok) return fail(v.errors);
  const q = v.value;
  if (!(await checkRateLimits(env.DB, QUOTE_LIMITS(ip, q.email)))) return fail(["Too many requests. Please try again later."], 429);

  const id = crypto.randomUUID();
  const token = randomToken();
  const now = new Date().toISOString();
  const stmts = [env.DB.prepare(`INSERT INTO quote_requests (id, homeowner_name, email, phone, zip, category, description, status,
      verification_token_hash, photo_access_token, created_at, submitter_ip) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`)
    .bind(id, q.name, q.email, q.phone, q.zip, q.category, q.description, await sha256Hex(token), randomToken(), now, ip)];
  for (const [i, p] of q.photos.entries()) {
    const key = `requests/${id}/${i + 1}`;
    await env.PHOTOS.put(key, p.bytes, { httpMetadata: { contentType: p.type } });
    stmts.push(env.DB.prepare(`INSERT INTO quote_photos (id, request_id, r2_key, content_type, byte_size, original_name) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), id, key, p.type, p.bytes.length, p.name.slice(0, 200)));
  }
  await env.DB.batch(stmts);

  const verifyUrl = `${env.PUBLIC_BASE_URL}/verify?token=${encodeURIComponent(token)}`;
  await createEmailSender(env).send({ to: q.email, kind: "verify", requestId: id, ...renderVerifyEmail({ name: q.name, verifyUrl, categoryId: q.category }) });
  if (asJson) return json({ ok: true, requestId: id, status: "pending_verification" }, 202);
  return messagePage("Check your email", `Thanks, ${esc(q.name)}! We sent a confirmation link to <b>${esc(q.email)}</b>. Click it to send your request to local contractors.`, 202);
}

export async function dispatchRequest(env: Env, requestId: string) {
  const r = await env.DB.prepare("SELECT * FROM quote_requests WHERE id = ?").bind(requestId)
    .first<LeadRequest & { photo_access_token: string }>();
  if (!r) throw new Error("request not found");
  const { results } = await env.DB.prepare(`SELECT c.* FROM contractors c JOIN contractor_categories cc ON cc.contractor_id = c.id WHERE cc.category = ?`)
    .bind(r.category).all<ContractorRow>();
  const top = rankContractors(r.zip, results);
  const photos = await env.DB.prepare("SELECT r2_key FROM quote_photos WHERE request_id = ? ORDER BY r2_key").bind(requestId).all<{ r2_key: string }>();
  const photoUrls = photos.results.map((_, i) => `${env.PUBLIC_BASE_URL}/photos/${requestId}/${i + 1}?t=${encodeURIComponent(r.photo_access_token)}`);
  const sender = createEmailSender(env);
  const now = new Date().toISOString();
  for (const c of top) {
    await sender.send({ to: c.email, kind: "contractor_lead", requestId, ...renderContractorLead(r, c, photoUrls) });
    await env.DB.prepare(`INSERT OR IGNORE INTO quote_notifications (id, request_id, contractor_id, score, distance_miles, rating_component, volume_component, proximity_component, sent_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(crypto.randomUUID(), requestId, c.id, c.score, c.distance_miles, c.rating_component, c.volume_component, c.proximity_component, now).run();
  }
  await sender.send({ to: r.email, kind: "homeowner_confirm", requestId, ...renderHomeownerConfirm(r, top.length) });
  return top;
}

async function handleVerify(url: URL, env: Env): Promise<Response> {
  const token = url.searchParams.get("token") ?? "";
  if (!token) return messagePage("Invalid link", "This confirmation link is invalid.", 400, "err");
  const hash = await sha256Hex(token);
  const r = await env.DB.prepare("SELECT id, status, category FROM quote_requests WHERE verification_token_hash = ?").bind(hash)
    .first<{ id: string; status: string; category: string }>();
  if (!r) return messagePage("Invalid link", "This confirmation link is invalid or expired.", 404, "err");
  if (r.status === "notified") return messagePage("Already sent", "Your request was already confirmed and sent to contractors.");
  // Claim atomically so double clicks don't send twice.
  const claim = await env.DB.prepare("UPDATE quote_requests SET status = 'notified', verified_at = ? WHERE id = ? AND status = 'pending'")
    .bind(new Date().toISOString(), r.id).run();
  if (!claim.meta.changes) return messagePage("Already sent", "Your request was already confirmed.");
  const top = await dispatchRequest(env, r.id);
  if (wantsJsonUrl(url)) return json({ ok: true, requestId: r.id, contractors: top.map((c) => ({ id: c.id, business_name: c.business_name, score: +c.score.toFixed(4), distance_miles: c.distance_miles, rating: c.rating, review_count: c.review_count })) });
  return messagePage("Request sent", `Your email is confirmed. Your ${esc(categoryLabel(r.category))} request was sent to <b>${top.length}</b> local contractors. They'll contact you directly.`);
}
const wantsJsonUrl = (u: URL) => u.searchParams.get("format") === "json";

async function handleSignup(req: Request, env: Env): Promise<Response> {
  const asJson = wantsJson(req);
  const form = await req.formData();
  const fail = (errors: string[], status = 400) => asJson ? json({ ok: false, errors }, status) : withStatus(signupPage(env.TURNSTILE_SITE_KEY, errors), status);
  const ip = clientIp(req);
  if (!(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, form.get("cf-turnstile-response") as string | null, ip))) return fail(["Spam check failed."], 403);
  const raw: Record<string, string | string[]> = {};
  for (const k of ["contact_name", "business_name", "email", "phone", "zip", "service_radius_miles"]) raw[k] = (form.get(k) as string) ?? "";
  raw.categories = form.getAll("categories") as string[];
  const v = validateSignup(raw);
  if (!v.ok) return fail(v.errors);
  if (!(await checkRateLimits(env.DB, SIGNUP_LIMITS(ip)))) return fail(["Too many sign-ups. Try again later."], 429);
  const c = v.value;
  const exists = await env.DB.prepare("SELECT id FROM contractors WHERE email = ?").bind(c.email).first();
  if (exists) return fail(["That email is already registered."], 409);
  const id = `c_${crypto.randomUUID()}`;
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO contractors (id, contact_name, business_name, email, phone, zip, service_radius_miles, rating, review_count, source, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 'signup', ?)`).bind(id, c.contact_name, c.business_name, c.email, c.phone, c.zip, c.service_radius_miles, new Date().toISOString()),
    ...c.categories.map((cat) => env.DB.prepare("INSERT INTO contractor_categories (contractor_id, category) VALUES (?, ?)").bind(id, cat)),
  ]);
  if (asJson) return json({ ok: true, contractorId: id }, 201);
  return messagePage("You're signed up", `Thanks, ${esc(c.business_name)}! You'll get matching quote requests by email. New sign-ups start with no rating, so ranking improves as reviews are added.`, 201);
}

async function handlePhoto(url: URL, env: Env): Promise<Response> {
  const [, , reqId, n] = url.pathname.split("/");
  const t = url.searchParams.get("t") ?? "";
  const r = await env.DB.prepare("SELECT photo_access_token, status FROM quote_requests WHERE id = ?").bind(reqId).first<{ photo_access_token: string; status: string }>();
  if (!r || r.photo_access_token !== t || r.status !== "notified") return new Response("Not found", { status: 404 });
  const obj = await env.PHOTOS.get(`requests/${reqId}/${n}`);
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, { headers: { "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream", "Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff" } });
}

async function handleOutbox(url: URL, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare("SELECT * FROM email_outbox ORDER BY created_at DESC LIMIT 200").all<Record<string, string>>();
  if (url.pathname.endsWith(".json")) return json(results);
  const id = url.searchParams.get("id");
  if (id) {
    const m = results.find((r) => r.id === id);
    return m ? new Response(m.html, { headers: { "Content-Type": "text/html; charset=utf-8" } }) : new Response("Not found", { status: 404 });
  }
  return layout("Dev outbox", `<h2>Mock email outbox (dev only, nothing was sent)</h2><table border="1" cellpadding="4"><tr><th>When</th><th>To</th><th>Kind</th><th>Subject</th></tr>
${results.map((r) => `<tr><td>${esc(r.created_at)}</td><td>${esc(r.to_address)}</td><td>${esc(r.kind)}</td><td><a href="/dev/outbox?id=${esc(r.id)}">${esc(r.subject)}</a></td></tr>`).join("")}</table>`);
}

function withStatus(r: Response, status: number) { return new Response(r.body, { status, headers: r.headers }); }

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const p = url.pathname;
    try {
      if (req.method === "GET" && p === "/") return homePage(env.TURNSTILE_SITE_KEY);
      if (req.method === "POST" && p === "/api/quote") return await handleQuote(req, env);
      if (req.method === "GET" && p === "/verify") return await handleVerify(url, env);
      if (req.method === "GET" && p === "/contractors/signup") return signupPage(env.TURNSTILE_SITE_KEY);
      if (req.method === "POST" && p === "/api/contractors") return await handleSignup(req, env);
      if (req.method === "GET" && p.startsWith("/photos/")) return await handlePhoto(url, env);
      if (req.method === "GET" && (p === "/dev/outbox" || p === "/dev/outbox.json")) {
        if (env.ENVIRONMENT !== "development") return new Response("Not found", { status: 404 });
        return await handleOutbox(url, env);
      }
      if (p === "/health") return json({ ok: true });
      return new Response("Not found", { status: 404 });
    } catch (e) {
      console.error(e);
      return new Response("Something went wrong.", { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;

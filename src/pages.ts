import { CATEGORIES } from "./categories";
import { esc } from "./html";

const css = `body{font-family:system-ui,Arial,sans-serif;max-width:720px;margin:0 auto;padding:16px;color:#222}
header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1d6b3a;margin-bottom:16px}
h1{color:#1d6b3a;font-size:1.5rem}label{display:block;margin-top:12px;font-weight:600}
input,select,textarea{width:100%;padding:8px;box-sizing:border-box;font:inherit}button{margin-top:16px;padding:10px 20px;background:#1d6b3a;color:#fff;border:0;border-radius:4px;font-size:1rem}
.err{background:#fde8e8;border:1px solid #e99;padding:8px}.ok{background:#e8f6ec;border:1px solid #8c8;padding:8px}.note{color:#666;font-size:.9rem}
.cats label{font-weight:normal;display:inline-block;margin-right:12px}.cats input{width:auto}`;

export function layout(title: string, body: string, siteKey?: string): Response {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · QuoteLocal NC</title><style>${css}</style>
${siteKey ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>' : ""}</head>
<body><header><h1><a href="/" style="color:inherit;text-decoration:none">QuoteLocal NC</a></h1><nav><a href="/contractors/signup">For contractors</a></nav></header>
${body}</body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export function homePage(siteKey: string, errors: string[] = []): Response {
  const opts = CATEGORIES.map((c) => `<option value="${c.id}">${esc(c.label)}</option>`).join("");
  return layout("Get local quotes", `
<p>Tell us about your project. After you confirm your email, we send it to up to <b>10 top-rated contractors</b> near you in North Carolina. They contact you directly. It's free, and we don't handle payments.</p>
${errors.length ? `<div class="err"><ul>${errors.map((e) => `<li>${esc(e)}</li>`).join("")}</ul></div>` : ""}
<form method="post" action="/api/quote" enctype="multipart/form-data">
<label>Your name<input name="name" required maxlength="100"></label>
<label>Email<input name="email" type="email" required></label>
<label>Phone<input name="phone" type="tel" required></label>
<label>ZIP code<input name="zip" required pattern="\\d{5}" inputmode="numeric"></label>
<label>Service needed<select name="category" required><option value="">Choose…</option>${opts}</select></label>
<label>Describe the job<textarea name="description" rows="5" required minlength="10" maxlength="4000"></textarea></label>
<label>Photos (3 to 5 required, JPEG/PNG/WebP/GIF, max 5 MB each)<input name="photos" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple required></label>
<p class="note" id="photo-note"></p>
<div class="cf-turnstile" data-sitekey="${esc(siteKey)}"></div>
<button type="submit">Get my quotes</button></form>
<script>const f=document.querySelector('input[name=photos]');f.addEventListener('change',()=>{const n=f.files.length;f.setCustomValidity(n<3||n>5?'Please choose 3 to 5 photos':'' );document.getElementById('photo-note').textContent=n+' photo(s) selected'})</script>`, siteKey);
}

export function signupPage(siteKey: string, errors: string[] = []): Response {
  const cats = CATEGORIES.map((c) => `<label><input type="checkbox" name="categories" value="${c.id}"> ${esc(c.label)}</label>`).join("");
  return layout("Contractor sign-up", `
<h2>Get local quote requests</h2><p>Free for the MVP. Requests go to the top 10 contractors by rating, review count, and distance.</p>
${errors.length ? `<div class="err"><ul>${errors.map((e) => `<li>${esc(e)}</li>`).join("")}</ul></div>` : ""}
<form method="post" action="/api/contractors">
<label>Contact name<input name="contact_name" required></label>
<label>Business name<input name="business_name" required></label>
<label>Email<input name="email" type="email" required></label>
<label>Phone<input name="phone" type="tel" required></label>
<label>Business ZIP<input name="zip" required pattern="\\d{5}"></label>
<label>Service radius (miles)<input name="service_radius_miles" type="number" min="5" max="100" value="40" required></label>
<label>Services</label><div class="cats">${cats}</div>
<div class="cf-turnstile" data-sitekey="${esc(siteKey)}"></div>
<button type="submit">Sign up</button></form>`, siteKey);
}

export function messagePage(title: string, msg: string, status = 200, cls = "ok"): Response {
  const r = layout(title, `<div class="${cls}"><p>${msg}</p></div><p><a href="/">Back to home</a></p>`);
  return new Response(r.body, { status, headers: r.headers });
}

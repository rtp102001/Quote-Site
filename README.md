# QuoteLocal NC (placeholder brand) — MVP

Homeowners in North Carolina describe a job, upload 3–5 photos, confirm their email, and the request goes to the
**top 10 contractors** for that service near their ZIP. Contractors contact the homeowner directly.
No payments, no project management.

Categories: Landscaping, HVAC, Roofing, Septic & Plumbing, Electrical.

> **Status: local only.** Not deployed. Seed contractors are **SAMPLE / FAKE** (names start with `SAMPLE:`,
> emails `@example.com`, phones `555…`). Email is a console/mock sender locally. Nothing is sent.

## Stack
Cloudflare Workers (TypeScript) · D1 (data) · R2 (photos) · Turnstile (bot check, test keys locally) ·
D1 rate limits per IP and email · email behind `EmailSender` (`console` mock, `resend`, `cloudflare`).

## Layout
```
src/index.ts        Worker router: form, /api/quote, /verify, contractor sign-up, /photos, /dev/outbox
src/pages.ts        HTML pages (home form, contractor sign-up, messages)
src/validation.ts   Form validation: 3–5 photos, image magic-byte check, 5 MB cap, NC ZIP, category
src/ranking.ts      Top-10 ranking (formula below)
src/geo.ts          ZIP lookup + haversine distance
src/email.ts        EmailSender interface, Console/Resend/Cloudflare senders, email templates
src/ratelimit.ts    D1 fixed-window rate limits
src/turnstile.ts    Server-side Turnstile siteverify
src/categories.ts   The 5 launch categories
data/nc-zips.json   Bundled NC ZIP → approx lat/lon table (~290 ZIPs, city-center approximations)
data/contractors.json, seed/contractors.sql   SAMPLE/FAKE contractors (100: 20 per category)
scripts/generate-data.mjs   Regenerates the ZIP table and sample seed
scripts/e2e.mjs     End-to-end test against wrangler dev → writes E2E_RESULTS.md
migrations/0001_init.sql    D1 schema
test/*.test.ts      Vitest unit tests
```

## Run locally
```bash
npm install
npm run db:reset        # local D1: apply migrations + load SAMPLE seed
npm run dev             # wrangler dev on http://127.0.0.1:8787
# in another terminal:
npm run e2e             # end-to-end submission, verify, top-10 check
npm test                # unit tests
```
- Form: http://127.0.0.1:8787/ · Contractor sign-up: /contractors/signup
- Mock outbox (dev only): http://127.0.0.1:8787/dev/outbox (click a subject to see the rendered email)

## Flow
1. `POST /api/quote` (multipart): Turnstile check → validation → rate limits (5/hour per IP, 3/day per email) →
   photos to R2 → request saved `pending` → verification email (token stored as SHA-256 hash).
2. `GET /verify?token=…`: atomically marks the request `notified`, ranks contractors, emails the top 10
   (reply-to = homeowner, photo links are tokenized), and sends the homeowner a confirmation. Re-clicks don't resend.

## Ranking
Only contractors in the category whose service radius covers the homeowner's ZIP (and ≤ 75 mi) are eligible.
```
rating    = ((rating*n + 4.0*10) / (n + 10)) / 5      # Bayesian: few reviews pull toward 4.0
volume    = min(1, log10(1+n) / log10(501))
proximity = max(0, 1 - miles/75)
score     = 0.50*rating + 0.20*volume + 0.30*proximity  # top 10 by score
```
New sign-ups start at 0 reviews, so they rank low until a real ratings source is wired in.

## Before deploying (not done)
- **Cloudflare:** create the D1 database (put its real `database_id` in `wrangler.toml`), R2 bucket `quotelocal-photos`,
  a Turnstile widget (real site key; secret via `wrangler secret put TURNSTILE_SECRET_KEY`), apply migrations `--remote`.
  Do **not** load `seed/contractors.sql` in production.
- **Email:** set `EMAIL_PROVIDER=resend` + `RESEND_API_KEY` secret (or `cloudflare` + URL/token), verified sender domain,
  SPF/DKIM, `EMAIL_FROM`. Set `ENVIRONMENT=production` (disables /dev/outbox) and `PUBLIC_BASE_URL`.
- **Contractor data:** a real NC source (sign-ups + vetting, licensing board lookup, or a ratings API such as Google Places)
  and a consent/opt-out process before emailing contractors.
- **Domain/brand:** pick a name and domain; add privacy policy/terms.
- **GitHub:** sign in on the box to push to `rtp102001/Quote-Site`.

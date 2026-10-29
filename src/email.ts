import { categoryLabel } from "./categories";
import { esc } from "./html";
import type { RankedContractor } from "./ranking";

export interface EmailMessage {
  to: string; replyTo?: string; subject: string; html: string; text: string;
  kind: "verify" | "contractor_lead" | "homeowner_confirm"; requestId?: string;
}
export interface EmailSender { send(msg: EmailMessage): Promise<void> }

export interface EmailEnv {
  DB: D1Database; EMAIL_PROVIDER: string; EMAIL_FROM: string;
  RESEND_API_KEY?: string; CLOUDFLARE_API_TOKEN?: string; CLOUDFLARE_EMAIL_API_URL?: string;
}

/** Local/dev sender: logs to console and stores the rendered email in D1 (viewable at /dev/outbox). Never sends. */
export class ConsoleEmailSender implements EmailSender {
  constructor(private db: D1Database) {}
  async send(m: EmailMessage) {
    console.log(`[mock-email] to=${m.to} kind=${m.kind} subject=${JSON.stringify(m.subject)}`);
    await this.db.prepare(`INSERT INTO email_outbox (id, to_address, reply_to, subject, html, text_body, kind, request_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), m.to, m.replyTo ?? null, m.subject, m.html, m.text, m.kind, m.requestId ?? null, new Date().toISOString())
      .run();
  }
}

export class ResendEmailSender implements EmailSender {
  constructor(private apiKey: string, private from: string, private fetcher: typeof fetch = fetch) {}
  async send(m: EmailMessage) {
    const res = await this.fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: this.from, to: [m.to], reply_to: m.replyTo, subject: m.subject, html: m.html, text: m.text }),
    });
    if (!res.ok) throw new Error(`Resend error ${res.status}`);
  }
}

/** Cloudflare Email Service over its REST API. URL/token configured at deploy time. */
export class CloudflareEmailSender implements EmailSender {
  constructor(private url: string, private token: string, private from: string, private fetcher: typeof fetch = fetch) {}
  async send(m: EmailMessage) {
    const res = await this.fetcher(this.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: this.from, to: m.to, reply_to: m.replyTo, subject: m.subject, html: m.html, text: m.text }),
    });
    if (!res.ok) throw new Error(`Cloudflare Email error ${res.status}`);
  }
}

export function createEmailSender(env: EmailEnv): EmailSender {
  switch (env.EMAIL_PROVIDER) {
    case "resend":
      if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY missing");
      return new ResendEmailSender(env.RESEND_API_KEY, env.EMAIL_FROM);
    case "cloudflare":
      if (!env.CLOUDFLARE_EMAIL_API_URL || !env.CLOUDFLARE_API_TOKEN) throw new Error("Cloudflare email config missing");
      return new CloudflareEmailSender(env.CLOUDFLARE_EMAIL_API_URL, env.CLOUDFLARE_API_TOKEN, env.EMAIL_FROM);
    default:
      return new ConsoleEmailSender(env.DB);
  }
}

const C = { bg: "#fbf7f0", card: "#ffffff", ink: "#2b2420", muted: "#6b5f55", line: "#e8dfd2", brand: "#2f6b4f", accent: "#d9792b", accentL: "#fbe9d7" };
const FONT = "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/** Table-based, inline-styled wrapper so it renders in Gmail/Outlook. */
const wrap = (preheader: string, body: string) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QuoteLocal</title></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:${FONT};color:${C.ink}">
<div style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td style="padding:0 4px 16px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="background:${C.brand};color:#fff;border-radius:10px;width:36px;height:36px;text-align:center;font-weight:800;font-size:18px">Q</td>
<td style="padding-left:10px;font-weight:800;font-size:18px">QuoteLocal<br><span style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${C.accent};font-weight:700">Johnston County, NC</span></td></tr></table></td></tr>
<tr><td style="background:${C.card};border:1px solid ${C.line};border-radius:16px;padding:28px 28px 24px;font-size:16px;line-height:1.6">${body}</td></tr>
<tr><td style="padding:16px 8px;color:${C.muted};font-size:12px;line-height:1.5;text-align:center">QuoteLocal connects Johnston County homeowners with local contractors. We don't handle payments or projects.</td></tr>
</table></td></tr></table></body></html>`;

const button = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr><td style="background:${C.accent};border-radius:10px">
<a href="${esc(href)}" style="display:inline-block;padding:14px 24px;color:#fff;font-weight:700;text-decoration:none;font-size:16px">${esc(label)}</a></td></tr></table>`;

export function renderVerifyEmail(p: { name: string; verifyUrl: string; categoryId: string }): Omit<EmailMessage, "to" | "kind"> {
  const cat = categoryLabel(p.categoryId);
  return {
    subject: "Confirm your QuoteLocal NC quote request",
    html: wrap(`One click to send your ${cat} request to local pros.`, `<h1 style="margin:0 0 12px;font-size:22px">Confirm your request</h1>
<p style="margin:0 0 8px">Hi ${esc(p.name)},</p><p style="margin:0">Confirm your email and we'll send your <b>${esc(cat)}</b> request to up to 10 top-rated Johnston County contractors.</p>
${button(p.verifyUrl, "Confirm & send my request")}
<p style="margin:0;color:${C.muted};font-size:13px">Button not working? Paste this link into your browser:<br><a href="${esc(p.verifyUrl)}" style="color:${C.brand};word-break:break-all">${esc(p.verifyUrl)}</a></p>
<p style="margin:16px 0 0;color:${C.muted};font-size:13px">Didn't request this? You can ignore this email.</p>`),
    text: `Hi ${p.name},\n\nConfirm your email to send your ${cat} request to up to 10 local contractors:\n${p.verifyUrl}\n\nIf you didn't request this, ignore this email.`,
  };
}

export interface LeadRequest {
  id: string; homeowner_name: string; email: string; phone: string; zip: string; category: string; description: string;
}

export function renderContractorLead(r: LeadRequest, c: RankedContractor, photoUrls: string[]): Omit<EmailMessage, "to" | "kind"> {
  const cat = categoryLabel(r.category);
  const phone = r.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  return {
    subject: `New ${cat} quote request near ${r.zip}`,
    replyTo: r.email,
    html: wrap(`${cat} job about ${c.distance_miles} miles away. Reply to the homeowner directly.`, `<p style="margin:0 0 6px"><span style="display:inline-block;background:${C.accentL};color:#8a4614;font-weight:700;font-size:12px;padding:4px 10px;border-radius:999px">NEW ${esc(cat.toUpperCase())} REQUEST</span></p>
<h1 style="margin:6px 0 8px;font-size:22px">A homeowner near ${esc(r.zip)} wants a quote</h1>
<p style="margin:0 0 16px;color:${C.muted}">Hi ${esc(c.contact_name)}, this job is about <b style="color:${C.ink}">${esc(c.distance_miles)} miles</b> from ${esc(c.business_name)}. Please reach out with a quote or ballpark.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};border-radius:12px;font-size:15px">
<tr><td style="padding:12px 16px 4px;color:${C.muted};width:80px">Name</td><td style="padding:12px 16px 4px;font-weight:700">${esc(r.homeowner_name)}</td></tr>
<tr><td style="padding:4px 16px;color:${C.muted}">Phone</td><td style="padding:4px 16px"><a href="tel:+1${esc(r.phone)}" style="color:${C.brand};font-weight:700">${esc(phone)}</a></td></tr>
<tr><td style="padding:4px 16px;color:${C.muted}">Email</td><td style="padding:4px 16px"><a href="mailto:${esc(r.email)}" style="color:${C.brand}">${esc(r.email)}</a></td></tr>
<tr><td style="padding:4px 16px 12px;color:${C.muted}">ZIP</td><td style="padding:4px 16px 12px">${esc(r.zip)}</td></tr></table>
<h2 style="margin:20px 0 6px;font-size:16px">Job description</h2>
<p style="margin:0;white-space:pre-wrap;border-left:3px solid ${C.accent};padding-left:12px">${esc(r.description)}</p>
<h2 style="margin:20px 0 6px;font-size:16px">Photos (${photoUrls.length})</h2>
<p style="margin:0">${photoUrls.map((u, i) => `<a href="${esc(u)}" style="display:inline-block;margin:0 8px 8px 0;padding:8px 14px;border:1px solid ${C.line};border-radius:8px;color:${C.brand};text-decoration:none;font-weight:600">View photo ${i + 1}</a>`).join("")}</p>
${button(`mailto:${r.email}?subject=${encodeURIComponent(`Your ${cat} quote request`)}`, "Reply to homeowner")}
<p style="margin:0;color:${C.muted};font-size:13px">You're receiving this because ${esc(c.business_name)} is listed on QuoteLocal for ${esc(cat)}. Replying to this email goes straight to the homeowner.</p>`),
    text: `New ${cat} request near ${r.zip} (~${c.distance_miles} mi)\n\nName: ${r.homeowner_name}\nEmail: ${r.email}\nPhone: ${phone}\nZIP: ${r.zip}\n\n${r.description}\n\nPhotos:\n${photoUrls.join("\n")}\n\nPlease contact the homeowner directly.`,
  };
}

export function renderHomeownerConfirm(r: LeadRequest, count: number): Omit<EmailMessage, "to" | "kind"> {
  const cat = categoryLabel(r.category);
  return {
    subject: `Your ${cat} request was sent to ${count} contractors`,
    html: wrap(`Your request went to ${count} local pros.`, `<h1 style="margin:0 0 12px;font-size:22px">Your request is on its way</h1>
<p style="margin:0 0 8px">Hi ${esc(r.homeowner_name)},</p><p style="margin:0">We sent your <b>${esc(cat)}</b> request to <b>${count}</b> top-rated contractors near ${esc(r.zip)}. They'll contact you directly by phone or email, usually within a business day.</p>
<p style="margin:16px 0 0;color:${C.muted};font-size:14px">Tip: ask each pro for a written estimate, proof of license and insurance, and references.</p>`),
    text: `Hi ${r.homeowner_name},\n\nYour request was sent to ${count} local ${cat} contractors. They'll contact you directly.`,
  };
}

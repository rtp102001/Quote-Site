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

const wrap = (body: string) =>
  `<!doctype html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222">
<h2 style="color:#1d6b3a">QuoteLocal NC</h2>${body}
<p style="color:#888;font-size:12px">QuoteLocal NC only connects homeowners and contractors. We don't handle payments or projects.</p></body></html>`;

export function renderVerifyEmail(p: { name: string; verifyUrl: string; categoryId: string }): Omit<EmailMessage, "to" | "kind"> {
  const cat = categoryLabel(p.categoryId);
  return {
    subject: "Confirm your QuoteLocal NC quote request",
    html: wrap(`<p>Hi ${esc(p.name)},</p><p>Please confirm your email to send your <b>${esc(cat)}</b> request to up to 10 top-rated local contractors.</p>
<p><a href="${esc(p.verifyUrl)}" style="background:#1d6b3a;color:#fff;padding:10px 16px;text-decoration:none;border-radius:4px">Confirm and send my request</a></p>
<p>If you didn't request this, ignore this email.</p>`),
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
    html: wrap(`<p>Hi ${esc(c.contact_name)} at ${esc(c.business_name)},</p>
<p>A homeowner about ${esc(c.distance_miles)} miles from you wants a quote or ballpark for <b>${esc(cat)}</b>. Please contact them directly.</p>
<table cellpadding="4"><tr><td><b>Name</b></td><td>${esc(r.homeowner_name)}</td></tr>
<tr><td><b>Email</b></td><td><a href="mailto:${esc(r.email)}">${esc(r.email)}</a></td></tr>
<tr><td><b>Phone</b></td><td>${esc(phone)}</td></tr><tr><td><b>ZIP</b></td><td>${esc(r.zip)}</td></tr></table>
<p><b>Description</b></p><p style="white-space:pre-wrap">${esc(r.description)}</p>
<p><b>Photos</b></p><p>${photoUrls.map((u, i) => `<a href="${esc(u)}">Photo ${i + 1}</a>`).join(" · ")}</p>`),
    text: `New ${cat} request near ${r.zip} (~${c.distance_miles} mi)\n\nName: ${r.homeowner_name}\nEmail: ${r.email}\nPhone: ${phone}\nZIP: ${r.zip}\n\n${r.description}\n\nPhotos:\n${photoUrls.join("\n")}\n\nPlease contact the homeowner directly.`,
  };
}

export function renderHomeownerConfirm(r: LeadRequest, count: number): Omit<EmailMessage, "to" | "kind"> {
  const cat = categoryLabel(r.category);
  return {
    subject: `Your ${cat} request was sent to ${count} contractors`,
    html: wrap(`<p>Hi ${esc(r.homeowner_name)},</p><p>Your request was sent to ${count} local ${esc(cat)} contractors. They'll contact you directly by phone or email.</p>`),
    text: `Hi ${r.homeowner_name},\n\nYour request was sent to ${count} local ${cat} contractors. They'll contact you directly.`,
  };
}

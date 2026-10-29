import { describe, expect, it } from "vitest";
import { createEmailSender, ConsoleEmailSender, renderContractorLead, renderVerifyEmail } from "../src/email";
import { checkRateLimits } from "../src/ratelimit";
import { verifyTurnstile } from "../src/turnstile";

/** Tiny in-memory stand-in for the D1 calls ratelimit.ts / ConsoleEmailSender use. */
function fakeDb() {
  const buckets = new Map<string, number>();
  const outbox: unknown[][] = [];
  const db: any = {
    prepare(sql: string) {
      const st: any = { args: [] as unknown[], bind(...a: unknown[]) { st.args = a; return st; },
        async first() { const c = buckets.get(`${st.args[0]}|${st.args[1]}`); return c === undefined ? null : { count: c }; },
        async run() { if (sql.startsWith("INSERT INTO email_outbox")) outbox.push(st.args); else { const k = `${st.args[0]}|${st.args[1]}`; buckets.set(k, (buckets.get(k) ?? 0) + 1); } return { meta: { changes: 1 } }; } };
      return st;
    },
    async batch(sts: any[]) { for (const s of sts) await s.run(); },
  };
  return { db, outbox };
}

describe("rate limiting", () => {
  it("allows up to the limit then blocks, per key", async () => {
    const { db } = fakeDb();
    const lim = [{ key: "quote:email:a@b.co", limit: 3, windowSeconds: 86400 }];
    const t = 1_700_000_000_000;
    for (let i = 0; i < 3; i++) expect(await checkRateLimits(db, lim, t)).toBe(true);
    expect(await checkRateLimits(db, lim, t)).toBe(false);
    expect(await checkRateLimits(db, [{ key: "quote:email:other@b.co", limit: 3, windowSeconds: 86400 }], t)).toBe(true);
    expect(await checkRateLimits(db, lim, t + 86400_000)).toBe(true); // next window
  });
});

describe("email", () => {
  it("defaults to the console mock sender and stores in outbox", async () => {
    const { db, outbox } = fakeDb();
    const s = createEmailSender({ DB: db, EMAIL_PROVIDER: "console", EMAIL_FROM: "x" });
    expect(s).toBeInstanceOf(ConsoleEmailSender);
    await s.send({ to: "a@example.com", kind: "verify", subject: "s", html: "<p>h</p>", text: "t" });
    expect(outbox).toHaveLength(1);
  });
  it("renders verify and lead emails with escaping", () => {
    const v = renderVerifyEmail({ name: "<Pat>", verifyUrl: "http://x/verify?token=abc", categoryId: "hvac" });
    expect(v.html).toContain("&lt;Pat&gt;");
    expect(v.html).toContain("http://x/verify?token=abc");
    const lead = renderContractorLead(
      { id: "r1", homeowner_name: "Pat", email: "pat@example.com", phone: "9195550123", zip: "27542", category: "septic_plumbing", description: "Alarm <beeping>" },
      { contact_name: "Al", business_name: "SAMPLE Co", distance_miles: 4.2 } as any, ["http://x/p/1", "http://x/p/2", "http://x/p/3"]);
    expect(lead.subject).toBe("New Septic & Plumbing quote request near 27542");
    expect(lead.replyTo).toBe("pat@example.com");
    expect(lead.html).toContain("(919) 555-0123");
    expect(lead.html).toContain("&lt;beeping&gt;");
    expect(lead.text).toContain("http://x/p/3");
  });
});

describe("turnstile", () => {
  it("passes token to siteverify and honors the result", async () => {
    let sent: FormData | undefined;
    const ok = (await verifyTurnstile("sec", "tok", "1.2.3.4", (async (_u: any, init: any) => { sent = init.body; return Response.json({ success: true }); }) as any));
    expect(ok).toBe(true);
    expect(sent!.get("response")).toBe("tok");
    expect(await verifyTurnstile("sec", "tok", "", (async () => Response.json({ success: false })) as any)).toBe(false);
    expect(await verifyTurnstile("sec", null, "")).toBe(false);
  });
});

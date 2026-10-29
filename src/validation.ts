import { isCategory, type CategoryId } from "./categories";
import { lookupZip } from "./geo";

export const MIN_PHOTOS = 3;
export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

export interface PhotoInput { name: string; type: string; bytes: Uint8Array }
export interface QuoteInput {
  name: string; email: string; phone: string; zip: string; category: CategoryId; description: string;
  photos: PhotoInput[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(e: string): string { return e.trim().toLowerCase(); }
export function normalizePhone(p: string): string { return p.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, ""); }

/** Detect real image type from magic bytes (don't trust the client MIME). */
export function sniffImageType(b: Uint8Array): string | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b.length >= 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "image/gif";
  if (b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  return null;
}

export function validateQuote(raw: {
  name?: string; email?: string; phone?: string; zip?: string; category?: string; description?: string;
  photos: PhotoInput[];
}): { ok: true; value: QuoteInput } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const name = (raw.name ?? "").trim();
  const email = normalizeEmail(raw.email ?? "");
  const phone = normalizePhone(raw.phone ?? "");
  const zip = (raw.zip ?? "").trim();
  const description = (raw.description ?? "").trim();
  if (name.length < 2 || name.length > 100) errors.push("Name is required (2-100 characters).");
  if (!EMAIL_RE.test(email) || email.length > 254) errors.push("A valid email is required.");
  if (phone.length !== 10) errors.push("A valid 10-digit US phone number is required.");
  if (!/^\d{5}$/.test(zip)) errors.push("ZIP must be 5 digits.");
  else if (!lookupZip(zip)) errors.push("Sorry, we only serve North Carolina ZIP codes in our coverage table right now.");
  if (!isCategory(raw.category)) errors.push("Choose a service category.");
  if (description.length < 10 || description.length > 4000) errors.push("Description is required (10-4000 characters).");
  const photos = raw.photos.filter((p) => p.bytes.length > 0);
  if (photos.length < MIN_PHOTOS || photos.length > MAX_PHOTOS) errors.push(`Upload ${MIN_PHOTOS} to ${MAX_PHOTOS} photos.`);
  for (const p of photos) {
    if (p.bytes.length > MAX_PHOTO_BYTES) errors.push(`${p.name}: photo is larger than 5 MB.`);
    const sniffed = sniffImageType(p.bytes);
    if (!sniffed || !(ALLOWED_TYPES as readonly string[]).includes(p.type) || sniffed !== p.type)
      errors.push(`${p.name}: only JPEG, PNG, WebP, or GIF images are allowed.`);
  }
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { name, email, phone, zip, category: raw.category as CategoryId, description, photos } };
}

export function validateSignup(raw: Record<string, string | string[] | undefined>) {
  const errors: string[] = [];
  const s = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string).trim() : "");
  const contact_name = s("contact_name");
  const business_name = s("business_name");
  const email = normalizeEmail(s("email"));
  const phone = normalizePhone(s("phone"));
  const zip = s("zip");
  const radius = Number(s("service_radius_miles"));
  const cats = (Array.isArray(raw.categories) ? raw.categories : raw.categories ? [raw.categories] : []) as string[];
  if (contact_name.length < 2 || contact_name.length > 100) errors.push("Contact name is required.");
  if (business_name.length < 2 || business_name.length > 150) errors.push("Business name is required.");
  if (!EMAIL_RE.test(email)) errors.push("A valid email is required.");
  if (phone.length !== 10) errors.push("A valid 10-digit phone number is required.");
  if (!lookupZip(zip)) errors.push("A North Carolina ZIP in our coverage table is required.");
  if (!Number.isFinite(radius) || radius < 5 || radius > 100) errors.push("Service radius must be 5-100 miles.");
  if (cats.length === 0 || !cats.every(isCategory)) errors.push("Choose at least one valid category.");
  if (errors.length) return { ok: false as const, errors };
  return { ok: true as const, value: { contact_name, business_name, email, phone, zip, service_radius_miles: radius, categories: [...new Set(cats)] as CategoryId[] } };
}

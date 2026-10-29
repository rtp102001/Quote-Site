export const CATEGORIES = [
  { id: "landscaping", label: "Landscaping" },
  { id: "hvac", label: "HVAC" },
  { id: "roofing", label: "Roofing" },
  { id: "septic_plumbing", label: "Septic & Plumbing" },
  { id: "electrical", label: "Electrical" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function isCategory(v: unknown): v is CategoryId {
  return typeof v === "string" && CATEGORIES.some((c) => c.id === v);
}

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

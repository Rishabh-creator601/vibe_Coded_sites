import type { Diet } from "@saffron/shared";

const COLOR: Record<Diet, string> = {
  veg: "var(--color-leaf)",
  vegan: "var(--color-leaf)",
  egg: "var(--color-yolk)",
  nonVeg: "var(--color-chili)",
};

/** The Indian food-label mark: a square outline with a dot (veg) or a triangle (non-veg). */
export function DietMark({ diet, label, size = 16 }: { diet: Diet; label: string; size?: number }) {
  const color = COLOR[diet];
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="shrink-0" {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}>
      {label && <title>{label}</title>}
      <rect x="1" y="1" width="14" height="14" rx="2" fill="#fff" stroke={color} strokeWidth="1.6" />
      {diet === "nonVeg" ? <path d="M8 4.2 12 11.4H4z" fill={color} /> : <circle cx="8" cy="8" r="3.6" fill={color} />}
    </svg>
  );
}

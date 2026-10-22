/** Indian mobile number: 10 digits starting 6–9, with an optional +91 or 0 in front. */
export function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

export function isEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw.trim());
}

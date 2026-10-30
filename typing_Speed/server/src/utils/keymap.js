// Mongo map keys can't contain "." or start with "$", so per-key stats are stored as "k<codepoint>".
export const encodeKeys = (obj = {}) =>
  Object.fromEntries(
    Object.entries(obj)
      .filter(([k]) => k.length > 0)
      .map(([k, v]) => [`k${k.codePointAt(0)}`, v]),
  );

export const decodeKeys = (obj) => {
  const entries = obj instanceof Map ? [...obj.entries()] : Object.entries(obj || {});
  return Object.fromEntries(entries.map(([k, v]) => [String.fromCodePoint(Number(k.slice(1))), v]));
};

/** Add `src` (decoded) into `dst` (decoded), key by key. */
export const mergeCounts = (dst, src) => {
  for (const [k, v] of Object.entries(src)) dst[k] = (dst[k] || 0) + v;
  return dst;
};

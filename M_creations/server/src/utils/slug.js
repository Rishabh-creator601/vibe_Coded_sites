export function slugify(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item'
  );
}

/** Returns a slug no document in `Model` uses yet: "boat-neck", "boat-neck-2", ... */
export async function uniqueSlug(Model, text) {
  const base = slugify(text);
  let slug = base;
  for (let n = 2; await Model.exists({ slug }); n += 1) slug = `${base}-${n}`;
  return slug;
}

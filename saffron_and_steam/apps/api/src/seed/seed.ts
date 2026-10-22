import { demoCategories, demoMenu, demoSettings } from "@saffron/shared";
import { trusted } from "mongoose";
import { CategoryModel, MenuItemModel, SettingsModel } from "../models/menu";

/**
 * Loads the sample menu (61 dishes), categories and café settings from
 * packages/shared. Existing dishes are replaced by slug; orders and bookings are kept.
 */
export async function seedCatalog(): Promise<{ items: number; categories: number }> {
  await CategoryModel.bulkWrite(
    demoCategories.map((c) => ({ replaceOne: { filter: { slug: c.slug }, replacement: c, upsert: true } })),
  );
  await MenuItemModel.bulkWrite(
    demoMenu.map((item) => ({ replaceOne: { filter: { slug: item.slug }, replacement: item, upsert: true } })),
  );
  // `trusted` lets this one operator through the global sanitizeFilter (db.ts).
  await MenuItemModel.deleteMany({ slug: trusted({ $nin: demoMenu.map((i) => i.slug) }) });
  await SettingsModel.replaceOne({ _id: "cafe" }, { value: demoSettings }, { upsert: true });
  return { items: demoMenu.length, categories: demoCategories.length };
}

/** Seeds only when the database has no menu yet (AUTO_SEED on start-up). */
export async function seedIfEmpty(): Promise<boolean> {
  const [items, settings] = await Promise.all([MenuItemModel.estimatedDocumentCount(), SettingsModel.exists({ _id: "cafe" })]);
  if (items > 0 && settings) return false;
  await seedCatalog();
  return true;
}

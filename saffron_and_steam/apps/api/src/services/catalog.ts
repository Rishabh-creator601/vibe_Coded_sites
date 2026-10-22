import type { CafeSettings, Category, MenuItem } from "@saffron/shared";
import { CategoryModel, MenuItemModel, SettingsModel } from "../models/menu";

// Menu and settings are read fresh on every request: the menu is small (about 60
// dishes), and admin edits will then show up straight away.

const HIDDEN = { _id: 0, __v: 0 } as const;

export async function loadMenu(): Promise<MenuItem[]> {
  return MenuItemModel.find({}, HIDDEN).sort({ sortOrder: 1 }).lean<MenuItem[]>();
}

export async function loadCategories(): Promise<Category[]> {
  return CategoryModel.find({}, HIDDEN).sort({ sortOrder: 1 }).lean<Category[]>();
}

export async function loadSettings(): Promise<CafeSettings> {
  const doc = await SettingsModel.findById("cafe").lean();
  if (!doc) throw new Error("Café settings are missing. Run `npm run seed -w api`.");
  return doc.value;
}

import { model, Schema } from "mongoose";
import { CUISINES, type CafeSettings, type Category, type MenuItem } from "@saffron/shared";
import { localizedSchema } from "./common";

const categorySchema = new Schema<Category>({
  slug: { type: String, required: true, unique: true },
  name: { type: localizedSchema, required: true },
  mealPeriod: { type: String, enum: ["breakfast", "lunch", "dinner", "allDay"], required: true },
  sortOrder: { type: Number, default: 0 },
});

const menuItemSchema = new Schema<MenuItem>({
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  cuisine: { type: String, enum: CUISINES, required: true },
  name: { type: localizedSchema, required: true },
  description: { type: localizedSchema, required: true },
  price: { type: Number, required: true, min: 0 },
  images: [
    new Schema(
      {
        url: { type: String, required: true },
        alt: { type: localizedSchema, required: true },
        credit: new Schema({ author: String, license: String, source: String, href: String }, { _id: false }),
      },
      { _id: false },
    ),
  ],
  availableIn: [{ type: String, enum: ["breakfast", "lunch", "dinner", "allDay"] }],
  diet: { type: String, enum: ["veg", "nonVeg", "vegan", "egg"], required: true },
  tags: [String],
  allergens: [String],
  spiceLevel: { type: Number, min: 0, max: 3, default: 0 },
  variants: [new Schema({ name: { type: localizedSchema, required: true }, priceDelta: { type: Number, required: true } }, { _id: false })],
  addOns: [new Schema({ name: { type: localizedSchema, required: true }, price: { type: Number, required: true } }, { _id: false })],
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
});
menuItemSchema.index({ category: 1, sortOrder: 1 });
menuItemSchema.index({ isFeatured: 1 });

/**
 * The café settings are one document (PLAN.md section 7). The value is checked by the
 * seed data's types now, and by the admin settings form's Zod schema once that exists.
 */
const settingsSchema = new Schema<{ _id: string; value: CafeSettings }>({
  _id: { type: String, default: "cafe" },
  value: { type: Schema.Types.Mixed, required: true },
});

export const CategoryModel = model("Category", categorySchema);
export const MenuItemModel = model("MenuItem", menuItemSchema);
export const SettingsModel = model("Settings", settingsSchema);

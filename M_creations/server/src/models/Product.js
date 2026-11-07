import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    description: { type: String, default: '' },
    // Null until the owner sets it; the site then shows "Rate coming soon".
    rate: { type: Number, default: null, min: 0 },
    colors: {
      type: [{ _id: false, name: { type: String, required: true }, hex: { type: String, required: true } }],
      default: [],
    },
    images: {
      type: [{ _id: false, url: { type: String, required: true }, publicId: { type: String, default: '' } }],
      default: [],
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);

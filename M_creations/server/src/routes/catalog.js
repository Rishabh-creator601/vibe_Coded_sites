import { Router } from 'express';
import { z } from 'zod';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { HttpError } from '../middleware/errors.js';

export const catalogRoutes = Router();

const listSchema = z.object({
  category: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(24),
});

catalogRoutes.get('/categories', async (_req, res) => {
  const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
  const counts = await Product.aggregate([
    { $match: { active: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countById = new Map(counts.map((c) => [String(c._id), c.count]));
  res.json({
    categories: categories.map((c) => ({
      id: String(c._id),
      name: c.name,
      slug: c.slug,
      parent: c.parent ? String(c.parent) : null,
      count: countById.get(String(c._id)) ?? 0,
    })),
  });
});

catalogRoutes.get('/products', async (req, res) => {
  const { category, page, limit } = listSchema.parse(req.query);
  const filter = { active: true };

  if (category) {
    const found = await Category.findOne({ slug: category }).lean();
    if (!found) throw new HttpError(404, 'This category does not exist.');
    // A parent category such as Stitching also lists its subcategories' pieces.
    const children = await Category.find({ parent: found._id }).select('_id').lean();
    filter.category = { $in: [found._id, ...children.map((c) => c._id)] };
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('category', 'name slug')
      .lean(),
    Product.countDocuments(filter),
  ]);
  res.json({ products: products.map(serializeProduct), total, page, pages: Math.ceil(total / limit) });
});

catalogRoutes.get('/products/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, active: true })
    .populate('category', 'name slug')
    .lean();
  if (!product) throw new HttpError(404, 'This piece is not in the catalog.');
  res.json({ product: serializeProduct(product) });
});

export function serializeProduct(p) {
  return {
    id: String(p._id),
    name: p.name,
    slug: p.slug,
    description: p.description,
    rate: p.rate,
    colors: p.colors,
    images: p.images.map(({ url, publicId }) => ({ url, publicId })),
    active: p.active,
    category: p.category?.slug
      ? { id: String(p.category._id), name: p.category.name, slug: p.category.slug }
      : null,
  };
}

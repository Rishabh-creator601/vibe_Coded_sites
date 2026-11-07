import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { HttpError } from '../middleware/errors.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { deleteImage, IMAGE_TYPES, saveImage } from '../services/images.js';
import { uniqueSlug } from '../utils/slug.js';
import { serializeProduct } from './catalog.js';

export const adminRoutes = Router();
adminRoutes.use(requireAuth, requireAdmin);

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Choose a valid option');

const productSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name').max(120),
  category: objectId,
  description: z.string().trim().max(2000).default(''),
  rate: z.number().min(0, 'Rate cannot be negative').max(10_000_000).nullable().default(null),
  rateType: z.enum(['exact', 'from', 'under']).default('exact'),
  colors: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Name each colour').max(40),
        hex: z.string().regex(/^#[0-9a-f]{6}$/i, 'Choose a colour'),
      })
    )
    .max(20)
    .default([]),
  images: z
    .array(
      z.object({
        url: z.string().regex(/^(https:\/\/|\/uploads\/)/, 'Upload the image again').max(500),
        publicId: z.string().max(300).default(''),
      })
    )
    .max(8, 'Add up to 8 photos')
    .default([]),
  active: z.boolean().default(true),
});

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Enter a name').max(60),
  parent: objectId.nullable().default(null),
});

async function assertCategoryExists(id) {
  if (!(await Category.exists({ _id: id }))) throw new HttpError(400, 'Choose a category that still exists.');
}

async function findProduct(id) {
  const product = objectId.safeParse(id).success ? await Product.findById(id) : null;
  if (!product) throw new HttpError(404, 'This piece no longer exists.');
  return product;
}

adminRoutes.get('/stats', async (_req, res) => {
  const [pieces, missingPhoto, missingRate, hidden, customers] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ images: { $size: 0 } }),
    Product.countDocuments({ rate: null }),
    Product.countDocuments({ active: false }),
    User.countDocuments({ role: 'customer' }),
  ]);
  res.json({ pieces, missingPhoto, missingRate, hidden, customers });
});

adminRoutes.get('/products', async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1, _id: 1 }).populate('category', 'name slug').lean();
  res.json({ products: products.map(serializeProduct) });
});

adminRoutes.get('/products/:id', async (req, res) => {
  const product = await findProduct(req.params.id);
  await product.populate('category', 'name slug');
  res.json({ product: serializeProduct(product.toObject()) });
});

adminRoutes.post('/products', async (req, res) => {
  const body = productSchema.parse(req.body);
  await assertCategoryExists(body.category);
  const product = await Product.create({ ...body, slug: await uniqueSlug(Product, body.name) });
  await product.populate('category', 'name slug');
  res.status(201).json({ product: serializeProduct(product.toObject()) });
});

adminRoutes.put('/products/:id', async (req, res) => {
  const body = productSchema.parse(req.body);
  await assertCategoryExists(body.category);
  const product = await findProduct(req.params.id);

  const kept = new Set(body.images.map((image) => image.url));
  const removed = product.images.filter((image) => !kept.has(image.url)).map((i) => i.toObject());

  product.set(body);
  await product.save();
  await Promise.all(removed.map(deleteImage));

  await product.populate('category', 'name slug');
  res.json({ product: serializeProduct(product.toObject()) });
});

adminRoutes.delete('/products/:id', async (req, res) => {
  const product = await findProduct(req.params.id);
  await product.deleteOne();
  await Promise.all(product.images.map((image) => deleteImage(image.toObject())));
  res.json({ ok: true });
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (IMAGE_TYPES[file.mimetype]) return cb(null, true);
    cb(new HttpError(400, 'Choose a JPG, PNG or WebP image.'));
  },
});

adminRoutes.post('/uploads', upload.single('image'), async (req, res) => {
  if (!req.file) throw new HttpError(400, 'Choose an image to upload.');
  res.status(201).json({ image: await saveImage(req.file) });
});

adminRoutes.post('/categories', async (req, res) => {
  const body = categorySchema.parse(req.body);
  if (body.parent) await assertCategoryExists(body.parent);
  const order = await Category.countDocuments({ parent: body.parent });
  const category = await Category.create({ ...body, order, slug: await uniqueSlug(Category, body.name) });
  res.status(201).json({ category: { id: category.id, name: category.name, slug: category.slug } });
});

adminRoutes.put('/categories/:id', async (req, res) => {
  const { name } = categorySchema.pick({ name: true }).parse(req.body);
  const category = objectId.safeParse(req.params.id).success ? await Category.findById(req.params.id) : null;
  if (!category) throw new HttpError(404, 'This category no longer exists.');
  category.name = name;
  await category.save();
  res.json({ category: { id: category.id, name: category.name, slug: category.slug } });
});

adminRoutes.delete('/categories/:id', async (req, res) => {
  const id = objectId.parse(req.params.id);
  if (await Product.exists({ category: id })) {
    throw new HttpError(409, 'Move or delete the pieces in this category first.');
  }
  if (await Category.exists({ parent: id })) {
    throw new HttpError(409, 'Delete the subcategories in this category first.');
  }
  await Category.deleteOne({ _id: id });
  res.json({ ok: true });
});

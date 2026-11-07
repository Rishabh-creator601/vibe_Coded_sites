// Safe to run repeatedly: it only fills empty collections, so it never brings
// back slots the owner deleted or overwrites anything she has edited.
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { config } from './config.js';
import { Category } from './models/Category.js';
import { Product } from './models/Product.js';
import { User } from './models/User.js';
import { slugify } from './utils/slug.js';

const COLORS = {
  rani: { name: 'Rani pink', hex: '#B5125F' },
  peacock: { name: 'Peacock blue', hex: '#0B4F56' },
  marigold: { name: 'Marigold', hex: '#F0A316' },
  maroon: { name: 'Maroon', hex: '#6E1423' },
  parrot: { name: 'Parrot green', hex: '#3F7D20' },
  royal: { name: 'Royal blue', hex: '#1F3C88' },
  aubergine: { name: 'Aubergine', hex: '#3D1239' },
  ivory: { name: 'Ivory', hex: '#F7EFE2' },
};
const { rani, peacock, marigold, maroon, parrot, royal, aubergine, ivory } = COLORS;

// Sample slots: rate, photos and description are left empty for the owner.
const SLOTS = {
  blouses: [
    ['Sweetheart neck blouse', [rani, maroon]],
    ['Boat neck blouse', [peacock, marigold]],
    ['Round neck blouse', [marigold, rani]],
    ['V neck blouse', [maroon, ivory]],
    ['Princess cut blouse', [royal, rani]],
    ['Puff sleeve blouse', [parrot, marigold]],
  ],
  'krishna-dresses': [
    ['Peacock blue Krishna dress', [peacock, marigold]],
    ['Yellow Krishna dress', [marigold, rani]],
    ['Janmashtami Krishna dress', [royal, marigold]],
    ['Zari work Krishna dress', [maroon, marigold]],
  ],
  'ready-made': [
    ['Cotton kurti', [aubergine, ivory]],
    ['Anarkali suit', [rani, marigold]],
    ['Festive kurti set', [parrot, ivory]],
    ['Everyday kurti', [ivory, royal]],
  ],
};

async function seedCategories() {
  if (await Category.exists({})) return;
  const stitching = await Category.create({ name: 'Stitching', slug: 'stitching', order: 0 });
  await Category.create([
    { name: 'Blouses', slug: 'blouses', parent: stitching._id, order: 0 },
    { name: 'Lord Krishna dresses', slug: 'krishna-dresses', parent: stitching._id, order: 1 },
    { name: 'Ready-made items', slug: 'ready-made', order: 1 },
  ]);
  console.log('Added categories.');
}

async function seedSlots() {
  // Placeholders are for trying the site locally; the live catalog shows only real pieces.
  if (config.isProd || (await Product.exists({}))) return;
  const categories = await Category.find({ slug: { $in: Object.keys(SLOTS) } });
  const queues = categories.map((category) => ({ category, slots: [...SLOTS[category.slug]] }));

  // Take one slot from each category in turn and give each an older date, so
  // the newest-first catalog opens with a mix of categories.
  const docs = [];
  const now = Date.now();
  while (queues.some((queue) => queue.slots.length)) {
    for (const { category, slots } of queues) {
      if (!slots.length) continue;
      const [name, colors] = slots.shift();
      docs.push({
        name,
        slug: slugify(name),
        category: category._id,
        colors,
        createdAt: new Date(now - docs.length * 1000),
      });
    }
  }
  await Product.create(docs);
  console.log('Added sample slots.');
}

async function seedAdmin() {
  const { adminEmail, adminPassword } = config;
  if (!adminEmail || !adminPassword) {
    console.log('ADMIN_EMAIL or ADMIN_PASSWORD is not set, so no admin account was created.');
    return;
  }
  const email = adminEmail.toLowerCase();
  if (await User.exists({ email })) return;
  await User.create({
    name: 'M Creations',
    email,
    passwordHash: await bcrypt.hash(adminPassword, 12),
    role: 'admin',
  });
  console.log(`Created the admin account ${email}.`);
}

await mongoose.connect(config.mongoUri);
await seedCategories();
await seedSlots();
await seedAdmin();
await mongoose.disconnect();

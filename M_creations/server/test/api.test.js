// Needs MongoDB running locally. Uses its own throwaway database.
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { Category } from '../src/models/Category.js';
import { Product } from '../src/models/Product.js';
import { User } from '../src/models/User.js';

const DB = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/m_creations_test';
let server;
let base;
let adminCookie;
let stitching;
let blouses;

async function call(path, { method = 'GET', body, cookie } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.get('set-cookie');
  return {
    status: res.status,
    json: await res.json(),
    cookie: setCookie ? setCookie.split(';')[0] : null,
    rawCookie: setCookie,
  };
}

before(async () => {
  await mongoose.connect(DB, { serverSelectionTimeoutMS: 3000 });
  await mongoose.connection.dropDatabase();
  stitching = await Category.create({ name: 'Stitching', slug: 'stitching' });
  blouses = await Category.create({ name: 'Blouses', slug: 'blouses', parent: stitching._id });
  await User.create({
    name: 'Owner',
    email: 'owner@test.local',
    passwordHash: await bcrypt.hash('owner-password', 4),
    role: 'admin',
  });
  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
  adminCookie = (await call('/api/auth/login', {
    method: 'POST',
    body: { email: 'owner@test.local', password: 'owner-password' },
  })).cookie;
});

after(async () => {
  server?.close();
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test('anyone can read the catalog, and parents include subcategory pieces', async () => {
  await Product.create({ name: 'Boat neck', slug: 'boat-neck', category: blouses._id });
  const res = await call('/api/products?category=stitching');
  assert.equal(res.status, 200);
  assert.deepEqual(res.json.products.map((p) => p.slug), ['boat-neck']);
  assert.equal(res.json.products[0].rate, null);
  assert.equal((await call('/api/products/boat-neck')).status, 200);
  assert.equal((await call('/api/products?category=nope')).status, 404);
});

test('hidden pieces do not appear publicly', async () => {
  await Product.create({ name: 'Hidden', slug: 'hidden', category: blouses._id, active: false });
  assert.equal((await call('/api/products/hidden')).status, 404);
  const list = await call('/api/products');
  assert.ok(!list.json.products.some((p) => p.slug === 'hidden'));
});

test('register, read session, and log out', async () => {
  const reg = await call('/api/auth/register', {
    method: 'POST',
    body: { name: 'Asha', email: 'ASHA@test.local', password: 'long-enough' },
  });
  assert.equal(reg.status, 201);
  assert.equal(reg.json.user.email, 'asha@test.local');
  assert.equal(reg.json.user.role, 'customer');
  assert.equal(reg.json.user.passwordHash, undefined);
  assert.match(reg.rawCookie, /HttpOnly/);

  const me = await call('/api/auth/me', { cookie: reg.cookie });
  assert.equal(me.json.user.name, 'Asha');

  assert.equal((await call('/api/auth/me')).status, 401);
  const duplicate = await call('/api/auth/register', {
    method: 'POST',
    body: { name: 'Asha', email: 'asha@test.local', password: 'long-enough' },
  });
  assert.equal(duplicate.status, 409);
});

test('a role sent at sign-up is ignored, and login rejects bad input', async () => {
  const reg = await call('/api/auth/register', {
    method: 'POST',
    body: { name: 'Eve', email: 'eve@test.local', password: 'long-enough', role: 'admin' },
  });
  assert.equal(reg.json.user.role, 'customer');

  const wrong = await call('/api/auth/login', {
    method: 'POST',
    body: { email: 'eve@test.local', password: 'wrong-password' },
  });
  assert.equal(wrong.status, 401);

  const injection = await call('/api/auth/login', {
    method: 'POST',
    body: { email: { $ne: null }, password: { $ne: null } },
  });
  assert.equal(injection.status, 400);
});

test('google login reports when it is not configured', async () => {
  const res = await call('/api/auth/google', { method: 'POST', body: { credential: 'x' } });
  assert.equal(res.status, 503);
});

test('admin routes reject guests and customers', async () => {
  assert.equal((await call('/api/admin/products')).status, 401);
  const customer = await call('/api/auth/login', {
    method: 'POST',
    body: { email: 'eve@test.local', password: 'long-enough' },
  });
  assert.equal((await call('/api/admin/stats', { cookie: customer.cookie })).status, 403);
  const attempt = await call('/api/admin/products', {
    method: 'POST',
    cookie: customer.cookie,
    body: { name: 'Nope', category: String(blouses._id) },
  });
  assert.equal(attempt.status, 403);
});

test('admin can create, edit and delete a piece', async () => {
  const body = {
    name: 'Boat neck',
    category: String(blouses._id),
    description: 'Silk',
    rate: 850,
    colors: [{ name: 'Rani pink', hex: '#B5125F' }],
    images: [],
    active: true,
  };
  const created = await call('/api/admin/products', { method: 'POST', body, cookie: adminCookie });
  assert.equal(created.status, 201);
  // "boat-neck" is already taken by an earlier test.
  assert.equal(created.json.product.slug, 'boat-neck-2');

  const updated = await call(`/api/admin/products/${created.json.product.id}`, {
    method: 'PUT',
    body: { ...body, name: 'Renamed', rate: null },
    cookie: adminCookie,
  });
  assert.equal(updated.json.product.name, 'Renamed');
  assert.equal(updated.json.product.rate, null);
  assert.equal(updated.json.product.slug, 'boat-neck-2');

  const deleted = await call(`/api/admin/products/${created.json.product.id}`, {
    method: 'DELETE',
    cookie: adminCookie,
  });
  assert.equal(deleted.status, 200);
  assert.equal((await call('/api/products/boat-neck-2')).status, 404);
});

test('product validation rejects bad colours and unsafe image links', async () => {
  const base = { name: 'X', category: String(blouses._id) };
  const badColor = await call('/api/admin/products', {
    method: 'POST',
    cookie: adminCookie,
    body: { ...base, colors: [{ name: 'Red', hex: 'url(evil)' }] },
  });
  assert.equal(badColor.status, 400);
  const badImage = await call('/api/admin/products', {
    method: 'POST',
    cookie: adminCookie,
    body: { ...base, images: [{ url: 'javascript:alert(1)' }] },
  });
  assert.equal(badImage.status, 400);
});

test('a category in use cannot be deleted', async () => {
  const withProducts = await call(`/api/admin/categories/${blouses._id}`, { method: 'DELETE', cookie: adminCookie });
  assert.equal(withProducts.status, 409);
  const withChildren = await call(`/api/admin/categories/${stitching._id}`, { method: 'DELETE', cookie: adminCookie });
  assert.equal(withChildren.status, 409);

  const added = await call('/api/admin/categories', { method: 'POST', cookie: adminCookie, body: { name: 'Lehengas' } });
  assert.equal(added.status, 201);
  const removed = await call(`/api/admin/categories/${added.json.category.id}`, { method: 'DELETE', cookie: adminCookie });
  assert.equal(removed.status, 200);
});

test('upload rejects files that are not images', async () => {
  const form = new FormData();
  form.append('image', new Blob(['<svg/>'], { type: 'image/svg+xml' }), 'x.svg');
  const res = await fetch(`${base}/api/admin/uploads`, { method: 'POST', body: form, headers: { cookie: adminCookie } });
  assert.equal(res.status, 400);
});

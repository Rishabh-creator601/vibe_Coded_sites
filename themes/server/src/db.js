import mongoose from 'mongoose';
import { readFileSync } from 'node:fs';
import { Content } from './models/Content.js';

const RETRY_MS = 15_000;

// Fail queries immediately while disconnected, so the API can answer "offline" at once.
mongoose.set('bufferCommands', false);

export const seedContent = JSON.parse(
  readFileSync(new URL('../data/content.json', import.meta.url), 'utf8'),
);

export const isConnected = () => mongoose.connection.readyState === 1;

export async function connect(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
  await mongoose.connection.syncIndexes();
  // Only fills an empty database. Run `npm run seed` to overwrite edited content.
  await Content.updateOne({ key: 'home' }, { $setOnInsert: { data: seedContent } }, { upsert: true });
}

/** Keeps trying in the background, so the API works from the moment MongoDB comes up. */
export function connectWithRetry(uri) {
  connect(uri)
    .then(() => console.log('MongoDB connected'))
    .catch((error) => {
      console.warn(`MongoDB unavailable (${error.message}). Serving seed content, retrying in 15s.`);
      setTimeout(() => connectWithRetry(uri), RETRY_MS);
    });
}

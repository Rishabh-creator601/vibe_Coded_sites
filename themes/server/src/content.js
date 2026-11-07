import { isConnected, seedContent } from './db.js';
import { Content } from './models/Content.js';

/** Stored content when MongoDB is reachable, otherwise the bundled seed. */
export async function loadContent() {
  if (!isConnected()) return seedContent;
  try {
    const doc = await Content.findOne({ key: 'home' }).lean();
    return doc?.data ?? seedContent;
  } catch (error) {
    console.warn(`Could not read content: ${error.message}`);
    return seedContent;
  }
}

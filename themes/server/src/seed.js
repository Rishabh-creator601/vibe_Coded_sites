// Overwrites the stored page content with data/content.json. Reservations are not touched.
import './env.js';
import mongoose from 'mongoose';
import { connect, seedContent } from './db.js';
import { Content } from './models/Content.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/odd-hour';

await connect(MONGODB_URI);
await Content.updateOne({ key: 'home' }, { $set: { data: seedContent } }, { upsert: true });
console.log('Content seeded.');
await mongoose.disconnect();

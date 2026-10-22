// Cached MongoDB connection.
//
// In a serverless environment (Vercel) the same container may handle many
// requests, and creating a new connection per invocation exhausts the DB's
// connection pool. We cache the connection promise on `globalThis` so it is
// reused across invocations within a warm container.

import mongoose from 'mongoose';

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/calorie-tracker';

let cached = globalThis._mongoose;
if (!cached) {
  cached = globalThis._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGO_URI || DEFAULT_URI;
    cached.promise = mongoose.connect(uri).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // allow a retry on the next request
    throw err;
  }
  return cached.conn;
}

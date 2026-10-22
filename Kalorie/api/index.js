// Vercel serverless entry point for the API.
//
// Every request matching the "/api/(.*)" rewrite in vercel.json is routed
// here. We make sure MongoDB is connected (using the cached connection), then
// hand the request to the same Express app used in local development.
//
// On Vercel, environment variables come from the project settings, so no
// .env loading is needed here.

import app from '../server/src/app.js';
import { connectDB } from '../server/src/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('✗ MongoDB connection failed:', err.message);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Database unavailable' }));
    return;
  }
  return app(req, res);
}

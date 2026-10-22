// Local development entry point: load env, connect to MongoDB, and start the
// HTTP server. On Vercel this file is NOT used — requests go through the
// serverless handler at /api/index.js instead (which imports the same app).

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load the server's own .env, then the project-root .env for shared secrets
// (e.g. GEMINI_API_KEY). dotenv does not override already-set vars, so the
// server/.env values take precedence where they overlap.
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { default: app } = await import('./app.js');
const { connectDB } = await import('./db.js');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log('✓ Connected to MongoDB');
    app.listen(PORT, () => console.log(`✓ API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('✗ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// The Express app (middleware + routes) with no server bootstrapping.
// This is shared by the local dev entry point (index.js, which calls
// app.listen) and the Vercel serverless handler (../../api/index.js, which
// hands each request to this app). Keep all process.listen / DB connection
// logic out of here.

import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import entryRoutes from './routes/entries.js';
import foodRoutes from './routes/foods.js';
import contactRoutes from './routes/contact.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '5mb' })); // room for base64 profile pictures

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/contact', contactRoutes);

export default app;

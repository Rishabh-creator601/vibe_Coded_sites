import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errors.js';
import { authRoutes } from './routes/auth.js';
import { catalogRoutes } from './routes/catalog.js';
import { adminRoutes } from './routes/admin.js';
import { UPLOAD_DIR } from './services/images.js';

export function createApp() {
  const app = express();

  // Locally the only proxy is the Next.js rewrite. Live, a request passes through Vercel and then
  // Render's proxy, so the visitor's address is two hops back. Trusting only one hop would make
  // every visitor look like Vercel and share one login rate limit.
  app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS) || 1);
  app.use(helmet());
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));
  app.use('/api/auth', authRoutes);
  app.use('/api', catalogRoutes);
  app.use('/api/admin', adminRoutes);

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));
  app.use(errorHandler);
  return app;
}

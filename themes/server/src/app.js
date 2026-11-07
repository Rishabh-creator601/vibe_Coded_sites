import express from 'express';
import helmet from 'helmet';
import { isConnected } from './db.js';
import { contentRouter } from './routes/content.js';
import { reservationsRouter } from './routes/reservations.js';

export function createApp() {
  const app = express();

  // Next.js proxies /api here, so the visitor's address is in X-Forwarded-For.
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, database: isConnected() ? 'connected' : 'offline' });
  });
  app.use('/api', contentRouter);
  app.use('/api', reservationsRouter);

  app.use('/api', (_req, res) => {
    res.status(404).json({ message: 'No such API route.' });
  });

  app.use((error, _req, res, _next) => {
    if (error.type === 'entity.parse.failed' || error.type === 'entity.too.large') {
      return res.status(400).json({ message: 'The request could not be read.' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong on the server. Try again.' });
  });

  return app;
}

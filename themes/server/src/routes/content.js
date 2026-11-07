import { Router } from 'express';
import { nextRoastDate } from '../batch.js';
import { loadContent } from '../content.js';
import { isConnected } from '../db.js';
import { Reservation } from '../models/Reservation.js';

export const contentRouter = Router();

contentRouter.get('/content', async (_req, res) => {
  const content = await loadContent();
  const batchDate = nextRoastDate();

  // null means "unknown", which the page shows by leaving the count out.
  let bagsLeft = null;
  if (isConnected()) {
    try {
      const reserved = await Reservation.countDocuments({ batchDate });
      bagsLeft = Math.max(content.batch.bags - reserved, 0);
    } catch (error) {
      console.warn(`Could not count reservations: ${error.message}`);
    }
  }

  res.set('Cache-Control', 'no-store');
  res.json({ ...content, batch: { ...content.batch, nextRoast: batchDate.toISOString(), bagsLeft } });
});

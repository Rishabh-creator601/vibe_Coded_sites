import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { nextRoastDate } from '../batch.js';
import { loadContent } from '../content.js';
import { isConnected } from '../db.js';
import { Reservation } from '../models/Reservation.js';
import { validateReservation } from '../validate.js';

const DUPLICATE_KEY = 11000;

// No 0/O or 1/I, so the code reads clearly on a printed receipt.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const makeCode = () =>
  `OH-${Array.from(randomBytes(5), (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('')}`;

export const reservationsRouter = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many reservations from this connection. Try again in 15 minutes.' },
});

reservationsRouter.post('/reservations', limiter, async (req, res) => {
  const content = await loadContent();
  const { value, errors, valid } = validateReservation(req.body, content);
  if (!valid) {
    return res.status(400).json({ message: 'Check the highlighted fields.', errors });
  }

  if (!isConnected()) {
    return res.status(503).json({
      message: 'Reservations are offline, so nothing was saved. Try again in a few minutes.',
    });
  }

  const batchDate = nextRoastDate();
  const { bags } = content.batch;

  try {
    const reserved = await Reservation.countDocuments({ batchDate });
    if (reserved >= bags) {
      return res.status(409).json({
        code: 'sold-out',
        message: 'This roast is fully reserved. A new batch opens after Tuesday.',
        bagsLeft: 0,
      });
    }

    const saved = await Reservation.create({ ...value, batchDate, code: makeCode() });
    const coffee = content.coffees.find((item) => item.id === value.coffee);

    return res.status(201).json({
      reservation: {
        code: saved.code,
        name: saved.name,
        email: saved.email,
        coffeeName: coffee.name,
        grindLabel: content.grinds.find((item) => item.id === value.grind).label,
        price: coffee.price,
        batchDate: batchDate.toISOString(),
      },
      bagsLeft: Math.max(bags - reserved - 1, 0),
    });
  } catch (error) {
    if (error.code === DUPLICATE_KEY) {
      return res.status(409).json({
        code: 'duplicate',
        message: 'This email already has that coffee reserved from this roast. Choose another coffee or email.',
      });
    }
    console.error('Could not save reservation:', error);
    return res.status(500).json({ message: 'The reservation was not saved. Try again.' });
  }
});

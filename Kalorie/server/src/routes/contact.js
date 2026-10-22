import { Router } from 'express';
import Contact from '../models/Contact.js';

const router = Router();

// POST /api/contact — public contact form (About Us page)
router.post('/', async (req, res) => {
  try {
    const { name, phone, query } = req.body;
    if (!name || !query) {
      return res.status(400).json({ error: 'Name and query are required' });
    }
    await Contact.create({ name, phone, query });
    res.status(201).json({ ok: true, message: 'Thanks! We will get back to you soon.' });
  } catch (err) {
    console.error('contact error', err);
    res.status(500).json({ error: 'Could not send your message' });
  }
});

export default router;

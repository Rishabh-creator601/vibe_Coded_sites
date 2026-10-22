import { Router } from 'express';
import FoodEntry from '../models/FoodEntry.js';
import auth from '../middleware/auth.js';

const router = Router();
router.use(auth); // every entries route requires a logged-in user

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];

// GET /api/entries?date=YYYY-MM-DD
// Returns the day's entries grouped by meal, plus daily totals.
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'A valid date (YYYY-MM-DD) is required' });
    }

    const entries = await FoodEntry.find({ user: req.userId, date }).sort({ createdAt: 1 });

    const byMeal = Object.fromEntries(MEALS.map((m) => [m, []]));
    const totals = { calories: 0, carbs: 0, protein: 0 };

    for (const entry of entries) {
      byMeal[entry.meal].push(entry.toClientJSON());
      totals.calories += entry.calories;
      totals.carbs += entry.carbs;
      totals.protein += entry.protein;
    }

    res.json({ date, meals: byMeal, totals });
  } catch (err) {
    console.error('list entries error', err);
    res.status(500).json({ error: 'Could not load entries' });
  }
});

// POST /api/entries — add a food item
router.post('/', async (req, res) => {
  try {
    const { date, meal, foodName, servingSize, calories, carbs, protein } = req.body;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'A valid date (YYYY-MM-DD) is required' });
    }
    if (!MEALS.includes(meal)) {
      return res.status(400).json({ error: 'meal must be one of: ' + MEALS.join(', ') });
    }
    if (!foodName || !servingSize) {
      return res.status(400).json({ error: 'foodName and servingSize are required' });
    }

    const entry = await FoodEntry.create({
      user: req.userId,
      date,
      meal,
      foodName,
      servingSize,
      calories: Number(calories) || 0,
      carbs: Number(carbs) || 0,
      protein: Number(protein) || 0,
    });

    res.status(201).json(entry.toClientJSON());
  } catch (err) {
    console.error('create entry error', err);
    res.status(500).json({ error: 'Could not add entry' });
  }
});

// POST /api/entries/bulk — add several food items at once (from quick-add)
router.post('/bulk', async (req, res) => {
  try {
    const { date, meal, items } = req.body;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'A valid date (YYYY-MM-DD) is required' });
    }
    if (!MEALS.includes(meal)) {
      return res.status(400).json({ error: 'meal must be one of: ' + MEALS.join(', ') });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items must be a non-empty array' });
    }

    const docs = items.map((it) => ({
      user: req.userId,
      date,
      meal,
      foodName: String(it.name || it.foodName || 'Item'),
      servingSize: String(it.servingSize || '1 serving'),
      calories: Number(it.calories) || 0,
      carbs: Number(it.carbs) || 0,
      protein: Number(it.protein) || 0,
    }));

    const created = await FoodEntry.insertMany(docs);
    res.status(201).json({ count: created.length });
  } catch (err) {
    console.error('bulk entry error', err);
    res.status(500).json({ error: 'Could not add entries' });
  }
});

// DELETE /api/entries/:id — remove a food item (only the owner's)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await FoodEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!deleted) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('delete entry error', err);
    res.status(500).json({ error: 'Could not delete entry' });
  }
});

export default router;

import { Router } from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import { extractFoodItems } from '../utils/gemini.js';

const router = Router();
router.use(auth);

// A tiny local table of staples for instant, reliable results (per 100 g).
// Open Food Facts is the broad fallback / "search the web" source.
const LOCAL_FOODS = [
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23 },
  { name: 'Apple', calories: 52, protein: 0.3, carbs: 14 },
  { name: 'White rice (cooked)', calories: 130, protein: 2.7, carbs: 28 },
  { name: 'Chicken breast (cooked)', calories: 165, protein: 31, carbs: 0 },
  { name: 'Boiled egg', calories: 155, protein: 13, carbs: 1.1 },
  { name: 'Whole milk', calories: 61, protein: 3.2, carbs: 4.8 },
  { name: 'Oats (dry)', calories: 389, protein: 17, carbs: 66 },
  { name: 'Paneer', calories: 265, protein: 18, carbs: 1.2 },
  { name: 'Roti / Chapati', calories: 297, protein: 11, carbs: 46 },
  { name: 'Dal (cooked)', calories: 116, protein: 9, carbs: 20 },
  { name: 'Almonds', calories: 579, protein: 21, carbs: 22 },
  { name: 'Peanut butter', calories: 588, protein: 25, carbs: 20 },
];

function searchLocal(q) {
  const needle = q.toLowerCase();
  return LOCAL_FOODS.filter((f) => f.name.toLowerCase().includes(needle)).map((f) => ({
    ...f,
    per: '100 g',
    source: 'local',
  }));
}

// Query Open Food Facts (SearchALicious API) and normalise to per-100g
// calories/protein/carbs. The legacy cgi/search.pl endpoint is frequently
// overloaded (503s), so we use the dedicated search service instead.
async function searchOpenFoodFacts(q) {
  const url =
    'https://search.openfoodfacts.org/search?' +
    new URLSearchParams({ q, page_size: '20' }).toString();

  const resp = await fetch(url, { headers: { 'User-Agent': 'KALORIE/1.0 (calorie tracker)' } });
  if (!resp.ok) throw new Error(`Open Food Facts responded ${resp.status}`);
  const data = await resp.json();

  return (data.hits || [])
    .map((p) => {
      const n = p.nutriments || {};
      let kcal = n['energy-kcal_100g'];
      if (kcal == null && n['energy_100g'] != null) kcal = n['energy_100g'] / 4.184; // kJ → kcal
      const name = (p.product_name || '').trim();
      if (!name || kcal == null) return null;
      const brand = Array.isArray(p.brands) ? p.brands[0] : p.brands;
      const label = brand && !name.toLowerCase().includes(String(brand).toLowerCase())
        ? `${name} — ${String(brand).trim()}`
        : name;
      return {
        name: label,
        per: '100 g',
        calories: Math.round(kcal),
        protein: Math.round((n.proteins_100g ?? 0) * 10) / 10,
        carbs: Math.round((n.carbohydrates_100g ?? 0) * 10) / 10,
        source: 'openfoodfacts',
      };
    })
    .filter(Boolean);
}

// GET /api/foods/search?q=oats
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json({ results: [] });

  const local = searchLocal(q);
  try {
    const web = await searchOpenFoodFacts(q);
    // Local staples first, then web results, de-duplicated by name.
    const seen = new Set(local.map((f) => f.name.toLowerCase()));
    const merged = [...local];
    for (const item of web) {
      if (!seen.has(item.name.toLowerCase())) {
        merged.push(item);
        seen.add(item.name.toLowerCase());
      }
    }
    res.json({ results: merged.slice(0, 15) });
  } catch (err) {
    console.error('food search fallback error:', err.message);
    // If the web lookup fails, still return whatever we matched locally.
    res.json({ results: local, warning: 'Web search unavailable; showing local matches only.' });
  }
});

// POST /api/foods/parse — turn a single free-text line ("2 roti + tea")
// into structured items with nutrition via Gemini, biased to the user's
// country. Used by the quick-add box; does not log anything itself.
router.post('/parse', async (req, res) => {
  const line = (req.body.line || '').trim();
  if (!line) return res.status(400).json({ error: 'Please type what you ate.' });

  try {
    const user = await User.findById(req.userId).select('country');
    const items = await extractFoodItems({ line, country: user?.country });
    if (items.length === 0) {
      return res.status(422).json({ error: 'Could not recognise any food in that.' });
    }
    res.json({ items });
  } catch (err) {
    console.error('parse error:', err.message);
    res.status(502).json({ error: 'Nutrition lookup failed. Please try again.' });
  }
});

export default router;

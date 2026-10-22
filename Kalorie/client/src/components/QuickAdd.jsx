import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bulkAddEntries } from '../store/entriesSlice.js';
import { api } from '../api/client.js';

// Single-line, natural-language food logging (item 14). The user types a whole
// meal — e.g. "2 roti + mango shake + tea" — and Gemini extracts each item with
// nutrition (country-aware). We preview the parsed items, then log them all.
export default function QuickAdd({ meal, onDone }) {
  const dispatch = useDispatch();
  const date = useSelector((s) => s.entries.date);

  const [line, setLine] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const analyse = async (e) => {
    e.preventDefault();
    const text = line.trim();
    if (!text) return;
    setLoading(true);
    setError('');
    setItems([]);
    try {
      const { items } = await api.parseFoods(text);
      // Item 15: surface the extracted foods in the browser console (Inspect).
      console.log(`%c[KALORIE] Extracted ${items?.length || 0} food item(s) from: "${text}"`, 'color:#3b82f6;font-weight:bold');
      console.table(items);
      setItems(items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const addAll = async () => {
    if (items.length === 0) return;
    setSaving(true);
    const res = await dispatch(bulkAddEntries({ date, meal, items }));
    setSaving(false);
    if (bulkAddEntries.fulfilled.match(res)) {
      setLine('');
      setItems([]);
      onDone?.();
    } else {
      setError(res.payload || 'Could not save');
    }
  };

  const totals = items.reduce(
    (t, it) => ({ calories: t.calories + it.calories, protein: t.protein + it.protein, carbs: t.carbs + it.carbs }),
    { calories: 0, protein: 0, carbs: 0 }
  );

  return (
    <div className="quick-add">
      <form onSubmit={analyse} className="quick-add-form">
        <input
          value={line}
          onChange={(e) => setLine(e.target.value)}
          placeholder="Type your meal, e.g. 2 roti + mango shake + tea"
          autoFocus
        />
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Analysing…' : 'Analyse'}
        </button>
      </form>
      <div className="quick-hint">Add several items at once, separated by “+” or commas.</div>

      {error && <div className="error" style={{ marginTop: 10 }}>{error}</div>}

      {items.length > 0 && (
        <div className="parsed">
          {items.map((it, i) => (
            <div className="food-row" key={i}>
              <div>
                <div className="food-name">{it.name}</div>
                <div className="food-meta">{it.servingSize}</div>
              </div>
              <div className="macro-chips">
                <span className="chip red">{it.calories} kcal</span>
                <span className="chip">P {it.protein}g</span>
                <span className="chip">C {it.carbs}g</span>
              </div>
              <button className="btn-del" title="Remove" onClick={() => removeItem(i)}>
                ✕
              </button>
            </div>
          ))}

          <div className="parsed-foot">
            <span className="food-meta">
              Total: <strong>{Math.round(totals.calories)} kcal</strong> · P{' '}
              {Math.round(totals.protein)}g · C {Math.round(totals.carbs)}g
            </span>
            <button className="btn-primary" onClick={addAll} disabled={saving}>
              {saving ? 'Adding…' : `Add ${items.length} item${items.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

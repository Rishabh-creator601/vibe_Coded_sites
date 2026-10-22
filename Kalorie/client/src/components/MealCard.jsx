import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeEntry } from '../store/entriesSlice.js';
import QuickAdd from './QuickAdd.jsx';

const EMOJI = { breakfast: '🍳', lunch: '🥗', dinner: '🍛', snack: '🍎' };

export default function MealCard({ meal, items }) {
  const dispatch = useDispatch();
  const date = useSelector((s) => s.entries.date);
  const [adding, setAdding] = useState(false);

  const mealCalories = items.reduce((sum, it) => sum + it.calories, 0);

  return (
    <div className="card meal-card">
      <div className="meal-head">
        <div className="meal-title">
          <span className="meal-emoji">{EMOJI[meal]}</span>
          {meal}
          <span className="food-meta">· {Math.round(mealCalories)} kcal</span>
        </div>
        <button className="btn-add" onClick={() => setAdding((v) => !v)}>
          {adding ? 'Close' : '+ Add food'}
        </button>
      </div>

      {items.length === 0 && !adding && <div className="empty">Nothing logged yet.</div>}

      {items.map((it) => (
        <div className="food-row" key={it.id}>
          <div>
            <div className="food-name">{it.foodName}</div>
            <div className="food-meta">{it.servingSize}</div>
          </div>
          <div className="macro-chips">
            <span className="chip red">{Math.round(it.calories)} kcal</span>
            <span className="chip">P {Math.round(it.protein)}g</span>
            <span className="chip">C {Math.round(it.carbs)}g</span>
          </div>
          <button
            className="btn-del"
            title="Remove"
            onClick={() => dispatch(removeEntry({ id: it.id, date }))}
          >
            ✕
          </button>
        </div>
      ))}

      {adding && (
        <div className="add-form">
          <QuickAdd meal={meal} onDone={() => setAdding(false)} />
        </div>
      )}
    </div>
  );
}

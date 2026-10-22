import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDay, setDate } from '../store/entriesSlice.js';
import ThemeToggle from '../components/ThemeToggle.jsx';
import UserMenu from '../components/UserMenu.jsx';
import DaySummary from '../components/DaySummary.jsx';
import MealCard from '../components/MealCard.jsx';

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];

function shiftDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { date, meals, error } = useSelector((s) => s.entries);

  // Load whenever the selected day changes.
  useEffect(() => {
    dispatch(fetchDay(date));
  }, [dispatch, date]);

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <span className="dot" /> KALORIE
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="food-meta">Hi, {user.name.split(' ')[0]}</span>
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>

      <div className="target-banner">
        🎯 Your daily target: <strong>{user.targetCalories} kcal</strong> · Protein{' '}
        <strong>{user.proteinTarget}g</strong> · Carbs <strong>{user.carbsTarget}g</strong>{' '}
        <span className="food-meta">({user.dietType})</span>
      </div>

      <div className="date-bar" style={{ marginTop: 20 }}>
        <button className="icon-btn" onClick={() => dispatch(setDate(shiftDate(date, -1)))}>
          ‹
        </button>
        <input type="date" value={date} onChange={(e) => dispatch(setDate(e.target.value))} />
        <button className="icon-btn" onClick={() => dispatch(setDate(shiftDate(date, 1)))}>
          ›
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <DaySummary />

      {MEAL_ORDER.map((meal) => (
        <MealCard key={meal} meal={meal} items={meals[meal] || []} />
      ))}
    </div>
  );
}

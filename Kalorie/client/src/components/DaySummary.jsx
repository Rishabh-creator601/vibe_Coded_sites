import { useSelector } from 'react-redux';
import CircularProgress from './CircularProgress.jsx';

export default function DaySummary() {
  const totals = useSelector((s) => s.entries.totals);
  const user = useSelector((s) => s.auth.user);

  return (
    <div className="summary-grid">
      <CircularProgress value={totals.calories} target={user.targetCalories} label="Calories" />
      <CircularProgress value={totals.protein} target={user.proteinTarget} label="Protein" unit="g" />
      <CircularProgress value={totals.carbs} target={user.carbsTarget} label="Carbs" unit="g" />
    </div>
  );
}

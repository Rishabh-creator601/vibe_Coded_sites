import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/themeSlice.js';

export default function ThemeToggle() {
  const mode = useSelector((s) => s.theme.mode);
  const dispatch = useDispatch();
  return (
    <button
      className="icon-btn"
      onClick={() => dispatch(toggleTheme())}
      title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
    >
      {mode === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

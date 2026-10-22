import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import About from './pages/About.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  const user = useSelector((s) => s.auth.user);
  const themeMode = useSelector((s) => s.theme.mode);

  // Apply the theme to the document root so CSS variables switch.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  return (
    <Routes>
      {/* Landing is shown only when logged out; logged-in users skip it. */}
      <Route path="/" element={user ? <Navigate to="/app" replace /> : <Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={user ? <Navigate to="/app" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/app" replace /> : <Register />} />
      <Route path="/app" element={user ? <Dashboard /> : <Navigate to="/" replace />} />
      <Route path="/settings" element={user ? <Settings /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

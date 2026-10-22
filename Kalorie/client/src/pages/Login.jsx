import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { login } from '../store/authSlice.js';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function Login() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="topbar">
          <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="dot" /> KALORIE
          </Link>
          <ThemeToggle />
        </div>

        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Log in to keep tracking your day.</div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={set('password')} required />
          </div>
          <button className="btn-primary" style={{ width: '100%' }} disabled={status === 'loading'}>
            {status === 'loading' ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div className="auth-switch">
          New here?{' '}
          <Link to="/register" className="link">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

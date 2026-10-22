import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { register } from '../store/authSlice.js';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { COUNTRIES } from '../constants.js';

const initial = {
  name: '',
  email: '',
  password: '',
  gender: 'male',
  age: '',
  heightCm: '',
  weightKg: '',
  dietType: 'veg',
  activityLevel: 'sedentary',
  country: 'India',
};

export default function Register() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState(initial);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    dispatch(register(form));
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

        <div className="auth-title">Create your account</div>
        <div className="auth-sub">
          We use your details to set a daily calorie &amp; macro target.
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>Name</label>
            <input value={form.name} onChange={set('name')} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={set('password')} required minLength={6} />
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Gender</label>
              <select value={form.gender} onChange={set('gender')}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="field">
              <label>Age</label>
              <input type="number" value={form.age} onChange={set('age')} required min={1} max={120} />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Height (cm)</label>
              <input type="number" value={form.heightCm} onChange={set('heightCm')} required min={50} max={260} />
            </div>
            <div className="field">
              <label>Current weight (kg)</label>
              <input type="number" value={form.weightKg} onChange={set('weightKg')} required min={10} max={500} />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Diet</label>
              <select value={form.dietType} onChange={set('dietType')}>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-vegetarian</option>
              </select>
            </div>
            <div className="field">
              <label>Activity level</label>
              <select value={form.activityLevel} onChange={set('activityLevel')}>
                <option value="sedentary">Sedentary</option>
                <option value="light">Lightly active</option>
                <option value="moderate">Moderately active</option>
                <option value="active">Active</option>
                <option value="very_active">Very active</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Country (tailors food &amp; portion estimates)</label>
            <select value={form.country} onChange={set('country')}>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button className="btn-primary" style={{ width: '100%' }} disabled={status === 'loading'}>
            {status === 'loading' ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="link">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

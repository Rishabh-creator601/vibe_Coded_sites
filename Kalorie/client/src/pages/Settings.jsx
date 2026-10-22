import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { updateProfile } from '../store/authSlice.js';
import Avatar from '../components/Avatar.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { COUNTRIES } from '../constants.js';

export default function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const [form, setForm] = useState({
    name: user.name,
    gender: user.gender,
    age: user.age,
    heightCm: user.heightCm,
    weightKg: user.weightKg,
    dietType: user.dietType,
    activityLevel: user.activityLevel,
    country: user.country || 'India',
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    setSaved(false);
  };

  // Read an uploaded image as a base64 data URL and save it immediately.
  const onPicture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Please choose an image under 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => dispatch(updateProfile({ profilePicture: reader.result }));
    reader.readAsDataURL(file);
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    const res = await dispatch(updateProfile(form));
    if (updateProfile.fulfilled.match(res)) {
      setSaved(true);
    } else {
      setError(res.payload || 'Could not save');
    }
  };

  return (
    <div className="container">
      <div className="topbar">
        <Link to="/app" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="dot" /> KALORIE
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <ThemeToggle />
          <Link to="/app" className="btn-ghost">← Back</Link>
        </div>
      </div>

      <h1 style={{ marginBottom: 16 }}>Settings</h1>

      {/* Profile picture */}
      <div className="card" style={{ marginBottom: 18 }}>
        <h3 style={{ marginBottom: 12 }}>Profile picture</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar size={72} />
          <label className="btn-ghost" style={{ cursor: 'pointer' }}>
            Upload new
            <input type="file" accept="image/*" onChange={onPicture} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Profile details */}
      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Your details</h3>
        {saved && <div className="success">Saved! Your targets have been recalculated.</div>}
        {error && <div className="error">{error}</div>}

        <form onSubmit={save}>
          <div className="field">
            <label>User name</label>
            <input value={form.name} onChange={set('name')} required />
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
              <input type="number" value={form.age} onChange={set('age')} min={1} max={120} />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Height (cm)</label>
              <input type="number" value={form.heightCm} onChange={set('heightCm')} min={50} max={260} />
            </div>
            <div className="field">
              <label>Weight (kg)</label>
              <input type="number" value={form.weightKg} onChange={set('weightKg')} min={10} max={500} />
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
            <label>Country</label>
            <select value={form.country} onChange={set('country')}>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary" type="submit">Save changes</button>
            <button type="button" className="btn-ghost" onClick={() => navigate('/app')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { api } from '../api/client.js';

export default function About() {
  const [form, setForm] = useState({ name: '', phone: '', query: '' });
  const [status, setStatus] = useState({ state: 'idle', msg: '' });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'sending', msg: '' });
    try {
      const res = await api.sendContact(form);
      setStatus({ state: 'done', msg: res.message || 'Message sent!' });
      setForm({ name: '', phone: '', query: '' });
    } catch (err) {
      setStatus({ state: 'error', msg: err.message });
    }
  };

  return (
    <div className="landing">
      <Navbar />

      <section className="section about-hero">
        <h1>About Us</h1>
        <p className="footer-muted" style={{ maxWidth: 640 }}>
          KALORIE started with a simple idea: tracking what you eat shouldn't feel like data entry.
          We pair a clean, fast interface with automatic nutrition lookup so you can focus on your
          goals — not on counting. Our team of fitness enthusiasts and engineers builds KALORIE to
          be the tracker we always wanted to use ourselves.
        </p>
      </section>

      <section className="section">
        <div className="about-grid">
          <div className="card">
            <h2>Get in touch</h2>
            <p className="footer-muted">
              Questions, feedback or partnership ideas? Drop us a line and we’ll respond soon.
            </p>

            {status.state === 'done' && <div className="success">{status.msg}</div>}
            {status.state === 'error' && <div className="error">{status.msg}</div>}

            <form onSubmit={submit}>
              <div className="field">
                <label>Name</label>
                <input value={form.name} onChange={set('name')} required />
              </div>
              <div className="field">
                <label>Phone number</label>
                <input value={form.phone} onChange={set('phone')} placeholder="+91…" />
              </div>
              <div className="field">
                <label>Your query</label>
                <textarea
                  value={form.query}
                  onChange={set('query')}
                  rows={4}
                  required
                  placeholder="How can we help?"
                />
              </div>
              <button className="btn-primary" disabled={status.state === 'sending'}>
                {status.state === 'sending' ? 'Sending…' : 'Send message'}
              </button>
            </form>
          </div>

          <div className="card">
            <h2>Reach us directly</h2>
            <p>📞 <strong>+91 98765 43210</strong></p>
            <p>☎️ General: <strong>+91 11 4000 0000</strong></p>
            <p>✉️ <a href="mailto:hello@kalorie.app">hello@kalorie.app</a></p>
            <p className="footer-muted" style={{ marginTop: 12 }}>
              Office hours: Mon–Fri, 9am–6pm IST.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

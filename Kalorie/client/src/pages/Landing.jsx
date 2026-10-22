import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const FITNESS_IMAGES = [
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?auto=format&fit=crop&w=800&q=60',
];

const MANUALS = [
  { title: 'Getting started', body: 'Create your account, set your goal, and log your first meal in under a minute.' },
  { title: 'Logging food', body: 'Just search a food — KALORIE fills in calories, protein and carbs automatically.' },
  { title: 'Reading your day', body: 'Track progress bars for calories and macros against your personal daily target.' },
];

const REVIEWS = [
  { name: 'Aarav', text: 'Finally a tracker that does the math for me. The food search is spot on.', stars: 5 },
  { name: 'Meera', text: 'Love the dark theme and how fast logging is. Lost 4 kg in two months!', stars: 5 },
  { name: 'Dev', text: 'Simple, clean, and the macro targets actually make sense for my diet.', stars: 4 },
];

const FAQS = [
  { q: 'Is KALORIE free?', a: 'Yes — create an account and start tracking right away.' },
  { q: 'How is my calorie target calculated?', a: 'From your gender, age, height, weight and activity level using the Mifflin–St Jeor formula.' },
  { q: 'Where does nutrition data come from?', a: 'A built-in list of staples plus the Open Food Facts database for everything else.' },
  { q: 'Can I track by meal?', a: 'Absolutely — breakfast, lunch, dinner and snacks are tracked separately each day.' },
];

export default function Landing() {
  return (
    <div className="landing">
      <Navbar />

      {/* Hero / Fitness images */}
      <section id="fitness" className="hero">
        <div className="hero-text">
          <h1>
            Track every calorie,<br />
            <span className="accent">the smart way.</span>
          </h1>
          <p>
            KALORIE logs your meals, auto-fills nutrition, and keeps you on target — day by day,
            meal by meal.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn-primary">Get started free</Link>
            <Link to="/login" className="btn-ghost">I already have an account</Link>
          </div>
        </div>
        <div className="hero-gallery">
          {FITNESS_IMAGES.map((src, i) => (
            <img key={i} src={src} alt="Fitness" loading="lazy" />
          ))}
        </div>
      </section>

      {/* Manuals */}
      <section id="manuals" className="section">
        <h2>Manuals</h2>
        <div className="cards-3">
          {MANUALS.map((m) => (
            <div className="card" key={m.title}>
              <h3>{m.title}</h3>
              <p className="footer-muted">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="section">
        <h2>Reviews</h2>
        <div className="cards-3">
          {REVIEWS.map((r) => (
            <div className="card" key={r.name}>
              <div className="stars">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
              <p>“{r.text}”</p>
              <p className="footer-muted">— {r.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section">
        <h2>FAQ</h2>
        <div className="faq-list">
          {FAQS.map((f) => (
            <details className="card" key={f.q}>
              <summary>{f.q}</summary>
              <p className="footer-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

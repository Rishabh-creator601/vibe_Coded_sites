import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';

// Public navigation shown on the landing and About Us pages.
export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
        <span className="dot" /> KALORIE
      </Link>

      <div className="nav-links">
        <a href="/#fitness">Fitness</a>
        <a href="/#manuals">Manuals</a>
        <a href="/#reviews">Reviews</a>
        <a href="/#faq">FAQ</a>
        <Link to="/about">About Us</Link>
      </div>

      <div className="nav-actions">
        <ThemeToggle />
        <Link to="/login" className="btn-ghost">
          Log in
        </Link>
        <Link to="/register" className="btn-primary">
          Sign up
        </Link>
      </div>
    </nav>
  );
}

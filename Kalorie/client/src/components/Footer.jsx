// Site footer with contact + social links (item 9).
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col">
          <div className="brand">
            <span className="dot" /> KALORIE
          </div>
          <p className="footer-muted">Track every calorie, the smart way.</p>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <p>📞 +91 98765 43210</p>
          <p>☎️ General: +91 11 4000 0000</p>
          <p>✉️ <a href="mailto:hello@kalorie.app">hello@kalorie.app</a></p>
        </div>

        <div className="footer-col">
          <h4>Follow us</h4>
          <p><a href="https://t.me/" target="_blank" rel="noreferrer">✈️ Telegram</a></p>
          <p><a href="https://instagram.com/" target="_blank" rel="noreferrer">📸 Instagram</a></p>
          <p><a href="https://github.com/" target="_blank" rel="noreferrer">🐙 GitHub</a></p>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} KALORIE. All rights reserved.</div>
    </footer>
  );
}

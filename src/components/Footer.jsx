import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <div className="footer-logo">
          <span aria-hidden="true">🇮🇳</span>
          <strong>Incredible Bharat</strong>
        </div>
        <p>
          Discovering, preserving and celebrating India's rich cultural
          heritage and living traditions.
        </p>
      </div>

      <nav className="footer-links" aria-label="Footer navigation">
        <Link to="/">Home</Link>
        <Link to="/explore">Explore India</Link>
        <Link to="/explore">Heritage</Link>
        <Link to="/ai-guide">AI Guide</Link>
      </nav>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Incredible Bharat</span>
        <span>Built with ❤️ for India's Heritage</span>
      </div>
    </footer>
  );
}

export default Footer;

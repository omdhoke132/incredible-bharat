import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = location.pathname === "/";

  const goToSection = (section) => {
    setMobileOpen(false);
    if (isHome) {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    navigate("/");
    window.setTimeout(() => {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const linkClass = ({ isActive }) => isActive ? "active" : "";
  const closeMenu = () => setMobileOpen(false);

  return (
    <nav className="navbar" aria-label="Main navigation">
      <Link to="/" className="logo" aria-label="Incredible Bharat home" onClick={closeMenu}>
        <span className="logo-mark">IN</span>
        <span className="logo-copy">
          <strong>Incredible Bharat</strong>
          <small>Living Cultural Atlas</small>
        </span>
      </Link>

      <div className="nav-links">
        <NavLink to="/" end className={linkClass}>Home</NavLink>
        <NavLink to="/explore" className={linkClass}>Explore India</NavLink>
        <button type="button" className="nav-section-link" onClick={() => goToSection("heritage")}>
          Heritage
        </button>
        <NavLink to="/ai-guide" className={linkClass}>AI Guide</NavLink>
      </div>

      <Link to="/explore" className="nav-cta" onClick={closeMenu}>
        Start Exploring <span aria-hidden="true">→</span>
      </Link>

      <button
        type="button"
        className="mobile-menu-toggle"
        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={mobileOpen}
        aria-controls="mobile-navigation"
        onClick={() => setMobileOpen((open) => !open)}
      >
        <span></span><span></span><span></span>
      </button>

      {mobileOpen && (
        <div className="mobile-nav-panel" id="mobile-navigation">
          <NavLink to="/" end className={linkClass} onClick={closeMenu}>Home</NavLink>
          <NavLink to="/explore" className={linkClass} onClick={closeMenu}>Explore India</NavLink>
          <button type="button" onClick={() => goToSection("heritage")}>Heritage</button>
          <NavLink to="/ai-guide" className={linkClass} onClick={closeMenu}>AI Guide</NavLink>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

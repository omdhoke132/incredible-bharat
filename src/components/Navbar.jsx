import { NavLink, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isExplore = location.pathname === "/explore";
  const isAI = location.pathname === "/ai-guide";

  const goToSection = (section) => {
    if (isHome) {
      document.getElementById(section)?.scrollIntoView({
        behavior: "smooth"
      });
    } else {
      window.location.href = `/#${section}`;
    }
  };

  return (
    <nav className="navbar">
      <Link
        to="/"
        className="logo"
        aria-label="Incredible Bharat home"
      >
        <span className="logo-mark">IN</span>

        <div>
          <strong>Incredible Bharat</strong>
          <small>Living Cultural Atlas</small>
        </div>
      </Link>

      <div className="nav-links">
        <NavLink
          to="/"
          className={isHome ? "active" : ""}
        >
          Home
        </NavLink>

        <NavLink
          to="/explore"
          className={isExplore ? "active" : ""}
        >
          Explore India
        </NavLink>

        <button
          type="button"
          className="nav-section-link"
          onClick={() => goToSection("heritage")}
        >
          Heritage
        </button>

        <NavLink
          to="/ai-guide"
          className={isAI ? "active" : ""}
        >
          AI Guide
        </NavLink>
      </div>

      <Link
        to="/explore"
        className="nav-cta"
      >
        Start Exploring <span>→</span>
      </Link>
    </nav>
  );
}

export default Navbar;
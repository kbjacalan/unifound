import { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import Logo from "../../assets/logo.png";
import { NavLink, Link, useLocation } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <nav ref={navRef} className={`nav-bar ${menuOpen ? "active" : ""}`}>
      <div className="logo">
        <img className="brand-logo" src={Logo} alt="UniFound Logo" />
        <h3>
          Uni<span>Found</span>
        </h3>
      </div>

      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        <NavLink to="/">
          <li>Home</li>
        </NavLink>

        <NavLink to="/about">
          <li>About</li>
        </NavLink>
        <NavLink to="/contact">
          <li>Contact</li>
        </NavLink>
        <button className="register-btn-mobile">Sign Up</button>
      </ul>

      <Link to="/signup">
        <button className="register-btn">Sign Up</button>
      </Link>

      <div
        className={`ham-menu ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        <span className={`top ${menuOpen ? "active" : ""}`}></span>
        <span className={`bottom ${menuOpen ? "active" : ""}`}></span>
      </div>
    </nav>
  );
}

export default Navbar;

import React from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/logo.png";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <img className="brand-logo" src={Logo} alt="UniFound Logo" />
            <h3>
              Uni<span>Found</span>
            </h3>
          </div>
          <p>
            The official Lost and Found platform of Jose Rizal Memorial State
            University.
          </p>
        </div>

        <div className="footer-links">
          <h4>Platform</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/signup">Browse Items</Link>
            </li>
            <li>
              <Link to="/signup">Report Items</Link>
            </li>
            <li>
              <Link to="/signup">Dashboard</Link>
            </li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Support</h4>
          <ul>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/contact">Contact Support</Link>
            </li>
            <li>
              <Link to="/contact">FAQs</Link>
            </li>
            <li>
              <Link to="/contact">Privacy Policy</Link>
            </li>
          </ul>
        </div>

        <div className="footer-newsletter">
          <h4>Stay Updated</h4>
          <p>Get notified about recently found items inside the campus.</p>
          <form
            className="newsletter-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <input type="email" placeholder="Your email" required />
            <button className="join-btn" type="submit">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} UniFound. Built for campus safety.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

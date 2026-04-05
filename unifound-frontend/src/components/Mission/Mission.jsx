import React from "react";
import Logo from "../../assets/logo.png";
import { Zap, ShieldCheck, Gauge, Globe } from "lucide-react";
import "./Mission.css";
import SectionLabel from "../SectionLabel/SectionLabel";
import { Link } from "react-router-dom";

const Mission = () => {
  return (
    <section className="mission-section">
      <div className="ms-top">
        <SectionLabel label="Mission" />
        <div className="ms-title-row">
          <h2>
            UniFound helps
            <br />
            <em>you find it.</em>
          </h2>
          <p className="ms-subtitle">
            Our mission is to build a simple, efficient, and trusted lost &amp;
            found system turning small acts of honesty into a campus-wide
            culture of trust.
          </p>
        </div>
      </div>

      <div className="mission-bento">
        <div className="bento-card bc-wide">
          <div className="bc-tag">// PURPOSE</div>
          <h3>Connect finders with owners.</h3>
          <p>
            A centralized, trusted platform that bridges the gap between the
            person who lost something and the person who found it.
          </p>
          <div className="bc-glow" />
        </div>

        <div className="bento-card bc-tall">
          <div className="bc-tag">// VALUES</div>
          <ul className="bc-list">
            <li>
              <Zap className="bcl-icon" />
              <span>Speed</span>
            </li>
            <li>
              <ShieldCheck className="bcl-icon" />
              <span>Trust</span>
            </li>
            <li>
              <Gauge className="bcl-icon" />
              <span>Efficiency</span>
            </li>
            <li>
              <Globe className="bcl-icon" />
              <span>Accessibility</span>
            </li>
          </ul>
        </div>

        <div className="bento-card bc-small bc-blue">
          <div className="bc-tag bc-tag--white">// ACCESS</div>
          <p className="bc-highlight">
            Open to all students, faculty &amp; staff.
          </p>
        </div>

        <div className="bento-card bc-small">
          <div className="bc-tag">// LEARN MORE</div>
          <Link to="/" className="cta-link">
            See how it works →
          </Link>
          <div className="bc-arrow">↗</div>
        </div>
      </div>

      <div className="mission-visual" aria-hidden="true">
        <div className="visual-ring ring-1" />
        <div className="visual-ring ring-2" />
        <div className="visual-ring ring-3" />
        <img className="visual-core" src={Logo} alt="" />
      </div>
    </section>
  );
};

export default Mission;

import React from "react";
import Logo from "../../assets/logo.png";
import { MapPin, CheckCircle2 } from "lucide-react";
import "./AboutHero.css";
import SectionLabel from "../../components/SectionLabel/SectionLabel";

const AboutHero = () => {
  return (
    <section className="about-hero">
      <div className="hero-label">
        <SectionLabel label="✦ About" />
      </div>
      <h1>
        About Uni
        <span className="gradient-text">Found</span>
      </h1>
      <p>
        UniFound was created to improve how lost and found items are managed
        within the campus bringing everything into one reliable and accessible
        system for students, faculty, and staff.
      </p>
      <div className="hero-scroll-hint">
        <span>Scroll to explore</span>
        <div className="scroll-line" />
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="visual-ring ring-1" />
        <div className="visual-ring ring-2" />
        <div className="visual-ring ring-3" />
        <img className="visual-core" src={Logo} alt="" />

        <div className="hero-toast hero-toast--found">
          <div className="toast-icon-wrap toast-icon-wrap--blue">
            <MapPin size={13} strokeWidth={2.5} />
          </div>
          <div className="toast-body">
            <span className="toast-title">Item Reported Found</span>
            <span className="toast-sub">Library Building · just now</span>
          </div>
          <div className="toast-dot toast-dot--blue" />
        </div>

        <div className="hero-toast hero-toast--claimed">
          <div className="toast-icon-wrap toast-icon-wrap--green">
            <CheckCircle2 size={13} strokeWidth={2.5} />
          </div>
          <div className="toast-body">
            <span className="toast-title">Item Successfully Claimed</span>
            <span className="toast-sub">Student ID · 2 min ago</span>
          </div>
          <div className="toast-dot toast-dot--green" />
        </div>
      </div>
    </section>
  );
};

export default AboutHero;

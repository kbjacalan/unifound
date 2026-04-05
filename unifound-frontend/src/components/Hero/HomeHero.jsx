import React from "react";
import { Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./HomeHero.css";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="home-hero">
      <div className="hero-content">
        <h1>
          Find What's Lost. <br /> <span>Return What's Found.</span>
        </h1>
        <p className="hero-description">
          The official Lost and Found platform of Jose Rizal Memorial State
          University. Easily report missing items or help return lost belongings
          to their rightful owners.
        </p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => navigate("/signup")}>
            Report Item
          </button>
          <button className="btn-secondary" onClick={() => navigate("/signup")}>
            Browse Items
          </button>
        </div>
      </div>

      <div className="hero-visual">
        <div className="decor decor-top" />
        <div className="decor decor-bottom" />
        <div className="mock-card">
          <div className="img-box">
            <Package className="box-icon" />
          </div>
          <div className="mock-detail-bar">
            <div className="detail-bar bar-one"></div>
            <div className="detail-bar bar-two"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

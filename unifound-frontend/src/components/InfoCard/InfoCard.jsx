import React from "react";
import "./InfoCard.css";

const InfoCard = ({ icon, label, value, subtitle }) => {
  return (
    <div className="info-card">
      <div className="info-icon">{icon}</div>
      <div>
        <div className="info-label">{label}</div>
        <div className="info-value">{value}</div>
        <div className="info-sub">{subtitle}</div>
      </div>
    </div>
  );
};

export default InfoCard;

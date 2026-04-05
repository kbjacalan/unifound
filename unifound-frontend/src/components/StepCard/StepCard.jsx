import React from "react";
import { PlusCircle, ListTodo, Handshake } from "lucide-react";
import "./StepCard.css";

const StepCard = () => {
  return (
    <section className="step">
      <div className="step-grid">
        <div className="step-card">
          <div className="card-top-bar" />
          <div className="icon-box">
            <PlusCircle className="icon" />
          </div>
          <h3 className="step-title">Report Item</h3>
          <p className="step-description">
            Upload a photo and description of the item you lost or found on
            campus.
          </p>
          <div className="card-number">01</div>
        </div>
        <div className="step-card">
          <div className="card-top-bar" />
          <div className="icon-box">
            <ListTodo className="icon" />
          </div>
          <h3 className="step-title">Check Listings</h3>
          <p className="step-description">
            Browse lost and found listings to see if your item has been
            reported.
          </p>
          <div className="card-number">02</div>
        </div>
        <div className="step-card">
          <div className="card-top-bar" />
          <div className="icon-box">
            <Handshake className="icon" />
          </div>
          <h3 className="step-title">Claim Item</h3>
          <p className="step-description">
            Coordinate a safe meetup on campus to return the item to its owner.
          </p>
          <div className="card-number">03</div>
        </div>
      </div>
    </section>
  );
};

export default StepCard;

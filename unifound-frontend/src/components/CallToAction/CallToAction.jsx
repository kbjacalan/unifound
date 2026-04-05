import React from "react";
import "./CallToAction.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";

const CallToAction = ({
  variant = "about",
  eyebrow,
  title,
  subtitle,
  to,
  buttonText,
  requiresAuth = false,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleClick = () => {
    if (requiresAuth && !isAuthenticated) {
      navigate("/signup");
    } else {
      navigate(to);
    }
  };

  return (
    <section className={`cta ${variant}-cta`}>
      <div className="cta-inner">
        <div className="cta-bg-blob" />
        {eyebrow && <p className="cta-eyebrow">{eyebrow}</p>}
        <h2 className="cta-title">{title}</h2>
        <p className="cta-subtitle">{subtitle}</p>
        <button className="cta-button" onClick={handleClick}>
          {buttonText}
        </button>
      </div>
    </section>
  );
};

export default CallToAction;

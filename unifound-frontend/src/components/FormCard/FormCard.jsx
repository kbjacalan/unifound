import React from "react";
import { useState } from "react";
import "./FormCard.css";

const FormCard = () => {
  const [activeTopic, setActiveTopic] = useState("General");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const topics = [
    "General",
    "Bug Report",
    "Feature",
    "Partnership",
    "Lost Item",
    "Found Item",
  ];

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="form-card">
      {!submitted ? (
        <>
          <h2>Send us a message</h2>
          <p className="form-sub">
            Pick a topic and we'll route it to the right person.
          </p>

          <div className="topic-row">
            {topics.map((t) => (
              <button
                key={t}
                className={`topic-btn ${activeTopic === t ? "active" : ""}`}
                onClick={() => setActiveTopic(t)}
                type="button"
              >
                {t}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field-row">
              <div className="field">
                <label>First Name</label>
                <input
                  name="firstName"
                  type="text"
                  placeholder="Juan"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label>Last Name</label>
                <input
                  name="lastName"
                  type="text"
                  placeholder="dela Cruz"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@university.edu"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Message</label>
              <textarea
                name="message"
                placeholder="Tell us what's on your mind…"
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>

            <button className="submit-btn" type="submit">
              Send Message
            </button>
          </form>
        </>
      ) : (
        <div className="success-state">
          <div className="success-icon">✓</div>
          <h3>Message sent!</h3>
          <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
        </div>
      )}
    </div>
  );
};

export default FormCard;

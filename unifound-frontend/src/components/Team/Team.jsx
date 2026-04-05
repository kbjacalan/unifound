import React from "react";
import Bryan from "../../assets/bryan.jpg";
import Ivan from "../../assets/ivan.jpg";
import Marc from "../../assets/marc.jpg";
import "./Team.css";

const Team = () => {
  const teamMembers = [
    {
      name: "Bryan Jacalan",
      role: "Lead Developer",
      desc: "Specializes in system architecture and frontend magic.",
      image: Bryan,
      accent: "#2563eb",
    },
    {
      name: "Sigfred Alumbro",
      role: "Backend Engineer",
      desc: "The wizard behind our matching algorithms and database.",
      image: Ivan,
      accent: "#7c3aed",
    },
    {
      name: "Marc Ballares",
      role: "UI/UX Designer",
      desc: "Focused on making UniFound clean, simple, and accessible.",
      image: Marc,
      accent: "#0891b2",
    },
  ];

  return (
    <section className="team-section">
      <div className="team-grid">
        {teamMembers.map((m, i) => (
          <div
            key={i}
            className="team-card"
            style={{ "--card-accent": m.accent }}
          >
            <div className="card-top-bar" />
            <div className="member-avatar">
              <img src={m.image} alt={m.name} />
            </div>
            <h3>{m.name}</h3>
            <span className="member-role">{m.role}</span>
            <p>{m.desc}</p>
            <div className="card-number">0{i + 1}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Team;

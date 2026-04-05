import React from "react";
import { useState } from "react";
import "./FAQCard.css";

const FAQCard = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    {
      q: "How does item matching work?",
      a: "We use keyword and description matching to automatically pair lost and found reports in real time.",
    },
    {
      q: "Is UniFound free to use?",
      a: "Yes — UniFound is completely free for all students and staff at supported campuses.",
    },
    {
      q: "How do I report a found item?",
      a: "Head to the Found Items page, fill in the details, and our system handles the rest.",
    },
  ];

  return (
    <div className="faq-card">
      <h3>Quick Answers</h3>
      {faqs.map((faq, i) => (
        <div
          key={i}
          className={`faq-item ${openFaq === i ? "open" : ""}`}
          onClick={() => setOpenFaq(openFaq === i ? null : i)}
        >
          <div className="faq-q">
            {faq.q}
            <span className="faq-arr">▾</span>
          </div>
          {openFaq === i && <div className="faq-a">{faq.a}</div>}
        </div>
      ))}
    </div>
  );
};

export default FAQCard;

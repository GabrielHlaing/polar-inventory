import { useState } from "react";
import { faqData } from "./data/faqData";
import FabBack from "../components/FabBack";

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="container py-4" style={{ marginBottom: 80, maxWidth: 860 }}>
      <FabBack />

      <h1
        className="fw-bold mb-4"
        style={{ color: "#1f3a5f", letterSpacing: "0.3px" }}
      >
        Frequently Asked Questions
      </h1>

      {faqData.map((item, idx) => {
        const isOpen = openIndex === idx;

        return (
          <div
            key={idx}
            className="card shadow-sm border-0 mb-3"
            style={{ borderRadius: 14 }}
          >
            {/* Question */}
            <button
              onClick={() => toggle(idx)}
              className="w-100 text-start border-0 px-4 py-3 d-flex justify-content-between align-items-center"
              style={{
                background:
                  "linear-gradient(180deg, #f8fafc 0%, #d7e7f7ff 100%)",
                cursor: "pointer",
              }}
            >
              <span
                className="fw-medium"
                style={{ color: "#1f3a5f", fontSize: 15 }}
              >
                {item.q}
              </span>

              <span
                style={{
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform .25s ease",
                  color: "#5b7bb2",
                  fontSize: 18,
                }}
              >
                ▾
              </span>
            </button>

            {/* Answer */}
            {isOpen && (
              <div
                className="px-4 pt-3 pb-4 text-muted"
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  background: "#ffffff",
                }}
              >
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

import { faqData } from "./data/faqData";
import FabBack from "../components/FabBack";

export default function FAQs() {
  return (
    <div className="container py-4" style={{ marginBottom: 80, maxWidth: 860 }}>
      <FabBack />

      <h1 className="fw-bold mb-4" style={{ color: "#1f3a5f" }}>
        Frequently Asked Questions
      </h1>

      <div className="accordion" id="faqAccordion">
        {faqData.map((item, idx) => (
          <div className="accordion-item border-0 shadow-sm mb-2" key={idx}>
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed fw-medium"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#faq-${idx}`}
              >
                {item.q}
              </button>
            </h2>
            <div
              id={`faq-${idx}`}
              className="accordion-collapse collapse"
              data-bs-parent="#faqAccordion"
            >
              <div className="accordion-body text-muted">{item.a}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

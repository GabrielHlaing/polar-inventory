import FabBack from "../components/FabBack";
import { tutorialData } from "./data/tutorialData";

export default function Tutorial() {
  return (
    <div className="container py-4" style={{ marginBottom: 80, maxWidth: 960 }}>
      <FabBack />

      <h1 className="fw-bold mb-4" style={{ color: "#1f3a5f" }}>
        Tutorials
      </h1>

      {tutorialData.map((section) => (
        <div key={section.id} className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <h4 className="fw-semibold mb-3">{section.title}</h4>

            <ul className="text-muted mb-3">
              {section.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>

            {section.image && (
              <img
                src={section.image}
                alt={section.title}
                className="img-fluid rounded"
                style={{
                  border: "1px solid #e5e7eb",
                }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

import { useState } from "react";
import FabBack from "../components/FabBack";
import { tutorialData } from "./data/tutorialData";

export default function Tutorial() {
  const [openIds, setOpenIds] = useState(new Set());
  const [previewImg, setPreviewImg] = useState(null);

  const toggleSection = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <style>
        {`
        .screenshot-thumb {
        flex: 0 0 auto;
        max-width: 30%;       /* desktop */
      }

      .screenshot-thumb img {
        width: 100%;
        height: auto;
        border-radius: 10px;
        cursor: zoom-in;
        border: 1px solid #e5e7eb;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .screenshot-thumb img:hover {
        transform: scale(1.04);
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.14);
      }

      /* Mobile tuning */
      @media (max-width: 576px) {
        .screenshot-thumb {
          max-width: 50%;
        }
      }

        `}
      </style>
      <div
        className="container py-4"
        style={{ marginBottom: 80, maxWidth: 960 }}
      >
        <FabBack />

        <h1 className="fw-bold mb-4" style={{ color: "#1f3a5f" }}>
          Tutorials
        </h1>

        {tutorialData.map((section) => {
          const isOpen = openIds.has(section.id);

          return (
            <div
              key={section.id}
              className="card shadow-sm border-0 mb-4"
              style={{ borderRadius: 16 }}
            >
              {/* Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-100 text-start border-0 px-4 py-3 d-flex justify-content-between align-items-center"
                style={{
                  background:
                    "linear-gradient(180deg, #f8fafc 0%, #d7e7f7ff 100%)",
                }}
              >
                <span className="fw-semibold" style={{ color: "#1f3a5f" }}>
                  {section.title}
                </span>
                <span
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform .25s ease",
                  }}
                >
                  ▾
                </span>
              </button>

              {/* Body */}
              {isOpen && (
                <div className="card-body px-4 pt-3 pb-4">
                  {/* Steps */}
                  <ul
                    className="text-muted mb-4"
                    style={{ lineHeight: 1.7, fontSize: 14 }}
                  >
                    {section.steps.map((step, i) => (
                      <li key={i} className="mb-1">
                        {step}
                      </li>
                    ))}
                  </ul>

                  {/* Screenshots */}
                  {Array.isArray(section.image) && (
                    <div className="d-flex flex-wrap gap-3 justify-content-center mb-3">
                      {section.image.map((img, i) => (
                        <div key={i} className="screenshot-thumb">
                          <img
                            src={img}
                            alt={`${section.title} screenshot ${i + 1}`}
                            onClick={() => setPreviewImg(img)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Image Preview Modal */}
      {previewImg && (
        <div
          onClick={() => setPreviewImg(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.85)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <img
            src={previewImg}
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              borderRadius: 12,
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}
          />

          {/* Close button */}
          <button
            onClick={() => setPreviewImg(null)}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              borderRadius: "50%",
              width: 36,
              height: 36,
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}

import { Link } from "react-router-dom";
import { BiSolidDevices } from "react-icons/bi";
import { BsPlusCircle, BsLightningCharge } from "react-icons/bs";

export default function Pricing() {
  // 🔁 Promotion config (future-proof)
  const PROMOTION = {
    active: true,
    label: "Kick-off Sale",
    discountPercent: 40,
    note: "Limited time debut offer 🎉",
  };

  const discount = (price) =>
    Math.round(price * (1 - PROMOTION.discountPercent / 100));

  return (
    <>
      {/* Animations & polish */}
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

         @keyframes glowPulse {
            0%, 100% {
              filter: drop-shadow(0 0 0 rgba(96,165,250,0));
            }
            50% {
              filter: drop-shadow(0 0 18px rgba(0, 98, 255, 0.55));
            }
          }

          .promo-hero {
            background: linear-gradient(
              110deg,
              #1e3a8a   20%,
              #4079f3ff  40%,
              #1e3a8a 60%
            );
            color: white;
            position: relative;
            z-index: 1;
            background-size: 200% 100%;
            animation: shimmer 4s linear infinite, glowPulse 2.5s ease-in-out infinite;
            border-radius: 16px;
            padding: 20px;
            border: 1px solid #082882ff;
          }

          

          .pricing-card {
            transition: transform 0.25s ease, box-shadow 0.25s ease;
            position: relative;
            overflow: visible;
          }

          .pricing-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 18px 40px rgba(0,0,0,0.15);
          }

          .discount-badge {
            position: absolute;
            top: 14px;
            right: 14px;
            background: linear-gradient(135deg, #2563eb, #60a5fa);
            color: white;
            padding: 6px 10px;
            font-size: 0.7rem;
            font-weight: 600;
            border-radius: 999px;
            animation: glowPulse 2.5s ease-in-out infinite;
          }
        `}
      </style>

      <div className="container mt-3" style={{ maxWidth: 980 }}>
        {/* Page header */}
        <div className="mb-4">
          <h1 className="fw-bold mb-1" style={{ color: "#1f3a5f" }}>
            Pricing & Offers
          </h1>
          <p className="text-muted">
            Affordable pricing designed for small and medium businesses
          </p>
        </div>

        {/* Promotion banner */}
        {PROMOTION.active && (
          <div className="promo-hero mb-5">
            <div className="d-flex align-items-center gap-3">
              <BsLightningCharge size={26} className="text-warning" />
              <div>
                <h3
                  className="fw-bold mb-1"
                  style={{
                    fontFamily: "Kalam",
                    textShadow: "2px 2px 4px rgba(46, 172, 18, 0.5)",
                  }}
                >
                  {PROMOTION.label}
                </h3>
                <p className="mb-0">
                  Enjoy <strong>{PROMOTION.discountPercent}% OFF</strong> on all
                  plans — {PROMOTION.note}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing cards */}
        <div className="row">
          {/* Default plan */}
          <div className="col-12 col-md-6 mb-4">
            <div
              className="card pricing-card border-0 h-100"
              style={{
                background: "linear-gradient(180deg, #dce9ff 0%, #f4f7fc 100%)",
              }}
            >
              {PROMOTION.active && (
                <div className="discount-badge">
                  -{PROMOTION.discountPercent}%
                </div>
              )}

              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <BiSolidDevices size={22} />
                  <h5 className="fw-semibold mb-0">Default Plan</h5>
                </div>

                <p className="text-muted small mb-3">
                  Includes up to <strong>3 devices</strong>
                </p>

                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <strong>1 Month:</strong>{" "}
                    {PROMOTION.active ? (
                      <>
                        <span className="text-decoration-line-through text-muted me-2">
                          25,000 Ks
                        </span>
                        <span className="fw-bold text-primary">
                          {discount(25000)} Ks
                        </span>
                      </>
                    ) : (
                      "25,000 Ks"
                    )}
                  </li>

                  <li className="mb-2">
                    <strong>6 Months:</strong>{" "}
                    {PROMOTION.active ? (
                      <>
                        <span className="text-decoration-line-through text-muted me-2">
                          140,000 Ks
                        </span>
                        <span className="fw-bold text-primary">
                          {discount(140000)} Ks
                        </span>
                      </>
                    ) : (
                      "140,000 Ks"
                    )}
                  </li>

                  <li>
                    <strong>1 Year:</strong>{" "}
                    {PROMOTION.active ? (
                      <>
                        <span className="text-decoration-line-through text-muted me-2">
                          250,000 Ks
                        </span>
                        <span className="fw-bold text-primary">
                          {discount(250000)} Ks
                        </span>
                      </>
                    ) : (
                      "250,000 Ks"
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Extra device */}
          <div className="col-12 col-md-6 mb-4">
            <div
              className="card pricing-card border-0 h-100"
              style={{
                background: "linear-gradient(180deg, #fff1dd 0%, #faf6f0 100%)",
              }}
            >
              {PROMOTION.active && (
                <div className="discount-badge">
                  -{PROMOTION.discountPercent}%
                </div>
              )}

              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <BsPlusCircle size={20} className="text-primary" />
                  <h5 className="fw-semibold mb-0">Extra Device</h5>
                </div>

                <p className="text-muted small mb-3">
                  Add <strong>1 additional device</strong>
                </p>

                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <strong>1 Month:</strong>{" "}
                    {PROMOTION.active ? (
                      <>
                        <span className="text-decoration-line-through text-muted me-2">
                          5,000 Ks
                        </span>
                        <span className="fw-bold text-primary">
                          {discount(5000)} Ks
                        </span>
                      </>
                    ) : (
                      "5,000 Ks"
                    )}
                  </li>

                  <li className="mb-2">
                    <strong>6 Months:</strong>{" "}
                    {PROMOTION.active ? (
                      <>
                        <span className="text-decoration-line-through text-muted me-2">
                          28,000 Ks
                        </span>
                        <span className="fw-bold text-primary">
                          {discount(28000)} Ks
                        </span>
                      </>
                    ) : (
                      "28,000 Ks"
                    )}
                  </li>

                  <li>
                    <strong>1 Year:</strong>{" "}
                    {PROMOTION.active ? (
                      <>
                        <span className="text-decoration-line-through text-muted me-2">
                          50,000 Ks
                        </span>
                        <span className="fw-bold text-primary">
                          {discount(50000)} Ks
                        </span>
                      </>
                    ) : (
                      "50,000 Ks"
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note & CTA */}
        <p className="text-muted small mt-3">
          * Promotional prices apply only during the active offer period.
        </p>

        <div className="text-center mt-4">
          <Link
            to="/contact"
            className="btn btn-primary px-4 py-2"
            style={{ borderRadius: 10 }}
          >
            Contact Us to Activate
          </Link>
        </div>
      </div>
    </>
  );
}

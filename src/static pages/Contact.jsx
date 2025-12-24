import FabBack from "../components/FabBack";
import { BsTelephone } from "react-icons/bs";
import { SiViber } from "react-icons/si";
import { FaClock, FaFacebookMessenger, FaTelegram } from "react-icons/fa";
import fbpage from "./data/fbpage.png";

const contactMethods = [
  {
    key: "phone",
    label: "Phone",
    color: "#2563eb",
    icon: BsTelephone,
    items: [
      { label: "Call Admin 1", href: "tel:+959953772926" },
      { label: "Call Admin 2", href: "tel:+959976517080" },
    ],
  },
  {
    key: "viber",
    label: "Viber",
    color: "#7360f2",
    icon: SiViber,
    items: [
      { label: "Chat on Viber", href: "viber://chat?number=%2B959953772926" },
    ],
  },
  {
    key: "telegram",
    label: "Telegram",
    color: "#229ed9",
    icon: FaTelegram,
    items: [
      { label: "DM Admin 1", href: "https://t.me/YiN_NyEiN" },
      { label: "DM Admin 2", href: "https://t.me/Scythe1122" },
    ],
  },
  {
    key: "messenger",
    label: "Messenger",
    color: "#1877f2",
    icon: FaFacebookMessenger,
    items: [
      { label: "Polar Inventory", href: "https://m.me/your_facebook_page" },
    ],
  },
];

export default function Contact() {
  return (
    <>
      {/* Styles */}
      <style>
        {`
          .contact-card {
            background: linear-gradient(180deg, #e8f1fdff 0%, #ffffff 100%);
            border-radius: 18px;
          }

          .contact-row {
          background: white;
            border-radius: 14px;
            transition: background 0.2s ease, transform 0.15s ease;
            box-shadow: 0 12px 18px rgba(0, 0, 0, 0.12);
          }

          .contact-row:hover {
            transform: translateY(-1px);
          }

          .icon-bubble {
            width: 38px;
            height: 38px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .contact-link {
            display: inline-block;
            padding: 6px 10px;
            border-radius: 10px;
            font-weight: 500;
            transition: background 0.15s ease;
          }

          .contact-link:hover {
            background: rgba(37,99,235,0.1);
          }
        `}
      </style>

      <div
        className="container py-4"
        style={{ marginBottom: 80, maxWidth: 880 }}
      >
        <FabBack />

        {/* Page Header */}
        <div className="mb-4">
          <h1 className="fw-bold mb-1" style={{ color: "#1f3a5f" }}>
            Contact Us
          </h1>
          <p className="text-muted">
            Need help, premium access, or device extensions? Our team is happy
            to assist you.
          </p>
        </div>

        {/* Quick Reach Banner */}
        <div
          className="mb-3 px-3 py-2"
          style={{
            borderRadius: 14,
            background: "linear-gradient(90deg, #e0edff, #f6faff)",
            color: "#1f3a5f",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Fastest ways to reach our support team
        </div>

        {/* Contact Methods */}
        <div className="card shadow-sm border-0 contact-card mb-4">
          <div className="card-body px-4 py-3">
            <ul className="list-unstyled mb-0">
              {contactMethods.map(
                ({ key, label, icon: Icon, items, color }) => (
                  <li key={key} className="mb-3">
                    <div className="row contact-row px-2 py-2 align-items-start">
                      {/* Left */}
                      <div className="col-5 d-flex align-items-center gap-2 fw-medium">
                        <div
                          className="icon-bubble"
                          style={{ background: `${color}22` }}
                        >
                          <Icon style={{ color, fontSize: 18 }} />
                        </div>
                        {label}
                      </div>

                      {/* Right */}
                      <div className="col-7">
                        <div className="d-flex flex-column gap-1">
                          {items.map((item, idx) => (
                            <a
                              key={idx}
                              href={item.href}
                              target="_blank"
                              rel="noreferrer"
                              className="contact-link text-decoration-none"
                              style={{ color }}
                            >
                              {item.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Facebook Preview */}
        <div
          className="card shadow-sm border-0"
          style={{ borderRadius: 18, overflow: "hidden" }}
        >
          <div
            style={{
              height: 4,
              background: "#1877f2",
            }}
          />
          <div className="card-body px-4 py-3">
            <h5 className="fw-semibold mb-3" style={{ color: "#1f3a5f" }}>
              Official Facebook Page
            </h5>

            <div className="d-flex justify-content-center">
              <img
                src={fbpage}
                alt="Facebook page preview"
                className="img-fluid rounded"
                style={{
                  maxWidth: "70%",
                  border: "1px solid #ced1d6ff",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-muted small">
          <FaClock /> We usually reply within <strong>24–48 hours</strong> on
          business days.
        </p>
      </div>
    </>
  );
}

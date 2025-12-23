import FabBack from "../components/FabBack";
import { BsTelephone } from "react-icons/bs";
import { SiViber } from "react-icons/si";
import { FaFacebookMessenger, FaTelegram } from "react-icons/fa";
import fbpage from "./data/fbpage.png";

const contactMethods = [
  {
    key: "phone",
    label: "Phone",
    icon: BsTelephone,
    items: [
      {
        label: "Admin 1",
        href: "tel:+959123456789",
      },
      {
        label: "Admin 2",
        href: "tel:+959123456789",
      },
    ],
  },
  {
    key: "viber",
    label: "Viber",
    icon: SiViber,
    items: [
      {
        label: "Chat on Viber",
        href: "viber://chat?number=%2B959123456789",
      },
    ],
  },
  {
    key: "telegram",
    label: "Telegram",
    icon: FaTelegram,
    items: [
      {
        label: "Admin 1",
        href: "https://t.me/admin1_username",
      },
      {
        label: "Admin 2",
        href: "https://t.me/admin2_username",
      },
    ],
  },
  {
    key: "messenger",
    label: "Messenger",
    icon: FaFacebookMessenger,
    items: [
      {
        label: "Polar Inventory",
        href: "https://m.me/your_facebook_page",
      },
    ],
  },
];

export default function Contact() {
  return (
    <div className="container py-4" style={{ marginBottom: 80, maxWidth: 860 }}>
      <FabBack />

      <h1
        className="fw-bold mb-3"
        style={{ color: "#1f3a5f", letterSpacing: "0.3px" }}
      >
        Contact Us
      </h1>

      <p className="text-muted mb-4">
        If you need help or have any questions, feel free to reach out to us via
        the following platforms.
      </p>

      {/* Contact Methods */}
      <div
        className="card shadow-sm border-0 mb-4"
        style={{ borderRadius: 16 }}
      >
        <div className="card-body px-4 py-3">
          <ul className="list-unstyled mb-0">
            {contactMethods.map(({ key, label, icon: Icon, items }) => (
              <li key={key} className="mb-3">
                <div className="row align-items-start">
                  {/* Left: label */}
                  <div className="col-5 fw-medium d-flex align-items-center">
                    <Icon
                      className="me-2 text-primary"
                      style={{
                        fontSize: 18,
                        flexShrink: 0, // 🔑 important
                      }}
                    />
                    {label}:
                  </div>

                  {/* Right: contacts */}
                  <div className="col-7">
                    <div className="d-flex flex-column gap-1">
                      {items.map((item, idx) => (
                        <a
                          key={idx}
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-decoration-none"
                          style={{ color: "#1f5fbf", fontWeight: 500 }}
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Facebook Screenshot Placeholder */}
      <div className="card shadow-sm border-0" style={{ borderRadius: 16 }}>
        <div className="card-body px-4 py-3">
          <h5 className="fw-semibold mb-3" style={{ color: "#1f3a5f" }}>
            Facebook Page
          </h5>

          <div className="d-flex justify-content-center">
            <img
              src={fbpage}
              alt="Facebook page preview"
              className="img-fluid rounded"
              style={{
                maxWidth: "100%",
                border: "1px solid #e5e7eb",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              }}
            />
          </div>
        </div>
      </div>

      <p className="mt-4 text-muted small">
        We usually reply within <strong>24–48 hours</strong> during business
        days.
      </p>
    </div>
  );
}

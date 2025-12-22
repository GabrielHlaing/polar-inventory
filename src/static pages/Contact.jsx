import FabBack from "../components/FabBack";
import { BsTelephone } from "react-icons/bs";
import { SiViber } from "react-icons/si";
import { FaFacebookMessenger, FaTelegram } from "react-icons/fa";
import fbpage from "./data/fbpage.png";

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
            {/* Phone */}
            <li className="d-flex align-items-center mb-3">
              <span className="fw-medium me-2">
                <BsTelephone
                  className="me-2 text-primary"
                  style={{ fontSize: 18 }}
                />{" "}
                Phone:
              </span>
              <a
                href="tel:+959123456789"
                className="text-decoration-none"
                style={{ color: "#1f5fbf" }}
              >
                +95 9 123 456 789
              </a>
            </li>

            {/* Viber */}
            <li className="d-flex align-items-center mb-3">
              <span className="fw-medium me-2">
                <SiViber
                  className="me-2 text-primary"
                  style={{ fontSize: 18 }}
                />{" "}
                Viber:
              </span>
              <a
                href="viber://chat?number=%2B959123456789"
                className="text-decoration-none"
                style={{ color: "#1f5fbf" }}
              >
                Chat on Viber
              </a>
            </li>

            {/* Telegram */}
            <li className="d-flex align-items-center mb-3">
              <span className="fw-medium me-2">
                <FaTelegram
                  className="me-2 text-primary"
                  style={{ fontSize: 18 }}
                />{" "}
                Telegram:
              </span>
              <a
                href="https://t.me/your_telegram_username"
                target="_blank"
                rel="noreferrer"
                className="text-decoration-none"
                style={{ color: "#1f5fbf" }}
              >
                @your_telegram_username
              </a>
            </li>

            {/* Facebook */}
            <li className="d-flex align-items-center">
              <span className="fw-medium me-2">
                <FaFacebookMessenger
                  className="me-2 text-primary"
                  style={{ fontSize: 18 }}
                />{" "}
                Messenger:
              </span>
              <a
                href="https://m.me/your_facebook_page"
                target="_blank"
                rel="noreferrer"
                className="text-decoration-none"
                style={{ color: "#1f5fbf" }}
              >
                Message us on Facebook
              </a>
            </li>
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

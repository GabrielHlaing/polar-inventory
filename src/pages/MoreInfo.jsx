import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import {
  BsBook,
  BsChatDots,
  BsPlusCircle,
  BsQuestionCircle,
} from "react-icons/bs";
import { BiSolidDevices } from "react-icons/bi";

export default function MoreInfo() {
  return (
    <>
      {/* Card polish styles */}
      <style>
        {`
          .info-card {
            position: relative;
            overflow: hidden;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
          }

          .info-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
          }

          .info-card::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            height: 4px;
            width: 100%;
            background: var(--accent);
          }

          .info-icon {
            font-size: 1.75rem;
            color: var(--accent);
          }
        `}
      </style>

      <div
        className="container py-4"
        style={{
          marginBottom: 80,
          maxWidth: 960,
        }}
      >
        <Header />
        <Navbar />

        {/* Page header */}
        <div className="mb-4">
          <h1 className="fw-bold mb-1" style={{ color: "#1f3a5f" }}>
            More Information
          </h1>
          <p className="text-muted">
            Everything you need to get started and stay productive
          </p>
        </div>

        {/* Cards grid */}
        <div className="row mb-5">
          {/* Tutorial */}
          <div className="col-12 col-md-6 mb-3">
            <div
              className="card info-card border-0 shadow-md h-100"
              style={{ "--accent": "#2563eb", background: "#dfe8fdff" }}
            >
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="info-icon">
                    <BsBook />
                  </div>
                  <h5 className="mb-0 fw-semibold">Tutorial</h5>
                </div>
                <p className="text-muted">
                  Learn how to use Polar Inventory step-by-step, from setup to
                  daily operations.
                </p>
                <Link
                  to="/tutorial"
                  className="btn btn-sm fw-medium"
                  style={{
                    background: "#2563eb",
                    color: "#fff",
                    borderRadius: 10,
                    border: "none",
                  }}
                >
                  View Tutorial
                </Link>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="col-12 col-md-6 mb-3">
            <div
              className="card info-card border-0 shadow-md h-100"
              style={{ "--accent": "#128410ff", background: "#e4f9e4ff" }}
            >
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="info-icon">
                    <BsChatDots />
                  </div>
                  <h5 className="mb-0 fw-semibold">Contact</h5>
                </div>
                <p className="text-muted">
                  Need help, feedback, or technical support? Our team is here to
                  help.
                </p>
                <Link
                  to="/contact"
                  className="btn btn-sm fw-medium"
                  style={{
                    background: "#128410ff",
                    color: "#fff",
                    borderRadius: 10,
                    border: "none",
                  }}
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="col-12 col-md-6 mb-3">
            <div
              className="card info-card border-0 shadow-md h-100"
              style={{ "--accent": "#ad2516ff", background: "#feeeedff" }}
            >
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="info-icon">
                    <BsQuestionCircle />
                  </div>
                  <h5 className="mb-0 fw-semibold">FAQs</h5>
                </div>
                <p className="text-muted">
                  Find quick answers to common questions about features, trials,
                  and data safety.
                </p>
                <Link
                  to="/faqs"
                  className="btn btn-sm fw-medium"
                  style={{
                    background: "#ad2516ff",
                    color: "#fff",
                    borderRadius: 10,
                    border: "none",
                  }}
                >
                  View FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mt-5">
          <h2 className="fw-bold mb-2" style={{ color: "#1f3a5f" }}>
            Pricing
          </h2>
          <p className="text-muted mb-4">
            Transparent pricing designed for small to medium businesses
          </p>

          <div className="row">
            {/* Base Plan */}
            <div className="col-12 col-md-6 mb-3">
              <div
                className="card pricing-card border-0 h-100"
                style={{
                  background:
                    "linear-gradient(180deg, #d8e5fdff 0%, #f4f7fcff 100%)",
                }}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <BiSolidDevices className="text-dark" />
                    <h5 className="fw-semibold mb-0">Default Plan</h5>
                  </div>
                  <p className="text-muted small mb-3">
                    Includes up to <strong>3 devices</strong>
                  </p>

                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <strong>1 Month:</strong> 15,000 Ks
                    </li>
                    <li>
                      <strong>1 Year:</strong> 150,000 Ks
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Extra Device */}
            <div className="col-12 col-md-6 mb-3">
              <div
                className="card pricing-card border-0 h-100"
                style={{
                  background:
                    "linear-gradient(180deg, #f9e7d1ff 0%, #faf6f0ff 100%)",
                }}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <BsPlusCircle className="text-primary" />
                    <h5 className="fw-semibold mb-0">Extra Device</h5>
                  </div>
                  <p className="text-muted small mb-3">
                    Add <strong>1 additional device</strong>
                  </p>

                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <strong>1 Month:</strong> 3,000 Ks
                    </li>
                    <li>
                      <strong>1 Year:</strong> 30,000 Ks
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <p className="text-muted small mt-3">
            * Extra devices are valid for the selected duration and will be
            removed after expiry.
          </p>
        </div>
      </div>
    </>
  );
}

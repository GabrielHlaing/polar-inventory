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
import Pricing from "../components/Pricing";

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
        <div className="row mb-2">
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
                  Wanna extend Premium Time-limit (or) Device Limit? Feel free
                  to contact us!
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

        <div className="bg-secondary" style={{ height: "5px" }}></div>

        {/* Pricing Section */}
        <Pricing />
      </div>
    </>
  );
}

import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import { BsBook, BsChatDots, BsQuestionCircle } from "react-icons/bs";
import Pricing from "../components/Pricing";

export default function MoreInfo() {
  return (
    <>
      <style>
        {`
          .info-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            border-radius: 14px;
          }

          .info-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 28px rgba(0,0,0,0.08);
          }

          .info-icon {
            font-size: 1.5rem;
          }
        `}
      </style>

      <div
        className="container py-4"
        style={{ maxWidth: 1000, marginBottom: 80 }}
      >
        <Header />
        <Navbar />

        {/* Header */}
        <div className="mb-4 text-center text-md-start">
          <h1 className="fw-bold mb-1">More Information</h1>
          <p className="text-muted">
            Resources and support for using the system
          </p>
        </div>

        {/* Cards */}
        <div className="row g-3 mb-4">
          {/* Tutorial */}
          <div className="col-12 col-md-4">
            <div className="card info-card border-0 shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <BsBook className="text-primary info-icon" />
                  <h6 className="mb-0 fw-semibold">Tutorial</h6>
                </div>

                <p className="text-muted small flex-grow-1">
                  Step-by-step guide from setup to daily usage.
                </p>

                <Link
                  to="/tutorial"
                  className="btn btn-sm btn-outline-primary mt-auto"
                >
                  View Tutorial
                </Link>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="col-12 col-md-4">
            <div className="card info-card border-0 shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <BsChatDots className="text-success info-icon" />
                  <h6 className="mb-0 fw-semibold">Contact</h6>
                </div>

                <p className="text-muted small flex-grow-1">
                  Reach out for upgrades, limits, or support.
                </p>

                <Link
                  to="/contact"
                  className="btn btn-sm btn-outline-success mt-auto"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="col-12 col-md-4">
            <div className="card info-card border-0 shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <BsQuestionCircle className="text-danger info-icon" />
                  <h6 className="mb-0 fw-semibold">FAQs</h6>
                </div>

                <p className="text-muted small flex-grow-1">
                  Quick answers about features, trials, and usage.
                </p>

                <Link
                  to="/faqs"
                  className="btn btn-sm btn-outline-danger mt-auto"
                >
                  View FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-4" />

        {/* Pricing */}
        <Pricing />
      </div>
    </>
  );
}

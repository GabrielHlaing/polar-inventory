import { Link } from "react-router-dom";
import { BiSolidDevices } from "react-icons/bi";
import { BsPlusCircle, BsPeople } from "react-icons/bs";

export default function Pricing() {
  return (
    <>
      <div className="container mt-4" style={{ maxWidth: 1000 }}>
        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="fw-bold">Pricing</h2>
          <p className="text-muted small">
            Simple and transparent pricing for your business
          </p>
        </div>

        <div className="row g-4">
          {/* Main Plan */}
          <div className="col-12 col-md-6">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: "linear-gradient(180deg, #eaf2ff 0%, #f7f9fc 100%)",
              }}
            >
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <BiSolidDevices size={22} />
                  <h5 className="fw-semibold mb-0">Main Plan</h5>
                </div>

                <p className="text-muted small mb-3">
                  Includes up to <strong>3 devices</strong>
                </p>

                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <strong>1 Month:</strong> 15,000 Ks
                  </li>
                  <li className="mb-2">
                    <strong>6 Months:</strong> 90,000 Ks
                  </li>
                  <li>
                    <strong>1 Year:</strong> 150,000 Ks
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Extra Device */}
          <div className="col-12 col-md-6">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                background: "linear-gradient(180deg, #fff4e6 0%, #faf6f0 100%)",
              }}
            >
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <BsPlusCircle size={20} />
                  <h5 className="fw-semibold mb-0">Extra Device</h5>
                </div>

                <p className="text-muted small mb-3">
                  Add additional devices to your plan
                </p>

                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <strong>1 Month:</strong> 3,000 Ks
                  </li>
                  <li className="mb-2">
                    <strong>6 Months:</strong> 18,000 Ks
                  </li>
                  <li>
                    <strong>1 Year:</strong> 30,000 Ks
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Staff Accounts */}
          <div className="col-12">
            <div
              className="card border-0 shadow-sm"
              style={{
                background: "linear-gradient(180deg, #e9fbf0 0%, #f6fbf8 100%)",
              }}
            >
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <BsPeople size={22} />
                  <h5 className="fw-semibold mb-0">Staff Accounts</h5>
                </div>

                <p className="text-muted small mb-3">
                  Monthly plan based on active staff.
                </p>

                <div className="fs-5 fw-semibold">
                  5,000 Ks{" "}
                  <span className="text-muted fs-6">/ month per staff</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-5">
          <Link
            to="/contact"
            className="btn btn-primary px-4 py-2"
            style={{ borderRadius: 10 }}
          >
            Contact Us
          </Link>
        </div>
      </div>
    </>
  );
}

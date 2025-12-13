import { Link } from "react-router-dom";

export default function MoreInfo() {
  return (
    <div className="container py-4">
      <h1 className="mb-4">More Information</h1>

      <div className="row">
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title">Tutorial</h4>
              <p className="card-text">
                Learn how to use the app step-by-step.
              </p>
              <Link to="/tutorial" className="btn btn-primary">
                View Tutorial
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title">Contact</h4>
              <p className="card-text">
                Need help or want to reach out to support?
              </p>
              <Link to="/contact" className="btn btn-primary">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

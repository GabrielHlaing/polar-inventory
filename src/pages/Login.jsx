import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logging, setLogging] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const { user, loading, login } = useAuth();

  async function handleLogin(e) {
    e.preventDefault();
    setLogging(true);
    try {
      await login(email, password); // ← from context
      toast.success("Welcome back!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLogging(false);
    }
  }

  useEffect(() => {
    const reason = localStorage.getItem("forced_logout_reason");

    if (reason) {
      toast.info(reason);
      localStorage.removeItem("forced_logout_reason");
    }
  }, []);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, #f6f9fc 0%, #d5e3f1ff 45%, #bad0e7ff 100%)",
      }}
    >
      <div
        className="shadow-sm border-0"
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#ffffff",
          borderRadius: 20,
          padding: "28px 44px",
        }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <img
            src="/Polar-logo.png"
            alt="Polar Inventory"
            height="52"
            className="mb-3"
          />
          <h2
            className="fw-bold mb-1"
            style={{
              color: "#1f3a5f",
              letterSpacing: "0.3px",
            }}
          >
            Polar Inventory
          </h2>
          <p className="text-muted small">
            Manage inventory with clarity and confidence
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} noValidate>
          <div className="mb-3">
            <label className="form-label small fw-medium text-secondary">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                fontSize: 14,
                padding: "10px 12px",
              }}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-medium text-secondary">
              Password
            </label>
            <div className="input-group">
              <input
                type={showPwd ? "text" : "password"}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  fontSize: 14,
                  padding: "10px 12px",
                }}
                required
              />
              <button
                className="btn btn-light border"
                type="button"
                onClick={() => setShowPwd((v) => !v)}
              >
                <i className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`} />
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="d-grid">
            <button
              type="submit"
              className="btn fw-semibold"
              style={{
                backgroundColor: "#1f5fbf",
                color: "#fff",
                borderRadius: 10,
                padding: "11px 0",
                fontSize: 15,
                border: "none",
              }}
              disabled={logging}
            >
              {logging ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Logging in…
                </>
              ) : (
                "Log in"
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-4">
          <span className="text-muted small">Don’t have an account?</span>{" "}
          <button
            className="btn btn-link p-0 fw-medium"
            onClick={() => navigate("/signup")}
            style={{
              fontSize: 14,
              color: "#1f5fbf",
              textDecoration: "none",
            }}
          >
            Create one
          </button>
        </div>
      </div>
    </div>
  );
}

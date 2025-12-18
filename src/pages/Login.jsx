import { useState } from "react";
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
      await login(email, password);
      toast.success("Welcome back!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLogging(false);
    }
  }

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return (
    <>
      {/* Minimal animations & focus polish */}
      <style>
        {`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .auth-card {
            animation: fadeUp 0.5s ease-out;
          }

          .form-control:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 0.15rem rgba(59, 130, 246, 0.2);
          }

          .primary-btn {
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }

          .primary-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(31, 95, 191, 0.25);
          }
        `}
      </style>

      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: "100vh",
          padding: 16,
          background:
            "radial-gradient(circle at top, #f8fbff 0%, #dbe8f6 45%, #c9dff2 100%)",
        }}
      >
        <div
          className="card border-0 shadow-sm auth-card"
          style={{
            width: "100%",
            maxWidth: 480,
            borderRadius: 22,
          }}
        >
          <div className="card-body px-4 px-sm-5 py-4 py-sm-5">
            {/* Header */}
            <div className="text-center mb-4">
              <img
                src="/Polar-logo.png"
                alt="Polar Inventory"
                height="52"
                className="mb-3"
              />
              <h2
                className="fw-semibold mb-1"
                style={{
                  color: "#1f3a5f",
                  letterSpacing: "0.4px",
                }}
              >
                Polar Inventory
              </h2>
              <p className="text-muted small mb-0">
                <i>Sign in to continue</i>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} noValidate>
              <div className="mb-3">
                <label className="form-label small fw-medium text-secondary">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="someone@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    fontSize: 14,
                    padding: "11px 14px",
                    borderRadius: 12,
                  }}
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
                    required
                    style={{
                      fontSize: 14,
                      padding: "11px 14px",
                      borderRadius: "12px 0 0 12px",
                    }}
                  />
                  <button
                    className="btn btn-light border"
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    style={{
                      borderRadius: "0 12px 12px 0",
                    }}
                  >
                    <i
                      className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`}
                    />
                  </button>
                </div>
              </div>

              {/* CTA */}
              <div className="d-grid">
                <button
                  type="submit"
                  className="btn fw-semibold primary-btn"
                  disabled={logging}
                  style={{
                    background: "linear-gradient(135deg, #2563eb, #1f5fbf)",
                    color: "#fff",
                    borderRadius: 14,
                    padding: "12px 0",
                    fontSize: 15,
                    border: "none",
                  }}
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
              <span className="text-muted small">Don't have an account?</span>{" "}
              <button
                className="btn btn-link p-0 fw-medium"
                onClick={() => navigate("/signup", { replace: true })}
                style={{
                  fontSize: 14,
                  color: "#2563eb",
                  textDecoration: "none",
                }}
              >
                Create one
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

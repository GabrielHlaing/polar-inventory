import { useState } from "react";
import { replace, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const navigate = useNavigate();
  const { signup } = useAuth();

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await signup(email, password, name);
      toast.success("Account created!");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Minimal animation & focus styling */}
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
            maxWidth: 520,
            borderRadius: 22,
          }}
        >
          <div className="card-body px-4 px-sm-5 py-4 py-sm-4">
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

              <div className="d-flex flex-wrap align-items-center justify-content-around gap-2 mt-1">
                <span
                  className="badge"
                  style={{
                    background: "linear-gradient(135deg, #0e4ab2ff, #61c1f1ff)",
                    color: "#fff",
                    borderRadius: 20,
                    padding: "4px 10px",
                    fontSize: 12,
                    letterSpacing: "0.4px",
                  }}
                >
                  7-DAY TRIAL
                </span>

                <span
                  className="small"
                  style={{
                    color: "#475569",
                    fontStyle: "italic",
                  }}
                >
                  Create an account to unlock premium features
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSignup} noValidate>
              <div className="mb-3">
                <label className="form-label small fw-medium text-secondary">
                  Username
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    fontSize: 14,
                    padding: "11px 14px",
                    borderRadius: 12,
                  }}
                />
              </div>

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
                    placeholder="Create your password"
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
                  disabled={loading}
                  style={{
                    background: "linear-gradient(135deg, #2563eb, #1f5fbf)",
                    color: "#fff",
                    borderRadius: 14,
                    padding: "12px 0",
                    fontSize: 15,
                    border: "none",
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Creating account…
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="text-center mt-4">
              <span className="text-muted small">Already have an account?</span>{" "}
              <button
                className="btn btn-link p-0 fw-medium"
                onClick={() => navigate("/login", { replace: true })}
                style={{
                  fontSize: 14,
                  color: "#2563eb",
                  textDecoration: "none",
                }}
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

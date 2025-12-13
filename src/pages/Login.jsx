import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate("/");
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm" style={{ width: "100%", maxWidth: 400 }}>
        <div className="card-body p-4">
          <h4
            className="card-title text-center mb-4"
            style={{ color: "#72b3f7" }}
          >
            Log In
          </h4>

          <form onSubmit={handleLogin} noValidate>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Password</label>
              <div className="input-group">
                <input
                  type={showPwd ? "text" : "password"}
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                >
                  <i className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </div>

            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-primary fw-semibold"
                style={{ backgroundColor: "#72b3f7", border: "none" }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Logging in…
                  </>
                ) : (
                  "Log In"
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-3">
            <span className="text-muted">Don't have an account?</span>{" "}
            <button
              className="btn btn-link p-0 align-baseline"
              onClick={() => navigate("/signup")}
              style={{ color: "#72b3f7" }}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

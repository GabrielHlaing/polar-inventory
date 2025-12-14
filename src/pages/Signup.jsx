import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, email } },
    });

    if (signupError) {
      toast.error(signupError.message);
      setLoading(false);
      return;
    }

    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        name,
        email,
        tier: "premium",
        tier_expires_at: expires.toISOString(),
      })
      .eq("id", data.user.id);

    setLoading(false);

    if (updateError) {
      toast.error("Could not update profile.");
      return;
    }

    toast.success("Account created! Please log in.");
    navigate("/login");
  }

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
          maxWidth: 520,
          background: "#ffffff",
          borderRadius: 20,
          padding: "28px 44px",
        }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <img
            src="/polar-logo.png"
            alt="Polar Inventory"
            height="52"
            className="mb-3"
          />
          <h2
            className="fw-semibold mb-1"
            style={{
              color: "#1f3a5f",
              letterSpacing: "0.3px",
            }}
          >
            Create your account
          </h2>
          <p className="text-muted small">
            Manage inventory with clarity and confidence
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} noValidate>
          <div className="mb-3">
            <label className="form-label small fw-medium text-secondary">
              Full name
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                fontSize: 14,
                padding: "10px 12px",
              }}
              required
            />
          </div>

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
                placeholder="Minimum 8 characters"
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
              disabled={loading}
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
            onClick={() => navigate("/login")}
            style={{
              fontSize: 14,
              color: "#1f5fbf",
              textDecoration: "none",
            }}
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}

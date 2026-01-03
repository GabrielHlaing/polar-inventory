import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useProfile } from "../contexts/ProfileContext";
import { useAuth } from "../contexts/AuthContext";
import { Card, Badge, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import { Link } from "react-router-dom";

export default function Profile() {
  const { profile, premiumExpiresAt, isAdmin } = useProfile();
  const { logout } = useAuth();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [loading, setLoading] = useState(false);

  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const isPremium = profile?.tier === "premium";

  const updatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNew) {
      toast.warning("Please fill all fields.");
      return;
    }
    if (newPassword !== confirmNew) {
      toast.warning("New passwords do not match.");
      return;
    }
    setLoading(true);
    // verify old password
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: oldPassword,
    });
    if (loginError) {
      setLoading(false);
      toast.error("Old password is incorrect.");
      return;
    }
    // update
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) toast.error("Failed to update password.");
    else {
      toast.success("Password updated!");
      setOldPassword("");
      setNewPassword("");
      setConfirmNew("");
    }
  };

  function ProfileLoading() {
    return (
      <div className="container py-5" style={{ maxWidth: 520 }}>
        <Card className="border-0 shadow-sm mb-4 overflow-hidden">
          <div
            className="placeholder-glow p-4"
            style={{
              animation: "fadeIn .4s ease",
            }}
          >
            <div className="d-flex justify-content-between mb-3">
              <span className="placeholder col-5 rounded"></span>
              <span className="placeholder col-3 rounded"></span>
            </div>

            <div className="placeholder col-8 mb-2 rounded"></div>
            <div className="placeholder col-6 rounded"></div>
          </div>
        </Card>

        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="placeholder-glow">
              <div className="placeholder col-4 mb-3 rounded"></div>

              <div className="placeholder col-12 mb-3 rounded"></div>
              <div className="placeholder col-12 mb-3 rounded"></div>
              <div className="placeholder col-12 mb-4 rounded"></div>

              <div className="d-flex gap-2">
                <span className="placeholder col-5 rounded-pill"></span>
                <span className="placeholder col-3 rounded-pill"></span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (!profile) return <ProfileLoading />;

  /* ---------- visual helpers ---------- */
  const PremiumCard = ({ children }) => (
    <Card
      className="border-0 shadow-lg mb-4"
      style={{
        background: "linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)",
        boxShadow: "0 0 20px rgba(253, 203, 110, .6)",
        color: "#744210",
      }}
    >
      <Card.Body>{children}</Card.Body>
    </Card>
  );

  const FreeCard = ({ children }) => (
    <Card className="bg-light text-muted border-0 shadow-sm mb-4">
      <Card.Body>{children}</Card.Body>
    </Card>
  );

  const TierBadge = () =>
    isPremium ? (
      <Badge
        bg="warning"
        text="dark"
        className="ms-auto"
        style={{ fontSize: "0.75rem", letterSpacing: ".5px" }}
      >
        ★ PREMIUM
      </Badge>
    ) : (
      <Badge bg="secondary" className="ms-auto">
        Free
      </Badge>
    );

  return (
    <div
      className="container py-4"
      style={{
        maxWidth: 520,
        marginBottom: 80,
      }}
    >
      <Header />
      <Navbar />
      <h1 className="fw-bold mb-4">Profile</h1>

      {/* ---- info card ---- */}
      {isPremium ? (
        <PremiumCard>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold">{profile.name}</span>
            <TierBadge />
          </div>
          <div className="small mb-1">
            Email: <span className="fw-bold">{profile.email}</span>
          </div>
          <div className="small">
            Expires at:{" "}
            <span className="fw-bold">
              {premiumExpiresAt
                ? premiumExpiresAt.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "—"}
            </span>
          </div>
          <div className="small mb-1">
            Device Limit:{" "}
            <span className="fw-bold">{profile.device_limit}</span>
          </div>
        </PremiumCard>
      ) : (
        <FreeCard>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span>{profile.name}</span>
            <TierBadge />
          </div>
          <div className="small">Email: {profile.email}</div>
        </FreeCard>
      )}

      {/* ---- password change ---- */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5 className="fw-semibold mb-3">Change Password</h5>

          <Form.Group className="mb-3">
            <div className="input-group">
              <Form.Control
                type={showOldPwd ? "text" : "password"}
                placeholder="Old password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={loading}
              />
              <Button
                variant="light"
                className="border"
                onClick={() => setShowOldPwd((v) => !v)}
                disabled={loading}
              >
                <i className={`bi ${showOldPwd ? "bi-eye-slash" : "bi-eye"}`} />
              </Button>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <div className="input-group">
              <Form.Control
                type={showNewPwd ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <Button
                variant="light"
                className="border"
                onClick={() => setShowNewPwd((v) => !v)}
                disabled={loading}
              >
                <i className={`bi ${showNewPwd ? "bi-eye-slash" : "bi-eye"}`} />
              </Button>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <div className="input-group">
              <Form.Control
                type={showConfirmPwd ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmNew}
                onChange={(e) => setConfirmNew(e.target.value)}
                disabled={loading}
              />
              <Button
                variant="light"
                className="border"
                onClick={() => setShowConfirmPwd((v) => !v)}
                disabled={loading}
              >
                <i
                  className={`bi ${showConfirmPwd ? "bi-eye-slash" : "bi-eye"}`}
                />
              </Button>
            </div>
          </Form.Group>

          <Button
            variant={isPremium ? "warning" : "secondary"}
            className="rounded-pill px-4 me-2"
            onClick={updatePassword}
            disabled={loading}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Update Password"
            )}
          </Button>

          <Button variant="outline-dark" size="sm" onClick={logout}>
            Log out
          </Button>
        </Card.Body>
      </Card>

      {isAdmin && (
        <Link
          to="/admin"
          className="btn btn-danger btn-sm rounded-pill mx-4 mt-4"
        >
          Admin Panel
        </Link>
      )}
    </div>
  );
}

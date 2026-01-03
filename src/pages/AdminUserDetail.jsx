// AdminUserDetail.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Button, Form, Card, Badge, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import FabBack from "../components/FabBack";

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [working, setWorking] = useState(false);

  const [showExtend, setShowExtend] = useState(false);
  const [pickedDate, setPickedDate] = useState("");
  const [pickedTime, setPickedTime] = useState("");
  const [computedDays, setComputedDays] = useState(0);
  const [computedTargetISO, setComputedTargetISO] = useState(null);

  const [showDevice, setShowDevice] = useState(false);
  const [newLimit, setNewLimit] = useState(3);

  const load = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Failed to load user");
      navigate("/admin");
    } else {
      setUser(data);
      setNewLimit(data.device_limit ?? 3);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  /* ---------- premium logic ---------- */

  const openExtendModal = () => {
    const from = user?.tier_expires_at
      ? parseISO(user.tier_expires_at)
      : new Date();

    const iso = new Date(from);

    const d = iso.toISOString().slice(0, 10);
    const t = `${String(iso.getHours()).padStart(2, "0")}:${String(
      iso.getMinutes()
    ).padStart(2, "0")}`;

    setPickedDate(d);
    setPickedTime(t);
    computeDiff(d, t);
    setShowExtend(true);
  };

  const computeDiff = (dateStr, timeStr) => {
    const [yyyy, mm, dd] = dateStr.split("-");
    const [hh = "00", min = "00"] = timeStr.split(":");

    const target = new Date(yyyy, mm - 1, dd, hh, min, 0);
    const base =
      user?.tier === "premium" && user?.tier_expires_at
        ? parseISO(user.tier_expires_at)
        : new Date();

    setComputedDays(Math.round((target - base) / 86400000));
    setComputedTargetISO(target.toISOString());
  };

  const confirmExtend = async () => {
    await supabase
      .from("profiles")
      .update({
        tier: "premium",
        tier_expires_at: computedTargetISO,
      })
      .eq("id", user.id);

    toast.success("Premium extended");
    setShowExtend(false);
    load();
  };

  const demoteUser = async () => {
    if (!window.confirm("Demote this user to free?")) return;

    await supabase
      .from("profiles")
      .update({ tier: "free", tier_expires_at: null })
      .eq("id", user.id);

    toast.info("User demoted to free");
    load();
  };

  const confirmDeviceLimit = async () => {
    await supabase
      .from("profiles")
      .update({ device_limit: newLimit })
      .eq("id", user.id);

    toast.success("Device limit updated");
    setShowDevice(false);
    load();
  };

  const deleteUser = async () => {
    if (!window.confirm("Delete this user permanently?")) return;

    setWorking(true);
    await supabase.functions.invoke("admin-delete-user", {
      body: { user_id: user.id },
    });

    toast.success("User deleted permanently");
    navigate("/admin");
  };

  if (!user) return null;

  return (
    <div className="container py-4" style={{ maxWidth: 700 }}>
      <FabBack />
      <h1 className="fw-bold mb-4">User Details</h1>

      <Card className="shadow-sm border-0">
        <Card.Body>
          {/* Header */}
          <div className="mb-4">
            <h6 className="fw-bold mb-1">{user.email}</h6>
          </div>

          {/* Info grid */}
          <Row className="g-3 mb-4">
            {/* Username */}
            <Col md={6}>
              <div className="p-3 rounded bg-light h-100">
                <div className="text-muted small mb-1">Username</div>
                <div className="fw-semibold">
                  {user.name || <span className="text-muted">—</span>}
                </div>
              </div>
            </Col>

            {/* Tier */}
            <Col md={6}>
              <div className="p-3 rounded bg-light h-100">
                <div className="text-muted small mb-1">Subscription Tier</div>
                <Badge
                  bg={user.tier === "premium" ? "warning" : "secondary"}
                  text={user.tier === "premium" ? "dark" : ""}
                >
                  {user.tier}
                </Badge>
              </div>
            </Col>

            {/* Expiry */}
            <Col md={6}>
              <div className="p-3 rounded bg-light h-100">
                <div className="text-muted small mb-1">Expiry</div>
                <div className="fw-semibold">
                  {user.tier_expires_at
                    ? new Date(user.tier_expires_at).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )
                    : "—"}
                </div>
              </div>
            </Col>

            {/* Device limit */}
            <Col md={6}>
              <div className="p-3 rounded bg-light h-100">
                <div className="text-muted small mb-1">Device Limit</div>
                <div className="fw-semibold">
                  {user.device_limit ?? 3} devices
                </div>
              </div>
            </Col>
          </Row>

          {/* Actions */}
          <div className="d-flex flex-wrap gap-2 pt-2 border-top">
            <Button
              size="sm"
              variant="outline-primary"
              onClick={openExtendModal}
            >
              Extend
            </Button>

            <Button
              size="sm"
              variant="outline-info"
              onClick={() => setShowDevice(true)}
            >
              Devices
            </Button>

            {user.tier === "premium" && (
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={demoteUser}
              >
                Demote
              </Button>
            )}

            <Button
              size="sm"
              variant="outline-danger"
              disabled={working}
              onClick={deleteUser}
            >
              Delete
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* ---------- Extend Modal ---------- */}
      <Modal show={showExtend} onHide={() => setShowExtend(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Extend Premium</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            <strong>User:</strong> {user.email}
          </p>

          <p className="mb-2">
            <strong>Current expiry:</strong>{" "}
            {user.tier_expires_at
              ? new Date(user.tier_expires_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : "Not premium"}
          </p>

          <Form.Label>Pick new expiry</Form.Label>
          <Row className="g-2 mb-3">
            <Col>
              <Form.Control
                type="date"
                value={pickedDate}
                onChange={(e) => {
                  setPickedDate(e.target.value);
                  computeDiff(e.target.value, pickedTime);
                }}
              />
            </Col>
            <Col>
              <Form.Control
                type="time"
                value={pickedTime}
                onChange={(e) => {
                  setPickedTime(e.target.value);
                  computeDiff(pickedDate, e.target.value);
                }}
              />
            </Col>
          </Row>

          <p className="mb-1">
            <strong>New expiry:</strong>{" "}
            {computedTargetISO
              ? format(parseISO(computedTargetISO), "dd-MM-yyyy HH:mm")
              : "-"}
          </p>

          <p className="mb-0">
            <strong>Change:</strong> {computedDays >= 0 ? "+" : "-"}
            {Math.abs(computedDays)} day
            {Math.abs(computedDays) !== 1 ? "s" : ""}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowExtend(false)}
          >
            Cancel
          </Button>
          <Button size="sm" variant="primary" onClick={confirmExtend}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ---------- Device Modal ---------- */}
      <Modal show={showDevice} onHide={() => setShowDevice(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Device Limit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            <strong>User:</strong> {user.email}
          </p>

          <Form.Label>Maximum devices</Form.Label>
          <Form.Control
            type="number"
            min="1"
            max="10"
            value={newLimit}
            onChange={(e) => setNewLimit(Number(e.target.value))}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDevice(false)}
          >
            Cancel
          </Button>
          <Button size="sm" variant="primary" onClick={confirmDeviceLimit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

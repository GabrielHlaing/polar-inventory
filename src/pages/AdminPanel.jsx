import { useEffect, useState, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { useProfile } from "../contexts/ProfileContext";
import { format, parseISO } from "date-fns";
import {
  Modal,
  Button,
  Form,
  Card,
  Badge,
  Row,
  Col,
  ToastContainer,
  ButtonGroup,
} from "react-bootstrap";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Header from "../components/Header";

export default function AdminPanel() {
  const { isAdmin } = useProfile();

  /* ---------- state ---------- */
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showExtend, setShowExtend] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [pickedDate, setPickedDate] = useState("");
  const [pickedTime, setPickedTime] = useState("");
  const [computedDays, setComputedDays] = useState(0);
  const [computedTargetISO, setComputedTargetISO] = useState(null);
  const [showDevice, setShowDevice] = useState(false);
  const [deviceTarget, setDeviceTarget] = useState(null);
  const [newLimit, setNewLimit] = useState(3);

  /* ---------- data ---------- */
  const load = async () => {
    setLoading(true);
    let query = supabase.from("profiles").select("*");
    if (search.trim() !== "")
      query = query.ilike("email", `%${search.trim()}%`);
    const { data, error } = await query.order("tier", { ascending: true });
    if (error) {
      toast.error("Failed to load users");
      setUsers([]);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [search]);

  const nonAdminUsers = useMemo(
    () => users.filter((u) => !u.is_admin),
    [users]
  );
  const premiumUsers = useMemo(() => {
    return nonAdminUsers
      .filter((u) => u.tier === "premium")
      .sort((a, b) => {
        if (!a.tier_expires_at) return 1;
        if (!b.tier_expires_at) return -1;
        return new Date(a.tier_expires_at) - new Date(b.tier_expires_at);
      });
  }, [nonAdminUsers]);

  const freeUsers = useMemo(
    () => nonAdminUsers.filter((u) => u.tier !== "premium"),
    [nonAdminUsers]
  );

  /* ---------- extend modal ---------- */
  const openExtendModal = (user) => {
    setTargetUser(user);
    const from = user?.tier_expires_at
      ? parseISO(user.tier_expires_at)
      : new Date();
    const iso = new Date(from);
    setPickedDate(iso.toISOString().slice(0, 10));
    setPickedTime(
      `${String(iso.getHours()).padStart(2, "0")}:${String(
        iso.getMinutes()
      ).padStart(2, "0")}`
    );
    computeDiff(
      iso.toISOString().slice(0, 10),
      `${String(iso.getHours()).padStart(2, "0")}:${String(
        iso.getMinutes()
      ).padStart(2, "0")}`,
      user
    );
    setShowExtend(true);
  };

  const computeDiff = (dateStr, timeStr, user) => {
    if (!dateStr) return setComputedDays(0);
    const [yyyy, mm, dd] = dateStr.split("-");
    const [hh = "00", min = "00"] = (timeStr || "").split(":");
    const target = new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(hh),
      Number(min),
      0
    );
    const base =
      user?.tier === "premium" && user?.tier_expires_at
        ? parseISO(user.tier_expires_at)
        : new Date();
    const diffDays = Math.round((target - base) / (24 * 60 * 60 * 1000));
    setComputedDays(diffDays);
    setComputedTargetISO(target.toISOString());
  };

  const confirmExtend = async () => {
    if (!targetUser || !pickedDate) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ tier: "premium", tier_expires_at: computedTargetISO })
        .eq("id", targetUser.id);
      if (error) throw error;
      toast.success("Premium extended");
      await load();
      setShowExtend(false);
      setTargetUser(null);
    } catch {
      toast.error("Extension failed");
    }
  };

  const demoteUser = async (id) => {
    const confirmed = await new Promise((res) =>
      window.confirm("Demote this user to free?") ? res(true) : res(false)
    );
    if (!confirmed) return;
    await supabase
      .from("profiles")
      .update({ tier: "free", tier_expires_at: null })
      .eq("id", id);
    toast.info("User demoted to free");
    load();
  };

  const deleteUser = async (id) => {
    const confirmed = await new Promise((res) =>
      window.confirm("Delete this user permanently?") ? res(true) : res(false)
    );
    if (!confirmed) return;
    await supabase.from("profiles").delete().eq("id", id);
    toast.info("User deleted");
    load();
  };

  // Device increase/decrease modal
  const openDeviceModal = (u) => {
    setDeviceTarget(u);
    setNewLimit(u.device_limit ?? 3);
    setShowDevice(true);
  };

  const confirmDeviceLimit = async () => {
    if (!deviceTarget) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ device_limit: newLimit })
        .eq("id", deviceTarget.id);
      if (error) throw error;
      toast.success("Device limit updated");
      await load();
      setShowDevice(false);
    } catch {
      toast.error("Update failed");
    }
  };

  if (!isAdmin)
    return <p className="p-4 text-center text-muted">Access denied.</p>;

  /* ---------- visual helpers ---------- */
  const GlassCard = ({ children }) => (
    <Card
      className="border-0 shadow-sm mb-4"
      style={{
        background: "rgba(232, 241, 246, 0.75)",
        backdropFilter: "blur(6px)",
      }}
    >
      <Card.Body>{children}</Card.Body>
    </Card>
  );

  const PremiumButton = ({ children, onClick, variant = "warning" }) => (
    <Button
      variant={variant}
      onClick={onClick}
      className="rounded-pill px-3"
      style={
        variant === "warning"
          ? {
              background: "linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)",
              border: "none",
              boxShadow: "0 0 12px rgba(253, 203, 110, .6)",
              color: "#744210",
            }
          : {}
      }
    >
      {children}
    </Button>
  );

  /* ---------- render ---------- */
  return (
    <div className="container py-4" style={{ maxWidth: 900, marginBottom: 80 }}>
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="fw-bold">Admin Panel</h1>
        </Col>
        <Col xs="auto">
          <Button variant="outline-secondary" size="sm" onClick={load}>
            Refresh
          </Button>
        </Col>
      </Row>

      <GlassCard>
        <Row className="g-2 align-items-center">
          <Col xs={12} md={8}>
            <Form.Control
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-pill"
            />
          </Col>
          <Col xs={12} md={4} className="d-flex gap-2 justify-content-start">
            <Badge bg="secondary">{users.length} users</Badge>
            <Badge bg="success">{premiumUsers.length} premium</Badge>
            <Badge bg="secondary">{freeUsers.length} free</Badge>
          </Col>
        </Row>
      </GlassCard>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading users...</div>
      ) : (
        <>
          <h4 className="fw-semibold mb-3">Premium Users</h4>
          <UserTable
            users={premiumUsers}
            onExtend={openExtendModal}
            onDemote={demoteUser}
            onDelete={deleteUser}
            onDevice={openDeviceModal}
          />

          <h4 className="fw-semibold mb-3 mt-5">Free Users</h4>
          <UserTable
            users={freeUsers}
            onExtend={openExtendModal}
            onDemote={demoteUser}
            onDelete={deleteUser}
          />
        </>
      )}

      {/* Extend Modal */}
      <Modal show={showExtend} onHide={() => setShowExtend(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Extend Premium</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {targetUser && (
            <>
              <p className="mb-2">
                <strong>User:</strong> {targetUser.email ?? targetUser.name}
              </p>
              <p className="mb-2">
                <strong>Current expiry:</strong>{" "}
                {targetUser.tier_expires_at
                  ? format(
                      parseISO(targetUser.tier_expires_at),
                      "yyyy-MM-dd HH:mm"
                    )
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
                      computeDiff(e.target.value, pickedTime, targetUser);
                    }}
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="time"
                    value={pickedTime}
                    onChange={(e) => {
                      setPickedTime(e.target.value);
                      computeDiff(pickedDate, e.target.value, targetUser);
                    }}
                  />
                </Col>
              </Row>

              <p className="mb-1">
                <strong>New expiry:</strong>{" "}
                {computedTargetISO
                  ? format(parseISO(computedTargetISO), "yyyy-MM-dd HH:mm")
                  : "-"}
              </p>
              <p className="mb-0">
                <strong>Change:</strong> {computedDays >= 0 ? "+" : "-"}
                {Math.abs(computedDays)} day
                {Math.abs(computedDays) !== 1 ? "s" : ""}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowExtend(false)}
          >
            Cancel
          </Button>
          <PremiumButton onClick={confirmExtend}>Confirm</PremiumButton>
        </Modal.Footer>
      </Modal>

      {/* Device-limit modal */}
      <Modal show={showDevice} onHide={() => setShowDevice(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Device Limit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deviceTarget && (
            <>
              <p className="mb-2">
                <strong>User:</strong> {deviceTarget.email}
              </p>
              <Form.Label>Maximum devices</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="10"
                value={newLimit}
                onChange={(e) => setNewLimit(Number(e.target.value))}
              />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDevice(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={confirmDeviceLimit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

/* ---------- reusable table ---------- */
function UserTable({ users, onExtend, onDemote, onDelete, onDevice }) {
  if (users.length === 0)
    return <Card className="border-0 shadow-sm text-center p-4">No users</Card>;

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Name</th>
            <th className="d-none d-md-table-cell">Email</th>
            <th>Tier</th>
            <th className="d-none d-md-table-cell">Expires</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="text-truncate" style={{ maxWidth: 120 }}>
                {u.name}
              </td>
              <td className="d-none d-md-table-cell text-truncate">
                {u.email ?? "-"}
              </td>
              <td>
                <Badge
                  bg={u.tier === "premium" ? "warning" : "secondary"}
                  text={u.tier === "premium" ? "dark" : ""}
                >
                  {u.tier}
                </Badge>
              </td>
              <td className="d-none d-md-table-cell">
                {u.tier_expires_at
                  ? format(parseISO(u.tier_expires_at), "yyyy-MM-dd")
                  : "-"}
              </td>
              <td>
                <div className="d-flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => onExtend(u)}
                  >
                    Extend
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-info"
                    onClick={() => onDevice(u)}
                  >
                    Devices
                  </Button>
                  {u.tier === "premium" && (
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => onDemote(u.id)}
                    >
                      Demote
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => onDelete(u.id)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

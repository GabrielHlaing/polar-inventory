// AdminPanel.jsx
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { useProfile } from "../contexts/ProfileContext";
import { Card, Badge, Row, Col, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import FabBack from "../components/FabBack";

export default function AdminPanel() {
  const { isAdmin } = useProfile();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const sortByExpiry = (a, b) => {
    // nulls go last
    if (!a.tier_expires_at && !b.tier_expires_at) return 0;
    if (!a.tier_expires_at) return 1;
    if (!b.tier_expires_at) return -1;

    return new Date(a.tier_expires_at) - new Date(b.tier_expires_at);
  };

  const premiumUsers = useMemo(
    () => nonAdminUsers.filter((u) => u.tier === "premium").sort(sortByExpiry),
    [nonAdminUsers]
  );

  const freeUsers = useMemo(
    () => nonAdminUsers.filter((u) => u.tier !== "premium").sort(sortByExpiry),
    [nonAdminUsers]
  );

  if (!isAdmin)
    return <p className="p-4 text-center text-muted">Access denied.</p>;

  return (
    <div className="container py-4" style={{ maxWidth: 900, marginBottom: 80 }}>
      <FabBack />
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="fw-bold">Admin Panel</h1>
        </Col>
        <Col xs="auto">
          <Button size="sm" variant="outline-secondary" onClick={load}>
            Refresh
          </Button>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-2">
            <Col md={8}>
              <Form.Control
                placeholder="Search by email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-pill"
              />
            </Col>
            <Col md={4} className="d-flex gap-2">
              <Badge bg="secondary">{users.length} users</Badge>
              <Badge bg="success">{premiumUsers.length} premium</Badge>
              <Badge bg="secondary">{freeUsers.length} free</Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading users...</div>
      ) : (
        <>
          <h5 className="fw-semibold mb-2">Premium Users</h5>
          <UserTable users={premiumUsers} onOpen={navigate} />

          <h5 className="fw-semibold mt-4 mb-2">Free Users</h5>
          <UserTable users={freeUsers} onOpen={navigate} />
        </>
      )}
    </div>
  );
}

/* ---------- simplified table ---------- */
function UserTable({ users, onOpen }) {
  if (!users.length)
    return <Card className="border-0 shadow-sm p-4 text-center">No users</Card>;

  return (
    <div className="table-responsive mb-3">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th>Email</th>
            <th>Tier</th>
            <th className="d-none d-md-table-cell">Expires</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              style={{ cursor: "pointer" }}
              onClick={() => onOpen(`/admin/${u.id}`)}
            >
              <td className="text-truncate">{u.email}</td>
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
                  ? new Date(u.tier_expires_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

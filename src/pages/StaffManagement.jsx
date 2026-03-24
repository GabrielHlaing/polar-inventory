import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { toast } from "react-toastify";
import { useProfile } from "../contexts/ProfileContext";
import { useAuth } from "../contexts/AuthContext";
import FabBack from "../components/FabBack";
import { Badge, Button, Card } from "react-bootstrap";

export default function StaffManagement() {
  const [staffList, setStaffList] = useState([]);
  const [inviteCode, setInviteCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { businessId } = useProfile();
  const { user } = useAuth();

  const loadStaff = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase.rpc("get_staff_for_owner", {
      v_owner: user.id,
    });

    if (error) {
      console.error(error);
      toast.error(error.message);
      setStaffList([]);
    } else {
      setStaffList(data || []);
    }

    setLoading(false);
  };

  const loadInviteCode = async () => {
    if (!businessId) return;

    const { data, error } = await supabase
      .from("businesses")
      .select("invite_code")
      .eq("id", businessId)
      .single();

    if (error) {
      console.error("Error loading invite code:", error);
      return;
    }

    setInviteCode(data?.invite_code || null);
  };

  const generateInviteCode = () =>
    Math.random().toString(36).slice(2, 8).padEnd(6, "0").toUpperCase();

  const createInviteCode = async () => {
    if (!businessId) return;

    const code = generateInviteCode();

    const { error } = await supabase
      .from("businesses")
      .update({ invite_code: code })
      .eq("id", businessId);

    if (error) throw error;

    return code;
  };

  const generateCode = async () => {
    try {
      const code = await createInviteCode();
      setInviteCode(code);
      toast.success("Invite code updated");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const copyToClipboard = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast.success("Code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const unlinkStaff = async (staffId) => {
    if (!window.confirm("Unlink this staff account?")) return;

    const { error } = await supabase.rpc("unlink_staff", {
      v_staff: staffId,
    });

    if (error) {
      console.error(error);
      toast.error(error.message);
    } else {
      toast.success("Staff unlinked");
      loadStaff();
    }
  };

  useEffect(() => {
    if (user) loadStaff();
  }, [user]);

  useEffect(() => {
    if (businessId) loadInviteCode();
  }, [businessId]);

  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <FabBack />

      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="fw-bold">
          <i className="bi bi-people-fill text-primary me-2"></i>
          Staff Management
        </h3>
        <div className="text-muted small">
          Manage your team and invite new staff
        </div>
      </div>

      {/* Invite Section */}
      <Card
        className="border-0 shadow-sm mb-4"
        style={{ background: "#e3edfb" }}
      >
        <Card.Body>
          <div className="row align-items-center g-3">
            {/* Left info */}
            <div className="col-md-4 d-flex align-items-center gap-3">
              <div
                className="rounded d-flex align-items-center justify-content-center"
                style={{
                  width: 48,
                  height: 48,
                  background: "linear-gradient(135deg, #0d6efd, #6f42c1)",
                  color: "#fff",
                }}
              >
                <i className="bi bi-key-fill"></i>
              </div>

              <div>
                <div className="fw-semibold">Invite Code</div>
                <div className="text-muted small">Share with your staff</div>
              </div>
            </div>

            {/* Code display */}
            <div className="col-md-4 text-center">
              {inviteCode ? (
                <Button
                  variant="dark"
                  onClick={copyToClipboard}
                  className="w-100 border d-flex justify-content-center align-items-center gap-2"
                  style={{
                    fontFamily: "monospace",
                    fontSize: 18,
                    letterSpacing: "0.15em",
                  }}
                >
                  {inviteCode}
                  <i className={`bi ${copied ? "bi-check-lg" : "bi-copy"}`}></i>
                </Button>
              ) : (
                <div className="text-muted">No code</div>
              )}
            </div>

            {/* Action */}
            <div className="col-md-4 text-md-end text-center">
              <Button onClick={generateCode}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Generate Code
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Staff Count */}
      <div className="text-center mb-4">
        <Badge bg="light" text="dark" className="px-3 py-2 shadow-sm">
          <i className="bi bi-person-check-fill me-2 text-primary"></i>
          <strong>{staffList.length}</strong>{" "}
          {staffList.length === 1 ? "Staff Member" : "Staff Members"}
        </Badge>
      </div>

      {/* Staff List */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-4 text-muted">
              <div className="spinner-border mb-2" />
              <div>Loading staff...</div>
            </div>
          ) : staffList.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-people fs-1 mb-2"></i>
              <div className="fw-semibold">No staff members</div>
              <div className="small">Generate an invite code to add staff</div>
            </div>
          ) : (
            <div className="row g-3">
              {staffList.map((s) => (
                <div className="col-12 col-md-6 col-lg-4" key={s.user_id}>
                  <Card
                    className="border-0 h-100"
                    style={{ background: "#eaf0f9" }}
                  >
                    <Card.Body className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10"
                          style={{ width: 40, height: 40 }}
                        >
                          <i className="bi bi-person-fill text-primary"></i>
                        </div>

                        <div>
                          <div className="fw-semibold">{s.name}</div>
                          <div className="text-muted small">{s.email}</div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => unlinkStaff(s.user_id)}
                      >
                        <i className="bi bi-x-lg"></i>
                      </Button>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

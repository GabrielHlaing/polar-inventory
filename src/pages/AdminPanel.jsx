// src/pages/AdminPanel.jsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { useProfile } from "../contexts/ProfileContext";
import { format, parseISO } from "date-fns";
import { Modal, Button, Form } from "react-bootstrap";

export default function AdminPanel() {
  const { isAdmin } = useProfile();

  // local state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Extend modal state
  const [showExtend, setShowExtend] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [pickedDate, setPickedDate] = useState(""); // YYYY-MM-DD
  const [pickedTime, setPickedTime] = useState(""); // HH:MM
  const [computedDays, setComputedDays] = useState(0);
  const [computedTargetISO, setComputedTargetISO] = useState(null);

  // load users
  const load = async () => {
    setLoading(true);
    let query = supabase.from("profiles").select("*");

    if (search.trim() !== "") {
      query = query.ilike("email", `%${search.trim()}%`);
    }

    const { data, error } = await query.order("tier", { ascending: true });
    if (error) {
      console.error("Error loading users:", error);
      setUsers([]);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // you may add realtime subscription here later
  }, [search]);

  // Derived lists (exclude admin accounts from lists)
  const nonAdminUsers = useMemo(
    () => users.filter((u) => u.is_admin !== true),
    [users]
  );

  const premiumUsers = useMemo(() => {
    return nonAdminUsers
      .filter((u) => u.tier === "premium")
      .sort((a, b) => {
        // nulls pushed to end
        if (!a.tier_expires_at) return 1;
        if (!b.tier_expires_at) return -1;
        return new Date(a.tier_expires_at) - new Date(b.tier_expires_at);
      });
  }, [nonAdminUsers]);

  const freeUsers = useMemo(
    () => nonAdminUsers.filter((u) => u.tier !== "premium"),
    [nonAdminUsers]
  );

  // open extend modal
  const openExtendModal = (user) => {
    setTargetUser(user);

    // default picked date/time:
    // if user is premium with expiry -> default to expiry date/time
    // else default to today + current time
    const from = user?.tier_expires_at
      ? parseISO(user.tier_expires_at)
      : new Date();
    const iso = new Date(from);
    const yyyy = iso.toISOString().slice(0, 10); // YYYY-MM-DD
    const hhmm = `${String(iso.getHours()).padStart(2, "0")}:${String(
      iso.getMinutes()
    ).padStart(2, "0")}`;

    setPickedDate(yyyy);
    setPickedTime(hhmm);

    // compute initial diff
    computeDiff(yyyy, hhmm, user);
    setShowExtend(true);
  };

  // compute difference in days between base (current expiry or now) and chosen
  function computeDiff(dateStr, timeStr, user) {
    if (!dateStr) {
      setComputedDays(0);
      setComputedTargetISO(null);
      return;
    }

    // build target datetime local
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

    // difference in days (round to nearest int)
    const diffDays = Math.round((target - base) / (24 * 60 * 60 * 1000));

    setComputedDays(diffDays);
    setComputedTargetISO(target.toISOString());
  }

  // when the admin confirms extension
  const confirmExtend = async () => {
    if (!targetUser || !pickedDate) return;

    // compute final target datetime again (safety)
    const [yyyy, mm, dd] = pickedDate.split("-");
    const [hh = "00", min = "00"] = pickedTime.split(":");
    const target = new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(hh),
      Number(min),
      0
    );

    try {
      // Update profile: set tier to premium, set tier_expires_at to target
      const { error } = await supabase
        .from("profiles")
        .update({
          tier: "premium",
          tier_expires_at: target.toISOString(), // store timestamp
        })
        .eq("id", targetUser.id);

      if (error) throw error;

      // reload list and close modal
      await load();
      setShowExtend(false);
      setTargetUser(null);
    } catch (err) {
      console.error("Error extending user:", err);
      alert("Failed to extend. See console for details.");
    }
  };

  const demoteUser = async (id) => {
    if (!confirm("Demote this user to free?")) return;

    await supabase
      .from("profiles")
      .update({ tier: "free", tier_expires_at: null })
      .eq("id", id);
    load();
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    await supabase.from("profiles").delete().eq("id", id);
    load();
  };

  if (!isAdmin) {
    return <p className="p-4">Access denied.</p>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-3">Admin Panel</h1>

      <div className="mb-4 d-flex gap-2">
        <Form.Control
          value={search}
          placeholder="Search by email..."
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={load}>Refresh</Button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading users...</p>
      ) : (
        <>
          <h2 className="text-lg font-semibold mt-4 mb-2">Premium Users</h2>
          <UserTable
            users={premiumUsers}
            onExtend={openExtendModal}
            onDemote={demoteUser}
            onDelete={deleteUser}
          />

          <h2 className="text-lg font-semibold mt-6 mb-2">Free Users</h2>
          <UserTable
            users={freeUsers}
            onExtend={openExtendModal}
            onDemote={demoteUser}
            onDelete={deleteUser}
          />
        </>
      )}

      {/* Extend Modal */}
      <Modal show={showExtend} onHide={() => setShowExtend(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {targetUser
              ? `Extend premium for ${targetUser.email ?? targetUser.name}`
              : "Extend"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {targetUser && (
            <>
              <p className="text-sm">
                Current tier: <strong>{targetUser.tier}</strong>
              </p>
              <p className="text-sm mb-3">
                Current expiry:{" "}
                <strong>
                  {targetUser.tier_expires_at
                    ? format(
                        parseISO(targetUser.tier_expires_at),
                        "yyyy-MM-dd HH:mm"
                      )
                    : "No expiry (not premium)"}
                </strong>
              </p>

              <Form.Label>Pick new expiry date</Form.Label>
              <div className="d-flex gap-2 mb-2">
                <Form.Control
                  type="date"
                  value={pickedDate}
                  onChange={(e) => {
                    setPickedDate(e.target.value);
                    computeDiff(e.target.value, pickedTime, targetUser);
                  }}
                />
                <Form.Control
                  type="time"
                  value={pickedTime}
                  onChange={(e) => {
                    setPickedTime(e.target.value);
                    computeDiff(pickedDate, e.target.value, targetUser);
                  }}
                />
              </div>

              <p className="text-sm">
                Target expiry:{" "}
                <strong>
                  {computedTargetISO
                    ? format(parseISO(computedTargetISO), "yyyy-MM-dd HH:mm")
                    : "-"}
                </strong>
              </p>

              <p className="text-sm">
                This will{" "}
                <strong>{computedDays >= 0 ? "add" : "remove"}</strong>{" "}
                <strong>{Math.abs(computedDays)}</strong> day
                {Math.abs(computedDays) !== 1 ? "s" : ""}{" "}
                {computedDays >= 0 ? "to" : "from"} the user's current expiry.
              </p>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExtend(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmExtend}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

/** Simple table component */
function UserTable({ users, onExtend, onDemote, onDelete }) {
  return (
    <table className="w-full border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 border">Name</th>
          <th className="p-2 border">Email</th>
          <th className="p-2 border">Tier</th>
          <th className="p-2 border">Expiry (local)</th>
          <th className="p-2 border">Actions</th>
        </tr>
      </thead>

      <tbody>
        {users.map((u) => (
          <tr key={u.id}>
            <td className="p-2 border">{u.name}</td>
            <td className="p-2 border">{u.email ?? "-"}</td>
            <td className="p-2 border">{u.tier}</td>
            <td className="p-2 border">
              {u.tier_expires_at
                ? format(parseISO(u.tier_expires_at), "yyyy-MM-dd HH:mm")
                : "-"}
            </td>
            <td className="p-2 border">
              <Button size="sm" className="me-2" onClick={() => onExtend(u)}>
                Extend
              </Button>

              {u.tier === "premium" && (
                <Button
                  size="sm"
                  variant="warning"
                  className="me-2"
                  onClick={() => onDemote(u.id)}
                >
                  Demote
                </Button>
              )}

              <Button size="sm" variant="danger" onClick={() => onDelete(u.id)}>
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

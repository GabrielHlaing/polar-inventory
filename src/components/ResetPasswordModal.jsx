import { useState } from "react";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { supabase } from "../supabaseClient";

function ResetPasswordModal({ show, onClose, user }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password) return toast.warning("Enter a new password");

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "admin-reset-password",
        {
          body: { user_id: user.id, new_password: password },
        },
      );

      if (error) throw new Error(error.message || "Failed to reset password");

      toast.success("Password reset successfully");
      setPassword("");
      onClose();
    } catch (err) {
      toast.error(err.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Reset Password for {user.email}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Control
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleReset} disabled={loading}>
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            "Reset Password"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ResetPasswordModal;

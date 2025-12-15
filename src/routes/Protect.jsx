import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";

export default function Protect({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { loading: profileLoading } = useProfile();

  if (authLoading || profileLoading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );

  // then decide
  return user ? children : <Navigate to="/login" replace />;
}

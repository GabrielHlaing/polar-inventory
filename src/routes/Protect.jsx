import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Protect({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

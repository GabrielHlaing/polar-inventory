import { Navigate } from "react-router-dom";
import { useProfile } from "../contexts/ProfileContext";

export default function AdminRoute({ children }) {
  const { isAdmin, loading } = useProfile();

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" />
      </div>
    );
  if (!isAdmin) return <Navigate to="*" replace />;

  return children;
}

import { Navigate } from "react-router-dom";
import { useProfile } from "../contexts/ProfileContext";

export default function AdminRoute({ children }) {
  const { isAdmin, loading } = useProfile();

  if (loading) return <p>Loading...</p>;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}

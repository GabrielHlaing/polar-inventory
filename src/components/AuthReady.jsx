import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";

export default function AuthReady({ children }) {
  const { loading: authLoading } = useAuth();
  const { loading: profileLoading } = useProfile();

  // inside AuthReady
  if (authLoading || profileLoading)
    return <div style={{ background: "red", height: 100 }}>LOADING...</div>;
  return children;
}

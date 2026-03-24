import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { toast } from "react-toastify";
import { useProfile } from "../contexts/ProfileContext";
import FabBack from "../components/FabBack";

export default function JoinBusiness() {
  const [code, setCode] = useState("");
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [businessName, setBusinessName] = useState(null);
  const [loadingBusiness, setLoadingBusiness] = useState(false);

  const { profile, reloadProfile } = useProfile();
  const businessId = profile?.business_id || null;

  useEffect(() => {
    if (!businessId) {
      setBusinessName(null);
      setLoadingBusiness(false);
      return;
    }

    setLoadingBusiness(true);
    supabase
      .from("businesses")
      .select("name")
      .eq("id", businessId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          setBusinessName(null);
        } else {
          setBusinessName(data?.name || null);
        }
        setLoadingBusiness(false);
      });
  }, [businessId]);

  const handleJoin = async () => {
    if (!code) return toast.warning("Enter invite code");

    setLoadingJoin(true);

    const { error } = await supabase.rpc("join_business", { v_code: code });

    if (error) {
      console.error(error);
      toast.error(error.message);
    } else {
      toast.success("Joined business successfully");
      await reloadProfile();
    }

    setLoadingJoin(false);
  };

  const isLinked = !!businessId;

  return (
    <div className="container py-5" style={{ maxWidth: 700 }}>
      <FabBack />

      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="fw-bold">
          <i className="bi bi-person-plus-fill me-2 text-primary"></i>
          Join Business
        </h3>
        <div className="text-muted small">
          Connect your account to a business
        </div>
      </div>

      {isLinked ? (
        <div
          className="card border-0 shadow-sm p-4"
          style={{ background: "#e3edfb" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded"
              style={{
                width: 48,
                height: 48,
                background: "linear-gradient(135deg, #0d6efd, #6f42c1)",
                color: "#fff",
              }}
            >
              <i className="bi bi-building"></i>
            </div>

            <div>
              <div className="fw-semibold">Connected to</div>
              <div className="text-muted">
                {loadingBusiness ? "Loading..." : businessName || "—"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm p-4">
          <div className="text-center mb-4">
            <div className="fw-semibold mb-1">Enter Invite Code</div>
            <div className="text-muted small">Ask your owner for the code</div>
          </div>

          <div className="row g-2 justify-content-center">
            {/* Input */}
            <div className="col-12 col-md-7">
              <input
                type="text"
                className="form-control text-center"
                placeholder="XXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                style={{
                  fontFamily: "monospace",
                  letterSpacing: "0.2em",
                  fontSize: 18,
                }}
              />
            </div>

            {/* Button */}
            <div className="col-12 col-md-5 d-grid">
              <button
                className="btn btn-primary"
                onClick={handleJoin}
                disabled={loadingJoin}
              >
                {loadingJoin ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Joining...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    Join Business
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { BsArrowLeft, BsGear } from "react-icons/bs";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #d4e1f9ff 0%, #d3e1f3ff 60%, #ffffff 100%)",
        padding: 16,
      }}
    >
      {/* Animations */}
      <style>
        {`
          @keyframes rotateSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes rotateReverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
        `}
      </style>

      <div className="text-center p-4" style={{ maxWidth: 420 }}>
        {/* Gears */}
        <div
          className="d-flex justify-content-center align-items-center mb-4"
          style={{ height: 80 }}
        >
          <BsGear
            style={{
              fontSize: 48,
              color: "#2563eb",
              animation: "rotateSlow 6s linear infinite",
            }}
          />
          <BsGear
            style={{
              fontSize: 32,
              color: "#7da2f8",
              marginLeft: -6,
              marginTop: 22,
              animation: "rotateReverse 4.5s linear infinite",
            }}
          />
        </div>

        {/* 404 */}
        <h1
          className="fw-bold mb-2"
          style={{
            fontSize: "3.4rem",
            color: "#1f3a5f",
            letterSpacing: "1px",
          }}
        >
          404
        </h1>

        <h5 className="fw-semibold mb-2" style={{ color: "#1f3a5f" }}>
          Page not found
        </h5>

        <p className="text-muted mb-4">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>

        {/* Actions */}
        <div className="d-flex justify-content-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline-primary btn-sm"
            style={{ borderRadius: 10 }}
          >
            <BsArrowLeft className="me-1" />
            Go back
          </button>

          <button
            onClick={() => navigate("/", { replace: true })}
            className="btn btn-primary btn-sm"
            style={{
              borderRadius: 10,
              background: "#2563eb",
              border: "none",
            }}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}

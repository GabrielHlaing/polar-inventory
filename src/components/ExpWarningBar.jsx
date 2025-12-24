import { useNavigate } from "react-router-dom";
import { BsClockHistory } from "react-icons/bs";

export default function ExpiryWarningBar({ daysRemaining }) {
  const navigate = useNavigate();

  return (
    <>
      <style>
        {`
          .exp-bar {
            position: fixed;
            left: 0;
            right: 0;
            overflow: hidden;
          }

          .exp-bar::before {
            content: "";
            position: absolute;
            top: 0;
            left: -40%;
            width: 40%;
            height: 100%;
            background: linear-gradient(
              120deg,
              transparent 0%,
              rgba(255, 255, 255, 0.45) 50%,
              transparent 100%
            );
            animation: shimmer 3.2s ease-in-out infinite;
          }

          @keyframes shimmer {
            0% {
              transform: translateX(0);
            }
            60% {
              transform: translateX(300%);
            }
            100% {
              transform: translateX(300%);
            }
          }
        `}
      </style>
      <div
        onClick={() => navigate("/profile")}
        className="exp-bar fixed-bottom d-flex align-items-center justify-content-center"
        style={{
          bottom: 62,
          height: 38,
          background:
            "linear-gradient(90deg, #ffe6b3 0%, #ffd27a 50%, #ffcc66 100%)",
          color: "#3a2a00",
          fontSize: "0.78rem",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 -4px 14px rgba(0,0,0,0.15)",
          zIndex: 1051,
        }}
      >
        <BsClockHistory className="me-2" />
        Premium expires in {daysRemaining} day
        {daysRemaining > 1 ? "s" : ""} • Tap to see expiry details
      </div>
    </>
  );
}

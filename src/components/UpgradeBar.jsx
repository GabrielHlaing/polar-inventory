import { useNavigate } from "react-router-dom";
import { BsLightningCharge } from "react-icons/bs";

export default function UpgradeBar() {
  const navigate = useNavigate();

  return (
    <>
      <style>
        {`
          .upgrade-bar {
            position: fixed;
            left: 0;
            right: 0;
            overflow: hidden;
          }

          .upgrade-bar::before {
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
        onClick={() => navigate("/contact")}
        className="upgrade-bar fixed-bottom d-flex align-items-center justify-content-center"
        style={{
          bottom: 62, // navbar height
          height: 38,
          background:
            "linear-gradient(90deg, #ffd388 0%, #f2b118 50%, #f5c36a 100%)",
          color: "#2a1f00",
          fontSize: "0.78rem",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 -4px 16px rgba(0,0,0,0.18)",
          zIndex: 1051,
        }}
      >
        <BsLightningCharge className="me-2" />
        Free Plan • Click here to upgrade to Premium
      </div>
    </>
  );
}

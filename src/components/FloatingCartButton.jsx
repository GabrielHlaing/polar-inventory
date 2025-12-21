// src/components/FloatingCartButton.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

export default function FloatingCartButton() {
  const navigate = useNavigate();
  const { totalCount } = useCart();

  const [isHovered, setIsHovered] = useState(false);
  const [pulse, setPulse] = useState(false);

  const prevCount = useRef(totalCount);

  // Pulse on cart change
  useEffect(() => {
    if (prevCount.current !== totalCount) {
      if (totalCount > prevCount.current) {
        setPulse(true);
        const t = setTimeout(() => setPulse(false), 350);
        return () => clearTimeout(t);
      }

      prevCount.current = totalCount;
    }
  }, [totalCount]);

  if (totalCount <= 0) return null;

  return (
    <button
      onClick={() => navigate("/cart")}
      aria-label="Open cart"
      style={{
        position: "fixed",
        bottom: 88,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: "50%",
        border: "none",
        background: pulse
          ? "linear-gradient(135deg, #4551f9ff 0%, #21ffb1ff 100%)"
          : isHovered
          ? "linear-gradient(135deg, #4551f9ff 0%, #21ffb1ff 100%)"
          : "linear-gradient(135deg, #133a7f 0%, #319ea2 100%)",
        color: "#fff",
        fontWeight: 700,
        fontSize: "1rem",
        boxShadow:
          "0 10px 25px rgba(47, 111, 237, 0.45), inset 0 1px 2px rgba(255,255,255,0.25)",
        transform: pulse
          ? "scale(1.05)"
          : isHovered
          ? "scale(1.08)"
          : "scale(1)",
        transition: "all .18s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1051,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <span
        style={{
          transform: pulse ? "scale(1.3)" : "scale(1)",
          transition: "transform .15s ease",
          fontSize: "1.2rem",
        }}
      >
        {totalCount}
      </span>
    </button>
  );
}

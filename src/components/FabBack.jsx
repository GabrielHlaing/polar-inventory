import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function FabBack({ toHome = false }) {
  const nav = useNavigate();
  const go = () => (toHome ? nav("/", { replace: true }) : nav(-1));

  return (
    <Button
      variant="outline-dark"
      className="position-fixed rounded-circle shadow-sm"
      onClick={go}
      aria-label="Back"
      style={{
        left: 25,
        bottom: 45,
        width: 50,
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
        backgroundColor: "#91dbfeff",
        borderColor: "#ddd",
      }}
    >
      <i className="bi bi-chevron-left fs-5" />
    </Button>
  );
}

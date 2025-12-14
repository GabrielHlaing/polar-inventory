import { Navbar, Container } from "react-bootstrap";

export default function Header() {
  return (
    <>
      <Navbar
        fixed="top"
        className="border-0"
        style={{
          height: 64,
          background: "linear-gradient(180deg, #2d447dff 0%, #1e2636ff 100%)", // deep navy
          boxShadow: "0 6px 18px rgba(15, 23, 42, 0.35)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Container
          fluid
          className="px-3 d-flex align-items-center justify-content-between"
        >
          {/* Brand */}
          <Navbar.Brand
            href="/"
            className="d-flex align-items-center gap-2 fw-semibold"
            style={{
              color: "#e5edff",
              letterSpacing: "0.4px",
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded"
              style={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.5)",
              }}
            >
              <img
                src="/polar-logo.png"
                alt="Polar Inventory"
                style={{
                  height: 36,
                  width: 36,
                  objectFit: "contain",
                  filter: "brightness(1.2)",
                }}
              />
            </div>

            <span className=" fs-6">Polar Inventory</span>
          </Navbar.Brand>
        </Container>
      </Navbar>
    </>
  );
}

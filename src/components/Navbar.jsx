import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  BsHouse,
  BsBoxSeam,
  BsPerson,
  BsInfoCircle,
  BsGear,
} from "react-icons/bs";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { to: "/", label: "Home", icon: <BsHouse /> },
    { to: "/inventory", label: "Inventory", icon: <BsBoxSeam /> },
    { to: "/profile", label: "Profile", icon: <BsPerson /> },
    { to: "/more-info", label: "More Info", icon: <BsInfoCircle /> },
    { to: "/settings", label: "Settings", icon: <BsGear /> },
  ];

  const handleNav = (to) => {
    if (location.pathname === to) return;

    // Home should always be a real history entry
    if (to === "/") {
      navigate("/", { replace: false });
      return;
    }

    navigate(to, { replace: true });
  };

  return (
    <>
      <nav
        className="fixed-bottom d-flex justify-content-around align-items-center border-top"
        style={{
          background: "linear-gradient(180deg, #1e2636 0%, #2d447d 100%)",
          height: 60,
          boxShadow: "0 -6px 24px rgba(0, 0, 0, 0.08)",
          zIndex: 1050,
        }}
      >
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            onClick={(e) => {
              e.preventDefault();
              handleNav(t.to);
            }}
            className="d-flex flex-column align-items-center text-decoration-none px-3 py-1 rounded-3"
            style={({ isActive }) => ({
              fontSize: "0.7rem",
              color: isActive ? "#f7f7f7ff" : "#97a1b5",
              transition: "all .25s ease",
              background: isActive
                ? "linear-gradient(180deg, rgba(139, 180, 255, 0.15) 0%, rgba(139, 180, 255, 0.05) 100%)"
                : "transparent",
              boxShadow: isActive
                ? "0 4px 20px rgba(139, 180, 255, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.2)"
                : "none",
            })}
          >
            <div style={{ fontSize: "1.25rem", marginBottom: 2 }}>{t.icon}</div>
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ paddingBottom: 60, marginTop: 10 }} />
    </>
  );
}

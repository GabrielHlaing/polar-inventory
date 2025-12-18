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
    navigate(to, { replace: true });
  };

  return (
    <>
      {/* Micro-interactions & animation */}
      <style>
        {`
          .nav-item {
            transition: 
              color 0.25s ease,
              background 0.25s ease,
              box-shadow 0.25s ease,
              transform 0.2s ease;
          }

          .nav-item:active {
            transform: scale(0.8);
          }

          .nav-item:not(.active):hover {
            color: #e5ecff;
          }

          .nav-icon {
            transition: transform 0.25s ease;
          }

          .nav-item.active .nav-icon {
            transform: translateY(-2px) scale(1.05);
          }
        `}
      </style>

      <nav
        className="fixed-bottom d-flex justify-content-around align-items-center border-top"
        style={{
          background:
            "linear-gradient(180deg, #1e2636 0%, #273c6a 60%, #2d447d 100%)",
          height: 62,
          boxShadow:
            "0 -8px 28px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255,255,255,0.04)",
          backdropFilter: "blur(6px)",
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
            className="nav-item d-flex flex-column align-items-center text-decoration-none px-3 py-1 rounded-4"
            style={({ isActive }) => ({
              fontSize: "0.72rem",
              fontWeight: 500,
              color: isActive ? "#f8fbff" : "#9aa4bd",
              background: isActive
                ? "linear-gradient(180deg, rgba(139, 180, 255, 0.18) 0%, rgba(139, 180, 255, 0.06) 100%)"
                : "transparent",
              boxShadow: isActive
                ? "0 6px 22px rgba(139, 180, 255, 0.35), inset 0 1px 2px rgba(255,255,255,0.25)"
                : "none",
            })}
          >
            <div
              className="nav-icon"
              style={{
                fontSize: "1.3rem",
                marginBottom: 2,
              }}
            >
              {t.icon}
            </div>
            <span className="text-center">{t.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Spacer for fixed navbar */}
      <div style={{ paddingBottom: 64 }} />
    </>
  );
}

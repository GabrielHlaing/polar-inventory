import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useAppBackButton() {
  const nav = useNavigate();

  useEffect(() => {
    /* Only apply mobile-like logic when viewport is narrow */
    const mobileOnly = () => {
      if (window.innerWidth > 768) return; // desktop = no change
      if (window.history.state?.idx === 0) {
        /* root history entry – try to close the tab */
        window.close();
        /* if tab cannot be closed, at least stay on root */
        nav("/", { replace: true });
      }
    };

    window.addEventListener("popstate", mobileOnly);
    return () => window.removeEventListener("popstate", mobileOnly);
  }, [nav]);
}

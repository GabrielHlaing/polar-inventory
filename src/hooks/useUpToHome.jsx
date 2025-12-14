// hooks/useUpToHome.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useUpToHome() {
  const nav = useNavigate();

  useEffect(() => {
    /* push a dummy state so we can intercept the next pop */
    window.history.pushState({ trap: true }, "");

    const onPop = (e) => {
      if (e.state?.trap) {
        /* user pressed back while we are on top of our dummy entry */
        nav("/", { replace: true }); // jump to Home, wiping stack
      } else {
        /* otherwise let default back happen */
        window.history.back();
      }
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [nav]);
}

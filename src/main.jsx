import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { registerSW } from "./registerSW";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// Register the service worker
registerSW({
  onUpdate(reg) {
    // You can show a custom UI to prompt user to refresh; simple confirm here:
    if (confirm("A new version is available — reload to update?")) {
      // Tell the SW to skip waiting, then reload
      if (reg && reg.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
        reg.waiting.addEventListener("statechange", (e) => {
          if (e.target.state === "activated") window.location.reload();
        });
      } else {
        window.location.reload();
      }
    }
  },
});

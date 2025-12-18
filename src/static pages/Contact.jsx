import FabBack from "../components/FabBack";

export default function Contact() {
  return (
    <div className="container py-4">
      <FabBack />
      <h1 className="fw-bold mb-4" style={{ color: "#1f3a5f" }}>
        Contact Us
      </h1>

      <p>If you need help, feel free to reach out:</p>

      <ul className="list-group">
        <li className="list-group-item">
          <strong>Email:</strong> support@example.com
        </li>
        <li className="list-group-item">
          <strong>Facebook:</strong> (your page)
        </li>
        <li className="list-group-item">
          <strong>Phone:</strong> (optional)
        </li>
      </ul>

      <p className="mt-3 text-muted">We usually reply within 24–48 hours.</p>
    </div>
  );
}

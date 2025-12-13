export default function Contact() {
  return (
    <div className="container py-4">
      <h1 className="mb-4">Contact Us</h1>

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

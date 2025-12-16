import { useEffect, useState } from "react";
import { useProfile } from "../contexts/ProfileContext";
import { Link } from "react-router-dom";
import { sampleInvoice } from "../utils/sampleInvoice";
import InvoicePreviewModal from "../components/InvoicePreviewModal";
import { Button, Form, Card, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import Header from "../components/Header";

/* 8 premium preset colours */
const PRESET_COLORS = [
  { name: "Ocean", value: "#2b6cb0" },
  { name: "Forest", value: "#38a169" },
  { name: "Rose", value: "#e53e3e" },
  { name: "Sunset", value: "#dd6b20" },
  { name: "Lavender", value: "#805ad5" },
  { name: "Mint", value: "#319795" },
  { name: "Gold", value: "#d69e2e" },
  { name: "Indigo", value: "#5a67d8" },
  { name: "Slate", value: "#4a5568" },
  { name: "Teal", value: "#0f766e" },
  { name: "Cocoa", value: "#8b5e3c" },
  { name: "Charcoal", value: "#2d3748" },
];

/* 15 fonts (3 calligraphic) */
const FONT_OPTIONS = [
  // --- Sans (Professional / Default) ---
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Open Sans", value: "Open Sans, sans-serif" },

  // --- Serif (Elegant / Formal) ---
  { label: "Merriweather", value: "Merriweather, serif" },
  { label: "Playfair Display", value: "Playfair Display, serif" },
  { label: "Crimson Text", value: "Crimson Text, serif" },

  // --- Calligraphic (Stylish) ---
  { label: "Dancing Script", value: "Dancing Script, cursive" },
  { label: "Caveat", value: "Caveat, cursive" },
  { label: "Satisfy", value: "Satisfy, cursive" },
  { label: "Kalam", value: "Kalam, cursive" },
  { label: "Great Vibes", value: "Great Vibes, cursive" },
  { label: "Allura", value: "Allura, cursive" },
  { label: "Alex Brush", value: "Alex Brush, cursive" },
];

export default function SettingsPage() {
  const { profile, updateSettings, loading, isPremium, premiumExpiresAt } =
    useProfile();

  const [saving, setSaving] = useState(false);

  const disabled = !isPremium || saving;

  const [form, setForm] = useState(() => ({
    shop_name: profile?.settings?.shop_name || "",
    address: profile?.settings?.address || "",
    phone: profile?.settings?.phone || "",
    email: profile?.settings?.email || "",
    logo_url: profile?.settings?.logo_url || "",
    logo_path: profile?.settings?.logo_path || "",
    theme_color: profile?.settings?.theme_color || "#2b6cb0",
    invoice_font: profile?.settings?.invoice_font || "Inter, sans-serif",
    footer_text: profile?.settings?.footer_text || "",
  }));

  useEffect(() => {
    if (!profile?.settings) return;
    setForm((prev) => ({
      ...prev,
      shop_name: profile.settings.shop_name || "",
      address: profile.settings.address || "",
      phone: profile.settings.phone || "",
      email: profile.settings.email || "",
      logo_url: profile.settings.logo_url || "",
      logo_path: profile.settings.logo_path || "",
      theme_color: profile.settings.theme_color || "#2b6cb0",
      invoice_font: profile.settings.invoice_font || "Inter, sans-serif",
      footer_text: profile.settings.footer_text || "",
    }));
  }, [profile?.settings]);

  function handleChange(field, value) {
    if (disabled) return;
    setForm((f) => ({ ...f, [field]: value }));
  }

  // === Resize to 1:1 square ===
  async function resizeImage(file, size = 128) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        const shortest = Math.min(img.width, img.height);
        const sx = (img.width - shortest) / 2;
        const sy = (img.height - shortest) / 2;

        ctx.drawImage(img, sx, sy, shortest, shortest, 0, 0, size, size);

        canvas.toBlob((blob) => {
          const ext = file.name.split(".").pop().toLowerCase();
          const type =
            ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";

          resolve(new File([blob], `logo.${ext}`, { type }));
        }, file.type);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // === Delete old logo from Supabase ===
  async function deleteOldLogo() {
    const oldPath = form.logo_path;
    if (!oldPath) return;

    const { data, error } = await supabase.storage
      .from("shop-logos")
      .remove([oldPath]);

    console.log("DELETE PATH:", oldPath);
    console.log("DELETE RESULT:", { data, error });

    if (error) alert("Delete failed: " + error.message);
  }

  // === Upload new logo (always cleanup before upload) ===
  async function uploadLogo(e) {
    if (!isPremium) {
      alert("Logo upload is a premium feature.");
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    // Remove the previous file
    await deleteOldLogo();

    const ext = file.name.split(".").pop().toLowerCase();
    const allowed = ["png", "jpg", "jpeg", "webp"];
    if (!allowed.includes(ext)) {
      alert("Only PNG/JPG/JPEG/WEBP allowed.");
      return;
    }

    // Resize to 1:1
    const resized = await resizeImage(file, 256);

    // New path (always single file per user)
    const newPath = `logos/${profile.id}.${ext}`;

    // Upload new logo
    const { error } = await supabase.storage
      .from("shop-logos")
      .upload(newPath, resized, { upsert: true });

    if (error) {
      console.log(error);
      alert("Failed to upload.");
      return;
    }

    // Public URL
    const { data: urlData } = supabase.storage
      .from("shop-logos")
      .getPublicUrl(newPath);

    const cacheBustedUrl = `${urlData.publicUrl}?v=${Date.now()}`;

    setForm((f) => ({
      ...f,
      logo_url: cacheBustedUrl,
      logo_path: newPath,
    }));
  }

  // === Remove logo ===
  async function removeLogo() {
    if (!isPremium) {
      alert("Logo removal is a premium feature.");
      return;
    }

    await deleteOldLogo();

    const updated = {
      ...form,
      logo_url: "",
      logo_path: "",
    };

    setForm(updated);
    await updateSettings(updated);

    alert("Logo removed.");
  }

  async function save() {
    if (saving) return;
    setSaving(true);

    if (!isPremium) return toast.warning("Premium required");
    const res = await updateSettings(form);
    if (!res?.error) toast.success("Settings saved!");
    setSaving(false);
  }

  if (loading) return <p className="p-4">Loading settings...</p>;

  return (
    <div className="container py-4" style={{ maxWidth: 680, marginBottom: 80 }}>
      <Header />
      <Navbar />
      <h1 className="fw-bold mb-4">Shop Settings</h1>

      {isPremium && premiumExpiresAt && (
        <Badge bg="info" className="mb-3">
          Premium expires {premiumExpiresAt.toLocaleDateString()}
        </Badge>
      )}

      {/* Shop Info */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h5 className="fw-semibold mb-3">Shop Information</h5>

          <Form.Control
            placeholder="Shop Name"
            value={form.shop_name}
            onChange={(e) => handleChange("shop_name", e.target.value)}
            disabled={disabled}
            className="mb-3 px-3 py-2 rounded-pill border"
          />

          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Address"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            disabled={disabled}
            className="mb-3 px-3 py-2 rounded"
            style={{ resize: "none" }}
          />

          <Form.Control
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            disabled={disabled}
            className="mb-3 px-3 py-2 rounded-pill border"
          />

          <Form.Control
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={disabled}
            className="mb-3 px-3 py-2 rounded-pill border"
          />
        </Card.Body>
      </Card>

      {/* Logo */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h5 className="fw-semibold mb-3">Logo</h5>

          {form.logo_url && (
            <div className="d-flex align-items-center gap-3 mb-3">
              <img
                src={form.logo_url}
                className="rounded-3 border"
                style={{ width: 80, height: 80, objectFit: "contain" }}
                alt="logo"
              />
              <Button
                size="sm"
                variant="outline-danger"
                onClick={removeLogo}
                disabled={disabled}
              >
                Remove
              </Button>
            </div>
          )}

          <Form.Control
            type="file"
            accept="image/*"
            onChange={uploadLogo}
            disabled={disabled}
            className="rounded-pill"
          />
        </Card.Body>
      </Card>

      {/* Theme Colour */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h5 className="fw-semibold mb-3">Theme Colour</h5>

          <div className="d-flex flex-wrap gap-2 mb-3">
            {PRESET_COLORS.map((c) => (
              <Button
                key={c.value}
                size="sm"
                className="rounded-pill border-0 px-3 py-2"
                style={{
                  background: c.value,
                  transform:
                    form.theme_color === c.value ? "scale(1.1)" : "none",
                  boxShadow:
                    form.theme_color === c.value
                      ? `0 0 0 3px ${c.value}44`
                      : "none",
                }}
                onClick={() => handleChange("theme_color", c.value)}
                disabled={disabled}
              >
                {c.name}
              </Button>
            ))}
          </div>
          <div className="px-3">
            <p className="text-muted fw-semibold">Choose Custom Color</p>
            <Form.Control
              type="color"
              value={form.theme_color}
              onChange={(e) => handleChange("theme_color", e.target.value)}
              disabled={disabled}
              className="rounded-pill"
              style={{ width: 42, height: 42, padding: 0 }}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Font */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h5 className="fw-semibold mb-3">Invoice Font</h5>

          <div className="d-flex flex-wrap gap-2">
            {FONT_OPTIONS.map((f) => {
              const active = form.invoice_font === f.value;

              return (
                <Button
                  key={f.value}
                  size="sm"
                  disabled={disabled}
                  onClick={() => handleChange("invoice_font", f.value)}
                  className="px-3 py-2 rounded-pill border-0"
                  style={{
                    fontFamily: f.value,
                    background: active ? form.theme_color : "#f1f3f5",
                    color: active ? "#fff" : "#212529",
                    boxShadow: active
                      ? `0 0 0 3px ${form.theme_color}44`
                      : "none",
                    transform: active ? "scale(1.05)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {f.label}
                </Button>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      {/* Footer */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h5 className="fw-semibold mb-3">Invoice Footer</h5>

          <Form.Control
            as="textarea"
            rows={2}
            maxLength={120}
            placeholder="Footer text (120 chars)"
            value={form.footer_text}
            onChange={(e) => handleChange("footer_text", e.target.value)}
            disabled={disabled}
            className="px-3 py-2 rounded"
            style={{ resize: "none" }}
          />

          <div className="text-end">
            <small className="text-muted">{form.footer_text.length}/120</small>
          </div>
        </Card.Body>
      </Card>

      {/* Actions */}
      <div className="d-flex gap-2">
        <Button
          className="rounded-pill px-4"
          variant="primary"
          onClick={save}
          disabled={disabled}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Saving…
            </>
          ) : (
            "Save settings"
          )}
        </Button>
        <InvoicePreviewModal
          shop={{
            name: form.shop_name || "My Shop",
            address: form.address || "The City",
            phone: form.phone || "09xxxxxxxxx",
            email: form.email || "sample@email.com",
            logo: form.logo_url,
            color: form.theme_color,
            font: form.invoice_font,
            footer: form.footer_text || "Thank You!",
            customer: sampleInvoice.customer,
          }}
          invoice={sampleInvoice}
        />
      </div>
    </div>
  );
}

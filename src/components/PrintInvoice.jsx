import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import { supabase } from "../supabaseClient";
import { useProfile } from "../contexts/ProfileContext";
import { Button, Card, Badge, Placeholder } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaEnvelope, FaPhone } from "react-icons/fa";

export default function PrintInvoice() {
  const { id } = useParams();
  const { profile } = useProfile();
  const invoiceRef = useRef(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    supabase
      .from("invoices")
      .select("*, history(*)")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) toast.error("Invoice not found");
        else setInvoice(data);
        setLoading(false);
      });
  }, [id]);

  const settings = profile?.settings || {};
  const shop = {
    name: settings.shop_name || "My Shop",
    address: settings.address || "Yangon, Myanmar",
    phone: settings.phone || "",
    email: settings.email || "",
    logo: settings.logo_url || "",
    color: settings.theme_color || "#72b3f7",
    font: settings.invoice_font || "Inter, sans-serif",
    footer: settings.footer_text || "Thank you for your shopping!",
  };

  const [logoOk, setLogoOk] = useState(true); // logo ready flag
  useEffect(() => {
    setLogoOk(!shop.logo);
  }, [shop.logo]);

  const downloadPNG = async () => {
    if (!invoiceRef.current || downloading) return;
    setDownloading(true);
    const canvas = await html2canvas(invoiceRef.current, {
      scale: 3,
      backgroundColor: "#ffffff",
      width: 380, // 58 mm thermal paper width (mobile first)
      useCORS: true, // 🔴 REQUIRED
      allowTaint: false,
    });
    const png = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = png;
    link.download = `Invoice_${invoice.invoice_number}.png`;
    link.click();
    setDownloading(false);
    toast.success("Receipt saved to gallery");
  };

  if (loading)
    return (
      <div className="p-4">
        <Placeholder animation="glow">
          <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={3} />
        </Placeholder>
      </div>
    );
  if (!invoice) return <p className="p-4 text-muted">Invoice not found.</p>;

  const items = invoice.history || [];
  const isPurchase = invoice.type === "purchase";
  const customer = invoice.customer;
  const getPrice = (item) =>
    isPurchase ? item.purchase_price : item.sale_price;
  const calcTotal = (item) => item.qty_change * getPrice(item);
  const grandTotal = items.reduce((s, i) => s + calcTotal(i), 0);

  /* ---------- receipt JSX ---------- */
  const Receipt = () => (
    <Card
      ref={invoiceRef}
      className="border-0 shadow-sm mx-auto"
      style={{
        maxWidth: 380,
        background: "linear-gradient(135deg, #ffffff 0%, #f9fbfd 100%)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <Card.Body className="p-4">
        {/* header */}
        <div className="d-flex align-items-center gap-3 mb-3">
          {shop.logo && (
            <div
              className="rounded-3 border bg-white d-flex align-items-center justify-content-center"
              style={{
                width: 56,
                height: 56,
              }}
            >
              <img
                src={shop.logo}
                alt="logo"
                className="img-fluid"
                crossOrigin="anonymous"
                onLoad={() => setLogoOk(true)}
                onError={() => setLogoOk(true)}
              />
            </div>
          )}
          <div>
            <div
              className="fw-bold fs-5"
              style={{ fontFamily: shop.font, color: shop.color }}
            >
              {shop.name}
            </div>
            <small className="text-muted">{shop.address}</small>
            {shop.phone && (
              <div className="small text-muted">
                <FaPhone /> {shop.phone}
              </div>
            )}
            {shop.email && (
              <div className="small text-muted">
                <FaEnvelope /> {shop.email}
              </div>
            )}
          </div>
        </div>

        {/* invoice meta */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <div className="fw-semibold">Invoice #{invoice.invoice_number}</div>
            <small className="text-muted">
              {new Date(invoice.created_at).toLocaleDateString()}
            </small>
          </div>
          <Badge
            pill
            style={{
              backgroundColor: shop.color + "22",
              color: "white",
              border: `1px solid ${shop.color}44`,
            }}
          >
            {invoice.type}
          </Badge>
        </div>

        {/* customer */}
        {customer && (
          <Card
            className="mb-3 border-0"
            style={{ background: shop.color + "11" }}
          >
            <Card.Body className="p-2">
              <div className="fw-semibold small mb-1">Bill to</div>
              <div className="small">
                {customer.name && <div>{customer.name}</div>}
                {customer.phone && <div>{customer.phone}</div>}
                {customer.address && (
                  <div className="text-muted">{customer.address}</div>
                )}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* items */}
        <div className="mb-3">
          <div
            className="d-flex fw-semibold small text-muted border-bottom pb-1"
            style={{ borderColor: shop.color + "33" }}
          >
            <span className="flex-fill">Item</span>
            <span className="text-center" style={{ width: 48 }}>
              Qty
            </span>
            <span className="text-end" style={{ width: 72 }}>
              Price
            </span>
            <span className="text-end" style={{ width: 80 }}>
              Total
            </span>
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className="d-flex small py-2 border-bottom"
              style={{ borderColor: shop.color + "22" }}
            >
              <span className="flex-fill">{item.metadata?.name}</span>
              <span className="text-center" style={{ width: 48 }}>
                {item.qty_change}
              </span>
              <span className="text-end" style={{ width: 72 }}>
                {getPrice(item).toLocaleString()} Ks
              </span>
              <span className="text-end fw-semibold" style={{ width: 80 }}>
                {calcTotal(item).toLocaleString()} Ks
              </span>
            </div>
          ))}
        </div>

        {/* total */}
        <div className="d-flex justify-content-between align-items-center fw-bold mb-3">
          <span>Total</span>
          <span style={{ color: shop.color }}>
            {grandTotal.toLocaleString()} Ks
          </span>
        </div>

        {/* footer */}
        {shop.footer && (
          <div
            className="text-center text-muted small border-top pt-2"
            style={{ borderColor: shop.color + "33" }}
          >
            {shop.footer}
          </div>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <div
      className="container py-3"
      style={{ background: shop.color + "08", minHeight: "100vh" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => window.history.back()}
        >
          ← Back
        </Button>
        <Button
          variant="dark"
          size="sm"
          onClick={downloadPNG}
          disabled={downloading || !logoOk}
        >
          {downloading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Saving…
            </>
          ) : (
            "Save PNG"
          )}
        </Button>
      </div>

      <Receipt />
    </div>
  );
}

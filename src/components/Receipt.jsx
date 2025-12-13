import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import { FaEnvelope, FaPhone } from "react-icons/fa";

export default function Receipt({ shop, invoice }) {
  const items = invoice.history || [];
  const isPurchase = invoice.type === "purchase";
  const customer = invoice.customer;
  const getPrice = (item) =>
    isPurchase ? item.purchase_price : item.sale_price;
  const calcTotal = (item) => item.qty_change * getPrice(item);
  const grandTotal = items.reduce((s, i) => s + calcTotal(i), 0);

  return (
    <Card
      className="border-0 shadow-sm mx-auto"
      style={{
        maxWidth: 380,
        fontFamily: shop.font,
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
              style={{ width: 56, height: 56 }}
            >
              <img
                src={shop.logo}
                alt="logo"
                className="img-fluid"
                crossOrigin="anonymous"
              />
            </div>
          )}
          <div>
            <div className="fw-bold fs-5">{shop.name}</div>
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
              color: shop.color,
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
}

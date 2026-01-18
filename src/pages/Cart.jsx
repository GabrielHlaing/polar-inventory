import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  Table,
  Card,
  ButtonGroup,
  Row,
  Col,
  Badge,
  Modal,
} from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { useCart } from "../contexts/CartContext";
import { useItems } from "../contexts/ItemsContext";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import { useHistoryData } from "../contexts/HistoryContext";
import { useSync } from "../contexts/SyncContext";
import { idbPut, STORE_NAMES } from "../idb";
import { toast } from "react-toastify";
import FabBack from "../components/FabBack";
import { useDashboard } from "../contexts/DashboardContext";

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart, removeFromCart } = useCart();
  const { items, updateItem, loadItems } = useItems();
  const { updateInvoiceInCache } = useHistoryData();
  const { isPremium } = useProfile();
  const { fetchKpisAndSeries } = useDashboard();
  const { processSyncQueue } = useSync();

  const [type, setType] = useState("sale");
  const [invoice, setInvoice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [cartState, setCartState] = useState(cart);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [processing, setProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmResolver, setConfirmResolver] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  useEffect(() => setCartState(cart), [cart]);

  const handleChange = (id, field, value) =>
    setCartState((p) =>
      p.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    );

  const getMaxQty = (cartItem) => {
    if (type !== "sale") return Infinity;
    const inv = items.find((i) => i.id === cartItem.id);
    return inv?.qty ?? Infinity;
  };

  const changeQty = (id, delta) =>
    setCartState((p) =>
      p.map((i) => {
        if (i.id !== id) return i;

        const base = i.qty === "" ? 0 : Number(i.qty);
        const max = getMaxQty(i);

        return {
          ...i,
          qty: Math.min(Math.max(1, base + delta), max),
        };
      }),
    );

  const askConfirm = (message) =>
    new Promise((res) => {
      setConfirmResolver(() => res); // store the resolve fn
      setShowConfirm(true);
    });

  const updateCustomer = (f, v) => setCustomer((p) => ({ ...p, [f]: v }));

  const total = cartState.reduce((sum, i) => {
    const price = type === "purchase" ? i.purchase_price : i.sale_price;
    return sum + i.qty * (Number(price) || 0);
  }, 0);

  // To prevent negative stock
  const cartExceedsStock = () =>
    cartState.some((c) => {
      const inv = items.find((i) => i.id === c.id);
      return inv && c.type === "sale" && c.qty > inv.qty;
    });

  /* ---------- checkout ---------- */
  const handleCheckout = async () => {
    if (processing) return;
    if (!isPremium)
      return toast.warning("Checkout is only available for premium users.");
    if (!invoice) return toast.warning("Invoice number is required.");
    if (cartExceedsStock())
      return toast.error("One or more items exceed available stock.");

    const confirmed = await askConfirm();

    if (!confirmed) return;

    setProcessing(true);
    const invoiceId = crypto.randomUUID();
    const historyRows = cartState.map((c) => ({
      id: crypto.randomUUID(),
      user_id: user.id,
      inventory_id: c.id,
      qty_change: Math.max(1, Number(c.qty || 1)),
      type: type === "purchase" ? "purchase" : "sale",
      purchase_price: Number(c.purchase_price || 0) || null,
      sale_price: Number(c.sale_price || 0) || null,
      metadata:
        type === "purchase"
          ? {
              name: c.name,
              mfg_date: c.mfg_date || null,
              exp_date: c.exp_date || null,
            }
          : { name: c.name },
      created_at: new Date().toISOString(),
    }));

    const invoicePayload = {
      id: invoiceId,
      user_id: user.id,
      total_amount: total,
      invoice_number: invoice,
      type,
      metadata: { date },
      customer:
        customer.name || customer.phone || customer.address ? customer : null,
      created_at: new Date().toISOString(),
    };

    await idbPut(STORE_NAMES.INVOICES, invoicePayload);
    await idbPut(STORE_NAMES.SYNC_QUEUE, {
      queueId: crypto.randomUUID(),
      type: "checkout",
      created_at: Date.now(),
      payload: { invoice: invoicePayload, history: historyRows },
    });
    if (navigator.onLine) processSyncQueue();

    for (const c of cartState) {
      const inv = items.find((i) => i.id === c.id);
      if (!inv) continue;
      const invQty = Number(inv.qty ?? 0);
      const cartQty = Math.max(1, Number(c.qty || 1));

      const newQty =
        type === "purchase" ? invQty + cartQty : Math.max(0, invQty - cartQty);

      await updateItem(c.id, {
        qty: newQty,
        purchase_price: c.purchase_price || inv.purchase_price,
        sale_price: c.sale_price || inv.sale_price,
        mfg_date: c.mfg_date || inv.mfg_date || null,
        exp_date: c.exp_date || inv.exp_date || null,
      });
    }
    await loadItems();
    updateInvoiceInCache({ ...invoicePayload, history: historyRows });
    clearCart();
    fetchKpisAndSeries();
    toast.success("Checkout Successful!");
    navigate("/history", { replace: true });
  };

  /* ---------- empty cart ---------- */
  if (cart.length === 0)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 text-center">
        <Card className="border-0 shadow-sm px-5 py-5 empty-cart-card">
          <div className="empty-cart-icon mb-3">🛒</div>

          <Card.Body className="p-0">
            <div className="fw-semibold mb-1">Your cart is empty</div>
            <div className="text-muted small mb-3">
              Add items to start a sale or purchase
            </div>

            <Button
              className="rounded-pill px-4"
              variant="primary"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </Card.Body>
        </Card>

        {/* inline styles to keep this self-contained */}
        <style>{`
        .empty-cart-card {
          animation: fadeUp 0.4s ease-out;
        }

        .empty-cart-icon {
          font-size: 48px;
          animation: float 2s ease-in-out infinite;
        }

        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      </div>
    );

  /* ----------  HELPER  ---------- */
  const customerFilled = customer.name || customer.phone || customer.address;

  /* ----------  RETURN  (reshuffled colours only)  ---------- */
  return (
    <div className="container py-4" style={{ marginBottom: 80 }}>
      <FabBack />

      {/* header bar */}
      <Row className="align-items-center mb-3">
        <Col>
          <h3 className="fw-bold mb-0 text-dark">
            Cart ‑ {type === "purchase" ? "Purchase" : "Sale"}
          </h3>
        </Col>
        <Col xs="auto">
          <Badge bg="primary" pill>
            {cartState.length} items
          </Badge>
        </Col>
      </Row>

      {/* invoice & date */}
      <Card
        className="border-0 shadow-sm mb-3"
        style={{ background: "#efefef" }}
      >
        <Card.Body>
          <Row className="g-2">
            <Col md={6}>
              <Form.Label className="small text-muted mb-1">
                Invoice #
              </Form.Label>
              <Form.Control
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
                placeholder="e.g. INV-01"
              />
            </Col>
            <Col md={6}>
              <Form.Label className="small text-muted mb-1">Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* customer bar */}
      <Card
        className="border-0 shadow-sm mb-3"
        style={{ background: "#efefef" }}
      >
        <Card.Body className="d-flex align-items-center justify-content-between py-2">
          <div className="d-flex align-items-center gap-3">
            <span className="fw-semibold small text-muted">
              {type === "sale" ? "Customer" : "Supplier"}:
            </span>
            {customerFilled ? (
              <span className="small text-dark">
                {customer.name || "—"} {customer.phone && `· ${customer.phone}`}
              </span>
            ) : (
              <span className="small text-muted">Not added</span>
            )}
          </div>
          <Button
            size="sm"
            variant="outline-dark"
            onClick={() => setShowCustomerModal(true)}
          >
            {customerFilled ? "Edit" : "Add"}
          </Button>
        </Card.Body>
      </Card>

      {/* type + clear */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <ButtonGroup>
          <Button
            variant={type === "sale" ? "primary" : "outline-primary"}
            onClick={() => setType("sale")}
          >
            Sale
          </Button>
          <Button
            variant={type === "purchase" ? "primary" : "outline-primary"}
            onClick={() => setType("purchase")}
          >
            Purchase
          </Button>
        </ButtonGroup>
        <Button size="sm" variant="outline-danger" onClick={clearCart}>
          <FaTrash className="me-1" /> Clear Cart
        </Button>
      </div>

      {/* -------  MOBILE CARDS  ------- */}
      <div className="d-lg-none">
        {cartState.map((c) => (
          <Card className="mb-3 border-1 shadow-sm" key={c.id}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="fw-bold text-truncate">{c.name}</div>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => removeFromCart(c.id)}
                >
                  x
                </Button>
              </div>

              {/* qty stepper */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => changeQty(c.id, -1)}
                >
                  -
                </Button>
                <Form.Control
                  size="sm"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={c.qty ?? ""}
                  onChange={(e) =>
                    handleChange(
                      c.id,
                      "qty",
                      e.target.value === "" ? "" : e.target.value,
                    )
                  }
                  onBlur={(e) => {
                    const max = getMaxQty(c);
                    const v = Math.max(1, Number(e.target.value || 1));
                    handleChange(c.id, "qty", Math.min(v, max));
                  }}
                  style={{ width: 70 }}
                />
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => changeQty(c.id, 1)}
                >
                  +
                </Button>

                {type === "sale" && (
                  <div className="small text-success fst-italic">
                    Available: {items.find((i) => i.id === c.id)?.qty ?? 0}
                  </div>
                )}
              </div>

              {/* price fields - side-by-side on ≥ 360 px */}
              <Row className="row-cols-2 g-2">
                {type === "purchase" && (
                  <>
                    <Col xs={6}>
                      <Form.Label className="small text-muted mb-1">
                        Purchase
                      </Form.Label>
                      <Form.Control
                        type="number"
                        step="100"
                        value={c.purchase_price}
                        onChange={(e) =>
                          handleChange(c.id, "purchase_price", e.target.value)
                        }
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Label className="small text-muted mb-1">
                        Sale
                      </Form.Label>
                      <Form.Control
                        type="number"
                        step="100"
                        value={c.sale_price}
                        onChange={(e) =>
                          handleChange(c.id, "sale_price", e.target.value)
                        }
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Label className="small text-muted mb-1">
                        Mfg
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={c.mfg_date || ""}
                        onChange={(e) =>
                          handleChange(c.id, "mfg_date", e.target.value)
                        }
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Label className="small text-muted mb-1">
                        Exp
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={c.exp_date || ""}
                        onChange={(e) =>
                          handleChange(c.id, "exp_date", e.target.value)
                        }
                      />
                    </Col>
                  </>
                )}
                {type === "sale" && (
                  <Col xs={12}>
                    <Form.Label className="small text-muted mb-1">
                      Sale Price
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="100"
                      value={c.sale_price}
                      onChange={(e) =>
                        handleChange(c.id, "sale_price", e.target.value)
                      }
                    />
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* desktop table */}
      <div className="d-none d-lg-block table-responsive mb-4">
        <Table bordered hover className="align-middle">
          <thead>
            <tr className="text-center">
              <th>Name</th>
              <th>Qty</th>
              {type === "purchase" && <th>Purchase Price</th>}
              {type === "purchase" && <th>Sale Price</th>}
              {type === "purchase" && <th>Mfg Date</th>}
              {type === "purchase" && <th>Exp Date</th>}
              {type === "sale" && <th>Sale Price</th>}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cartState.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => changeQty(c.id, -1)}
                    >
                      -
                    </Button>
                    <Form.Control
                      size="sm"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={c.qty ?? ""}
                      onChange={(e) =>
                        handleChange(
                          c.id,
                          "qty",
                          e.target.value === "" ? "" : e.target.value,
                        )
                      }
                      onBlur={(e) => {
                        const max = getMaxQty(c);
                        const v = Math.max(1, Number(e.target.value || 1));
                        handleChange(c.id, "qty", Math.min(v, max));
                      }}
                      style={{ width: 70 }}
                    />

                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => changeQty(c.id, 1)}
                    >
                      +
                    </Button>
                  </div>

                  {type === "sale" && (
                    <div className="mt-1 small text-success fst-italic">
                      Available: {items.find((i) => i.id === c.id)?.qty ?? 0}
                    </div>
                  )}
                </td>
                {type === "purchase" && (
                  <>
                    <td>
                      <Form.Control
                        type="number"
                        step="100"
                        value={c.purchase_price}
                        onChange={(e) =>
                          handleChange(c.id, "purchase_price", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="100"
                        value={c.sale_price}
                        onChange={(e) =>
                          handleChange(c.id, "sale_price", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="date"
                        value={c.mfg_date || ""}
                        onChange={(e) =>
                          handleChange(c.id, "mfg_date", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="date"
                        value={c.exp_date || ""}
                        onChange={(e) =>
                          handleChange(c.id, "exp_date", e.target.value)
                        }
                      />
                    </td>
                  </>
                )}
                {type === "sale" && (
                  <td>
                    <Form.Control
                      type="number"
                      step="100"
                      value={c.sale_price}
                      onChange={(e) =>
                        handleChange(c.id, "sale_price", e.target.value)
                      }
                    />
                  </td>
                )}
                <td className="text-center">
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => removeFromCart(c.id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* -------  TOTAL + CHECKOUT  ------- */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
        <div className="fs-5 fw-semibold">
          Total <span className="text-muted">·</span> {total.toFixed(2)} Ks
        </div>
        <Button
          variant="dark"
          onClick={handleCheckout}
          disabled={processing || !isPremium}
        >
          {processing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Processing…
            </>
          ) : (
            "Checkout"
          )}
        </Button>
      </div>
      {!isPremium && (
        <div className="text-danger mt-2">
          Checkout is only available for premium users.
        </div>
      )}

      {/* -------  CUSTOMER MODAL  ------- */}
      <Modal
        show={showCustomerModal}
        onHide={() => setShowCustomerModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {type === "sale" ? "Customer" : "Supplier"} (optional)
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="row-cols-1 g-2">
            <Col>
              <Form.Label className="small text-muted mb-1">Name</Form.Label>
              <Form.Control
                placeholder={
                  type === "sale" ? "Customer name" : "Supplier name"
                }
                value={customer.name}
                onChange={(e) => updateCustomer("name", e.target.value)}
              />
            </Col>
            <Col>
              <Form.Label className="small text-muted mb-1">Phone</Form.Label>
              <Form.Control
                type="tel"
                inputMode="numeric"
                pattern="[0-9+ ]*"
                placeholder="09xxxxxxxx"
                value={customer.phone}
                onChange={(e) => updateCustomer("phone", e.target.value)}
              />
            </Col>
            <Col>
              <Form.Label className="small text-muted mb-1">Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter address"
                value={customer.address}
                onChange={(e) => updateCustomer("address", e.target.value)}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowCustomerModal(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowCustomerModal(false)}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* -------  CONFIRM CHECKOUT MODAL  ------- */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm checkout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Total: <strong>{total.toFixed(2)} Ks</strong>. Proceed?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              confirmResolver(false);
              setShowConfirm(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={() => {
              confirmResolver(true);
              setShowConfirm(false);
            }}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

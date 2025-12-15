import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  Table,
  Card,
  ButtonGroup,
  Placeholder,
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

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart, removeFromCart } = useCart();
  const { items, updateItem, loadItems } = useItems();
  const { updateInvoiceInCache } = useHistoryData();
  const { isPremium } = useProfile();
  const { processSyncQueue } = useSync();

  const [type, setType] = useState("purchase");
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

  useEffect(() => setCartState(cart), [cart]);

  const handleChange = (id, field, value) =>
    setCartState((p) =>
      p.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );

  const changeQty = (id, delta) =>
    setCartState((p) =>
      p.map((i) => {
        if (i.id !== id) return i;

        const base = i.qty === "" ? 0 : Number(i.qty);
        return {
          ...i,
          qty: Math.max(1, base + delta),
        };
      })
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
      const newQty =
        type === "purchase"
          ? Number(inv.qty) + Number(c.qty)
          : Number(inv.qty) - Number(c.qty);
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
    toast.success("Checkout Successful!");
    navigate("/", { replace: true });
  };

  /* ---------- empty cart ---------- */
  if (cart.length === 0)
    return (
      <div className="container py-3 text-center">
        <Card className="border-0 shadow-sm d-inline-block px-4 py-5">
          <Card.Body className="text-muted">Your cart is empty.</Card.Body>
          <Button
            className="rounded-pill px-4"
            onClick={() => navigate("/inventory")}
          >
            Back to Inventory
          </Button>
        </Card>
      </div>
    );

  /* ---------- skeleton loader ---------- */
  const SkeletonCard = () => (
    <Card className="mb-2 p-3 border-0 shadow-sm">
      <Placeholder animation="glow">
        <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={3} />
      </Placeholder>
    </Card>
  );

  return (
    <div className="container py-4" style={{ marginBottom: 80 }}>
      <FabBack />
      <Row className="align-items-center mb-3">
        <Col>
          <h3 className="fw-bold mb-0">
            Cart - {type === "purchase" ? "Purchase" : "Sale"}
          </h3>
        </Col>
        <Col xs="auto">
          <Badge bg="secondary">{cartState.length} items</Badge>
        </Col>
      </Row>

      {/* invoice & date */}
      <Card
        className="border-1 shadow-sm mb-3"
        style={{ backgroundColor: "#F0F8FF" }}
      >
        <Card.Body>
          <Row className="g-2">
            <Col md={6}>
              <Form.Label className="small mb-1">Invoice #</Form.Label>
              <Form.Control
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
                placeholder="INV-001"
              />
            </Col>
            <Col md={6}>
              <Form.Label className="small mb-1">Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* customer (optional) */}
      <Card
        className="border-1 shadow-sm mb-3"
        style={{ backgroundColor: "#e1eef9ff" }}
      >
        <Card.Header className="bg-transparent fw-semibold">
          Customer (optional)
        </Card.Header>
        <Card.Body style={{ backgroundColor: "#F0F8FF" }}>
          <Row className="row-cols-1 row-cols-sm-2 g-2">
            <Col>
              <Form.Label className="small mb-1">Name</Form.Label>
              <Form.Control
                placeholder="Customer name"
                value={customer.name}
                onChange={(e) => updateCustomer("name", e.target.value)}
              />
            </Col>
            <Col>
              <Form.Label className="small mb-1">Phone</Form.Label>
              <Form.Control
                placeholder="09xxxxxxxx"
                value={customer.phone}
                onChange={(e) => updateCustomer("phone", e.target.value)}
              />
            </Col>
            <Col xs={12}>
              <Form.Label className="small mb-1">Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Optional address"
                value={customer.address}
                onChange={(e) => updateCustomer("address", e.target.value)}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* type toggle + clear */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <ButtonGroup>
          <Button
            variant={type === "purchase" ? "primary" : "outline-primary"}
            onClick={() => setType("purchase")}
          >
            Purchase
          </Button>
          <Button
            variant={type === "sale" ? "primary" : "outline-primary"}
            onClick={() => setType("sale")}
          >
            Sale
          </Button>
        </ButtonGroup>
        <Button size="sm" variant="outline-danger" onClick={clearCart}>
          <FaTrash /> Clear Cart
        </Button>
      </div>

      {/* mobile cards - side-by-side inputs */}
      <div className="d-md-none">
        {cartState.map((c) => (
          <Card
            className="mb-3 border-1 shadow-sm"
            style={{ backgroundColor: "#F0F8FF" }}
            key={c.id}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="fw-bold text-truncate">{c.name}</div>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => removeFromCart(c.id)}
                >
                  <FaTrash />
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
                      e.target.value === "" ? "" : e.target.value
                    )
                  }
                  onBlur={(e) =>
                    handleChange(
                      c.id,
                      "qty",
                      Math.max(1, Number(e.target.value || 1))
                    )
                  }
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

              {/* price fields - side-by-side on ≥ 360 px */}
              <Row className="row-cols-2 g-2">
                {type === "purchase" && (
                  <>
                    <Col xs={6}>
                      <Form.Label className="small mb-1">Purchase</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={c.purchase_price}
                        onChange={(e) =>
                          handleChange(c.id, "purchase_price", e.target.value)
                        }
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Label className="small mb-1">Sale</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={c.sale_price}
                        onChange={(e) =>
                          handleChange(c.id, "sale_price", e.target.value)
                        }
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Label className="small mb-1">Mfg</Form.Label>
                      <Form.Control
                        type="date"
                        value={c.mfg_date || ""}
                        onChange={(e) =>
                          handleChange(c.id, "mfg_date", e.target.value)
                        }
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Label className="small mb-1">Exp</Form.Label>
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
                    <Form.Label className="small mb-1">Sale Price</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
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
      <div className="d-none d-md-block table-responsive mb-4">
        <Table striped bordered hover className="align-middle">
          <thead>
            <tr>
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
                          e.target.value === "" ? "" : e.target.value
                        )
                      }
                      onBlur={(e) =>
                        handleChange(
                          c.id,
                          "qty",
                          Math.max(1, Number(e.target.value || 1))
                        )
                      }
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
                </td>
                {type === "purchase" && (
                  <>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={c.purchase_price}
                        onChange={(e) =>
                          handleChange(c.id, "purchase_price", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
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
                      step="0.01"
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

      {/* total + checkout */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
        <div className="fw-bold fs-5">Total: {total.toFixed(2)} Ks</div>
        <Button
          variant="success"
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

      {/* Confirm checkout modal */}
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

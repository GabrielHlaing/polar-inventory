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
  Container,
} from "react-bootstrap";
import {
  FaTrash,
  FaShoppingCart,
  FaArrowLeft,
  FaMinus,
  FaPlus,
  FaUser,
  FaCalendarAlt,
  FaReceipt,
} from "react-icons/fa";
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
  const { isPremium, businessId } = useProfile();
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
      setConfirmResolver(() => res);
      setShowConfirm(true);
    });

  const updateCustomer = (f, v) => setCustomer((p) => ({ ...p, [f]: v }));

  const total = cartState.reduce((sum, i) => {
    const price = type === "purchase" ? i.purchase_price : i.sale_price;
    return sum + i.qty * (Number(price) || 0);
  }, 0);

  const cartExceedsStock = () =>
    cartState.some((c) => {
      const inv = items.find((i) => i.id === c.id);
      return inv && c.type === "sale" && c.qty > inv.qty;
    });

  /* ---------- checkout ---------- */
  const handleCheckout = async () => {
    if (processing) return;
    if (!businessId) return;
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
      business_id: businessId,
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
      business_id: businessId,
      user_id: user.id,
      created_by_name: user.user_metadata?.name || user.email,
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
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Card
          className="border-0 shadow-lg text-center p-5"
          style={{ maxWidth: 400, width: "100%" }}
        >
          <Card.Body>
            <div className="mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle mb-3"
                style={{ width: 100, height: 100 }}
              >
                <FaShoppingCart size={48} className="text-primary opacity-75" />
              </div>
              <h4 className="fw-bold text-dark mb-2">Your cart is empty</h4>
              <p className="text-muted mb-4">
                Add items to start a sale or purchase transaction
              </p>
            </div>
            <Button
              variant="primary"
              className="rounded-pill px-5 fw-semibold"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft className="me-2" />
              Continue Shopping
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );

  /* ----------  HELPER  ---------- */
  const customerFilled = customer.name || customer.phone || customer.address;

  /* ----------  RETURN  ---------- */
  return (
    <Container className="py-4 pb-5 mb-5">
      <FabBack />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <FaShoppingCart className="text-primary" />
            Cart
            <Badge
              bg={type === "sale" ? "success" : "warning"}
              className="fs-6 ms-2"
            >
              {type === "sale" ? "Sale" : "Purchase"}
            </Badge>
          </h2>
          <small className="text-muted">
            {cartState.length} item{cartState.length !== 1 ? "s" : ""} in cart
          </small>
        </div>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={clearCart}
          className="d-flex align-items-center gap-2"
        >
          <FaTrash /> Clear
        </Button>
      </div>

      {/* Invoice & Date Card */}
      <Card className="border-0 shadow-sm mb-3 bg-light">
        <Card.Body className="p-3">
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-uppercase text-muted mb-2">
                  <FaReceipt className="me-1" />
                  Invoice Number
                </Form.Label>
                <Form.Control
                  value={invoice}
                  onChange={(e) => setInvoice(e.target.value)}
                  placeholder="e.g. INV-001"
                  className="border-0 shadow-sm"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-uppercase text-muted mb-2">
                  <FaCalendarAlt className="me-1" />
                  Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-0 shadow-sm"
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Customer Card */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="d-flex align-items-center justify-content-between py-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle"
              style={{ width: 40, height: 40 }}
            >
              <FaUser className="text-primary" />
            </div>
            <div>
              <div className="fw-semibold small text-muted text-uppercase">
                {type === "sale" ? "Customer" : "Supplier"}
              </div>
              <div className="fw-medium">
                {customerFilled ? (
                  <span className="text-dark">
                    {customer.name || "Unnamed"}
                    {customer.phone && (
                      <span className="text-muted"> · {customer.phone}</span>
                    )}
                  </span>
                ) : (
                  <span className="text-muted fst-italic">
                    Not added (optional)
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant={customerFilled ? "outline-primary" : "primary"}
            size="sm"
            onClick={() => setShowCustomerModal(true)}
            className="fw-semibold"
          >
            {customerFilled ? "Edit" : "Add"}
          </Button>
        </Card.Body>
      </Card>

      {/* Type Toggle */}
      <div className="mb-4">
        <ButtonGroup className="w-50 shadow-sm">
          <Button
            variant={type === "sale" ? "success" : "outline-success"}
            onClick={() => setType("sale")}
            className="fw-semibold py-2"
          >
            Sale
          </Button>
          <Button
            variant={type === "purchase" ? "warning" : "outline-warning"}
            onClick={() => setType("purchase")}
            className="fw-semibold py-2"
          >
            Purchase
          </Button>
        </ButtonGroup>
      </div>

      {/* Mobile Cards */}
      <div className="d-lg-none">
        {cartState.map((c) => (
          <Card key={c.id} className="mb-3 border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <span className="fw-bold text-truncate me-2">{c.name}</span>
              <Button
                variant="link"
                className="text-danger p-0"
                onClick={() => removeFromCart(c.id)}
              >
                <FaTrash />
              </Button>
            </Card.Header>
            <Card.Body className="p-3">
              {/* Quantity Stepper */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => changeQty(c.id, -1)}
                  className="px-3"
                >
                  <FaMinus size={12} />
                </Button>
                <Form.Control
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
                  className="text-center fw-bold"
                  style={{ width: 80 }}
                />
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => changeQty(c.id, 1)}
                  className="px-3"
                >
                  <FaPlus size={12} />
                </Button>
                {type === "sale" && (
                  <Badge bg="success" className="ms-auto">
                    Stock: {items.find((i) => i.id === c.id)?.qty ?? 0}
                  </Badge>
                )}
              </div>

              {/* Price Fields */}
              <Row className="g-2">
                {type === "purchase" ? (
                  <>
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className="small text-muted mb-1">
                          Purchase Price
                        </Form.Label>
                        <Form.Control
                          type="number"
                          step="100"
                          value={c.purchase_price}
                          onChange={(e) =>
                            handleChange(c.id, "purchase_price", e.target.value)
                          }
                          className="fw-semibold"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group>
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
                          className="fw-semibold"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className="small text-muted mb-1">
                          Mfg Date
                        </Form.Label>
                        <Form.Control
                          type="date"
                          value={c.mfg_date || ""}
                          onChange={(e) =>
                            handleChange(c.id, "mfg_date", e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className="small text-muted mb-1">
                          Exp Date
                        </Form.Label>
                        <Form.Control
                          type="date"
                          value={c.exp_date || ""}
                          onChange={(e) =>
                            handleChange(c.id, "exp_date", e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                  </>
                ) : (
                  <Col xs={12}>
                    <Form.Group>
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
                        className="fw-semibold"
                      />
                    </Form.Group>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="d-none d-lg-block mb-4">
        <Card className="border-0 shadow-sm overflow-hidden">
          <Table hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Item</th>
                <th style={{ width: type === "sale" ? 260 : 140 }}>Quantity</th>
                {type === "purchase" && <th>Purchase Price</th>}
                {type === "purchase" && <th>Sale Price</th>}
                {type === "purchase" && <th>Mfg Date</th>}
                {type === "purchase" && <th>Exp Date</th>}
                {type === "sale" && <th>Sale Price</th>}
                <th className="pe-4" style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {cartState.map((c) => (
                <tr key={c.id}>
                  <td className="ps-4">
                    <div className="fw-semibold">{c.name}</div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => changeQty(c.id, -1)}
                      >
                        <FaMinus size={10} />
                      </Button>
                      <Form.Control
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        size="sm"
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
                        className="text-center fw-bold"
                        style={{ width: 70 }}
                      />
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => changeQty(c.id, 1)}
                      >
                        <FaPlus size={10} />
                      </Button>

                      {type === "sale" && (
                        <small className="text-success ms-2">
                          Available:{" "}
                          {items.find((i) => i.id === c.id)?.qty ?? 0}
                        </small>
                      )}
                    </div>
                  </td>
                  {type === "purchase" ? (
                    <>
                      <td>
                        <Form.Control
                          type="number"
                          step="100"
                          size="sm"
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
                          size="sm"
                          value={c.sale_price}
                          onChange={(e) =>
                            handleChange(c.id, "sale_price", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="date"
                          size="sm"
                          value={c.mfg_date || ""}
                          onChange={(e) =>
                            handleChange(c.id, "mfg_date", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="date"
                          size="sm"
                          value={c.exp_date || ""}
                          onChange={(e) =>
                            handleChange(c.id, "exp_date", e.target.value)
                          }
                        />
                      </td>
                    </>
                  ) : (
                    <td>
                      <Form.Control
                        type="number"
                        step="100"
                        size="sm"
                        value={c.sale_price}
                        onChange={(e) =>
                          handleChange(c.id, "sale_price", e.target.value)
                        }
                      />
                    </td>
                  )}
                  <td className="pe-4">
                    <Button
                      variant="link"
                      className="text-danger p-0"
                      onClick={() => removeFromCart(c.id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>

      {/* Total & Checkout - Fixed Bottom */}
      <Card className="border-0 shadow-lg bottom-0 start-0 end-0 rounded-0 rounded-top">
        <Card.Body className="py-3">
          <div className="d-flex flex-wrap gap-3 justify-content-around align-items-center">
            <div>
              <small className="text-muted text-uppercase fw-semibold">
                Total Amount
              </small>
              <div className="fs-3 fw-bold text-dark">
                {total.toLocaleString()} Ks
              </div>
            </div>
            <Button
              variant="dark"
              size="md"
              onClick={handleCheckout}
              disabled={processing || !isPremium}
              className="px-5 fw-bold"
            >
              {processing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Processing...
                </>
              ) : (
                "Checkout"
              )}
            </Button>
          </div>
          {!isPremium && (
            <div className="alert alert-warning py-2 mb-0 mt-2 small">
              <strong>Premium Required:</strong> Checkout is only available for
              premium users.
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Customer Modal */}
      <Modal
        show={showCustomerModal}
        onHide={() => setShowCustomerModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            {type === "sale" ? "Customer" : "Supplier"} Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-muted">
                Name
              </Form.Label>
              <Form.Control
                placeholder={
                  type === "sale" ? "Customer name" : "Supplier name"
                }
                value={customer.name}
                onChange={(e) => updateCustomer("name", e.target.value)}
                className="shadow-sm"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-muted">
                Phone
              </Form.Label>
              <Form.Control
                type="tel"
                inputMode="numeric"
                pattern="[0-9+ ]*"
                placeholder="09xxxxxxxx"
                value={customer.phone}
                onChange={(e) => updateCustomer("phone", e.target.value)}
                className="shadow-sm"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-muted">
                Address
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter address"
                value={customer.address}
                onChange={(e) => updateCustomer("address", e.target.value)}
                className="shadow-sm"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowCustomerModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowCustomerModal(false)}>
            Save Details
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirm Modal */}
      <Modal
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        centered
        size="sm"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Confirm Checkout</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="fs-1 mb-2">💰</div>
          <p className="mb-0">
            Total: <strong className="fs-4">{total.toLocaleString()} Ks</strong>
          </p>
          <small className="text-muted">Proceed with checkout?</small>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center gap-2">
          <Button
            variant="light"
            className="px-4"
            onClick={() => {
              confirmResolver(false);
              setShowConfirm(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            className="px-4 fw-bold"
            onClick={() => {
              confirmResolver(true);
              setShowConfirm(false);
            }}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

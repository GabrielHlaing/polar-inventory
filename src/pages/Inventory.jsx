import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Card } from "react-bootstrap";
import { useItems } from "../contexts/ItemsContext";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { useProfile } from "../contexts/ProfileContext";
import Header from "../components/Header";

export default function Inventory() {
  const navigate = useNavigate();
  const { items, loading, addItem } = useItems();
  const { addToCart, totalCount } = useCart();
  const { profile, expWarningDays, updateExpWarningDays } = useProfile();

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customDays, setCustomDays] = useState("");

  /* ---------- search ---------- */
  const [search, setSearch] = useState("");

  /* ---------- add item modal ---------- */
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [mfgDate, setMfgDate] = useState("");
  const [expDate, setExpDate] = useState("");

  const [processing, setProcessing] = useState(false); // double-click guard

  const clean = (str) =>
    str
      ? String(str)
          .toLowerCase()
          .replace(/[^a-z0-9]/gi, "")
      : "";

  function getExpColor(exp) {
    if (!exp) return "text-dark";

    const expDate = new Date(exp);
    const diff = expDate - new Date();
    const daysLeft = diff / (1000 * 60 * 60 * 24);

    if (daysLeft <= expWarningDays) return "text-danger";
    return "text-dark";
  }

  const filteredItems = (items ?? [])
    .filter((i) => i?.name)
    .filter((i) => clean(i.name).includes(clean(search)));

  const openAddModal = () => {
    setName("");
    setPurchasePrice("");
    setSalePrice("");
    const today = new Date().toISOString().split("T")[0];
    setMfgDate(today);
    setExpDate("");
    setShowModal(true);
  };

  const saveItem = async () => {
    if (processing) return;
    setProcessing(true);
    const { error } = await addItem({
      name,
      qty: 0,
      purchase_price: Number(purchasePrice) || null,
      sale_price: Number(salePrice) || null,
      mfg_date: mfgDate || null,
      exp_date: expDate || null,
      user_id: profile.id,
    });

    setProcessing(false);

    if (error) {
      toast.error(error.message || "Failed to add item.");
      return;
    }
    toast.success("Item added!");
    setShowModal(false);
  };

  /* ---------- Inventory Skeleton Loaders ---------- */
  const SkeletonTable = () => (
    <Card className="border-0 shadow-sm mb-3">
      <Card.Body className="p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 60 }}>
                  <SkeletonBox w={40} />
                </th>
                <th>
                  <SkeletonBox w={120} />
                </th>
                <th style={{ width: 100 }}>
                  <SkeletonBox w={60} />
                </th>
                <th style={{ width: 110 }}>
                  <SkeletonBox w={28} />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td>
                    <SkeletonBox w={24} />
                  </td>
                  <td>
                    <SkeletonBox w="80%" />
                  </td>
                  <td>
                    <SkeletonBox w={50} />
                  </td>
                  <td className="text-center">
                    <SkeletonBtn />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card.Body>
    </Card>
  );

  const SkeletonCards = () => (
    <div className="row g-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="col-12">
          <Card className="shadow-sm border-0 p-3">
            <div className="d-flex align-items-center gap-3">
              <SkeletonBox w={40} h={40} />
              <div className="flex-grow-1">
                <SkeletonBox w="70%" />
                <SkeletonBox w={40} />
              </div>
              <SkeletonBtn />
            </div>
          </Card>
        </div>
      ))}
    </div>
  );

  /* ---------- atomic shapes ---------- */
  const SkeletonBox = ({ w, h = 24, round = false, className = "" }) => (
    <div
      className={`placeholder ${className}`}
      style={{
        width: typeof w === "number" ? `${w}px` : w,
        height: `${h}px`,
        borderRadius: round ? "50%" : 6,
        background:
          "linear-gradient(90deg, #e0eafc 0%, #cfdef3 50%, #e0eafc 100%)",
        backgroundSize: "200% 100%",
        animation: "placeholder-glow 1.5s ease-in-out infinite",
      }}
    />
  );

  const SkeletonBtn = () => (
    <div
      className="placeholder"
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background:
          "linear-gradient(90deg, #c2d6ff 0%, #a8c4ff 50%, #c2d6ff 100%)",
        backgroundSize: "200% 100%",
        animation: "placeholder-glow 1.5s ease-in-out infinite",
      }}
    />
  );

  return (
    <div
      className="container py-4"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
        marginBottom: 80,
      }}
    >
      <Header />
      <Navbar />
      {/* header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-0">Inventory</h1>
          <small className="text-muted">Manage your products</small>
        </div>

        <button
          className="btn btn-primary btn-sm shadow-sm"
          onClick={openAddModal}
        >
          + Add Item
        </button>
      </div>

      {/* search */}
      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control form-control-sm shadow-sm"
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ maxWidth: "150px" }}
          value={
            [0, 7, 30, 90].includes(expWarningDays)
              ? String(expWarningDays)
              : "custom"
          }
          onChange={(e) => {
            if (e.target.value === "custom") {
              setShowCustomModal(true);
            } else {
              updateExpWarningDays(Number(e.target.value));
            }
          }}
        >
          <option value="">Warn exp in…</option>
          <option value="7">7 days</option>
          <option value="30">1 month</option>
          <option value="90">3 months</option>
          <option value="custom">Custom…</option>
        </select>
      </div>

      {loading && (
        <>
          <div className="d-none d-md-block">
            <SkeletonTable />
          </div>
          <div className="d-md-none">
            <SkeletonCards />
          </div>
        </>
      )}

      {!loading && items.length === 0 && (
        <p className="text-muted">No items yet.</p>
      )}

      {!loading && filteredItems.length === 0 && items.length > 0 && (
        <p className="text-muted">No results found.</p>
      )}

      {!loading && filteredItems.length > 0 && (
        <div className="table-responsive d-none d-md-block">
          <div className="card shadow-sm border-0">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th style={{ width: 110 }}>Add to cart</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((it, idx) => (
                  <tr
                    key={it.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/inventory/${it.id}`)}
                  >
                    <td>{idx + 1}</td>
                    <td className={getExpColor(it.exp_date)}>{it.name}</td>
                    <td>
                      <span>{it.qty}</span>
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        style={{ width: 28, height: 28 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(it);
                        }}
                      >
                        +
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile view*/}
      {!loading && filteredItems.length > 0 && (
        <div className="row g-2 d-md-none">
          {filteredItems.map((it, idx) => (
            <div key={it.id} className="col-12">
              <div
                className="card shadow-sm border-0 p-3"
                style={{
                  cursor: "pointer",
                  borderRadius: 14,
                }}
                onClick={() => navigate(`/inventory/${it.id}`)}
              >
                <div
                  className="d-grid align-items-center"
                  style={{
                    gridTemplateColumns: "3fr 1fr auto",
                    columnGap: "15px",
                  }}
                >
                  <span className="fw-semibold text-truncate ">
                    <span className={getExpColor(it.exp_date)}>
                      {idx + 1}. {it.name}
                    </span>
                  </span>

                  <span
                    className="badge bg-light text-dark border text-nowrap"
                    style={{ fontSize: 12 }}
                  >
                    Qty: {it.qty}
                  </span>

                  <button
                    className="btn btn-sm btn-outline-primary rounded-circle"
                    style={{ width: 30, height: 30 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(it);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating cart button */}
      {totalCount > 0 && (
        <button
          onClick={() => navigate("/cart")}
          aria-label="Open cart"
          style={{
            position: "fixed",
            bottom: 88, // clears navbar + thumb reach
            right: 20,
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg, #133a7fff 0%, #319ea2ff 100%)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "1rem",
            boxShadow:
              "0 10px 25px rgba(47, 111, 237, 0.45), inset 0 1px 2px rgba(255,255,255,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1051,
            transition: "transform .15s ease, box-shadow .15s ease",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {totalCount}
        </button>
      )}

      {/* ----------  add-item modal  ---------- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Purchase Price</Form.Label>
              <Form.Control
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Sale Price</Form.Label>
              <Form.Control
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>MFG Date</Form.Label>
              <Form.Control
                type="date"
                value={mfgDate}
                onChange={(e) => setMfgDate(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>EXP Date</Form.Label>
              <Form.Control
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            style={{ backgroundColor: "#2b6cb0", border: "none" }}
            onClick={saveItem}
            disabled={processing}
          >
            {processing ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Custom warning date */}
      <Modal show={showCustomModal} onHide={() => setShowCustomModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Custom Warning Days</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group>
            <Form.Label>Warn me when expiry is within...</Form.Label>
            <Form.Control
              type="number"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              placeholder="Enter days"
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCustomModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const val = Number(customDays);
              if (!isNaN(val) && val > 0) {
                updateExpWarningDays(val);
                setShowCustomModal(false);
                setCustomDays("");
              }
            }}
          >
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

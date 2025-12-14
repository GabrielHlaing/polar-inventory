import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Placeholder } from "react-bootstrap";
import { useItems } from "../contexts/ItemsContext";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { useProfile } from "../contexts/ProfileContext";
import Header from "../components/Header";
import useUpToHome from "../hooks/useUpToHome";

export default function Inventory() {
  useUpToHome();

  const navigate = useNavigate();
  const { items, loading, addItem } = useItems();
  const { addToCart, totalCount } = useCart();
  const { profile } = useProfile();

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

  /* ---------- skeleton loader ---------- */
  const SkeletonCard = () => (
    <div className="col-12">
      <div className="card shadow-sm p-3">
        <Placeholder animation="glow">
          <Placeholder xs={4} />
        </Placeholder>
      </div>
    </div>
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
      <div className="mb-3">
        <input
          type="text"
          className="form-control form-control-sm shadow-sm"
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* loader */}
      {loading && (
        <div className="row g-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
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
                    <td>{it.name}</td>
                    <td>
                      <span>{it.qty}</span>
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        style={{ width: 28, height: 28 }}
                        disabled={it.qty < 1}
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
                  <span className="fw-semibold text-truncate">
                    {idx + 1}. {it.name}
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

      {/* floating cart badge */}
      {totalCount > 0 && (
        <button
          className="btn btn-primary position-fixed shadow-lg"
          onClick={() => navigate("/cart")}
          style={{
            bottom: 80,
            right: 50,
            borderRadius: 999,
            padding: "12px 20px",
            fontWeight: 600,
          }}
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
    </div>
  );
}

import { useParams, useNavigate } from "react-router-dom";
import { useItems } from "../contexts/ItemsContext";
import { useCart } from "../contexts/CartContext";
import { useEffect, useState } from "react";
import { Modal, Button, Form, Card, Badge, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import FabBack from "../components/FabBack";
import { FaTrash } from "react-icons/fa";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, deleteItem, updateItem } = useItems();
  const { addToCart } = useCart();

  const item = items.find((i) => i.id === id);

  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editQty, setEditQty] = useState("");
  const [editPurchase, setEditPurchase] = useState("");
  const [editSale, setEditSale] = useState("");
  const [editMfg, setEditMfg] = useState("");
  const [editExp, setEditExp] = useState("");

  useEffect(() => {
    if (!item) navigate("/inventory", { replace: true });
  }, [item, navigate]);

  if (!item) return null;

  const openEditModal = () => {
    setEditName(item.name);
    setEditQty(item.qty);
    setEditPurchase(item.purchase_price ?? "");
    setEditSale(item.sale_price ?? "");
    setEditMfg(item.mfg_date ?? "");
    setEditExp(item.exp_date ?? "");
    setShowEdit(true);
  };

  const saveUpdates = async () => {
    const qty = Number(editQty);

    if (!Number.isFinite(qty) || qty < 0) {
      toast.error("Quantity cannot be negative");
      return;
    }

    await updateItem(id, {
      name: editName.trim(),
      qty,
      purchase_price:
        editPurchase === "" ? null : Math.max(0, Number(editPurchase)),
      sale_price: editSale === "" ? null : Math.max(0, Number(editSale)),
      mfg_date: editMfg || null,
      exp_date: editExp || null,
    });

    toast.success("Item updated");
    setShowEdit(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this item permanently?");
    if (confirmed) {
      await deleteItem(id);
      toast.info("Item deleted");
      navigate("/inventory");
    }
  };

  /* ---------- detail card ---------- */
  const DetailCard = () => (
    <Card
      className="border-0 shadow-lg mb-4"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f9fbfd 100%)",
        borderRadius: 16,
      }}
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold" style={{ color: "#2b6cb0" }}>
            {item.name}
          </h4>
          <Badge bg="secondary">Qty: {item.qty}</Badge>
        </div>

        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <div className="text-muted small">Purchase</div>
            <div className="fw-semibold">{item.purchase_price ?? "-"}</div>
          </Col>
          <Col xs={6} md={3}>
            <div className="text-muted small">Sale</div>
            <div className="fw-semibold">{item.sale_price ?? "-"}</div>
          </Col>
          <Col xs={6} md={3}>
            <div className="text-muted small">Mfg</div>
            <div className="fw-semibold">
              {item.mfg_date
                ? new Date(item.mfg_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "-"}
            </div>
          </Col>
          <Col xs={6} md={3}>
            <div className="text-muted small">Exp</div>
            <div className="fw-semibold">
              {item.exp_date
                ? new Date(item.exp_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "-"}
            </div>
          </Col>
          <Col xs={12}>
            <div className="text-muted small">Created</div>
            <div className="fw-semibold">
              {item.created_at
                ? new Date(item.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "-"}
            </div>
          </Col>
        </Row>

        <div className="d-flex flex-wrap gap-2">
          <Button
            variant="success"
            className="rounded-pill px-3"
            onClick={() => {
              addToCart(item);
            }}
          >
            Add to Cart
          </Button>

          <Button
            className="rounded-pill px-3"
            style={{ background: "#2b6cb0", border: "none" }}
            onClick={openEditModal}
          >
            Edit
          </Button>

          <Button
            variant="outline-danger"
            className="rounded-pill px-3"
            onClick={handleDelete}
            disabled={!navigator.onLine}
          >
            <FaTrash />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="container py-4" style={{ maxWidth: 680, marginTop: 30 }}>
      <FabBack />

      <h1 className="fw-bold mb-4">Item Details</h1>

      <DetailCard />

      {/* ONE permanent modal – never re-created */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header
          closeButton
          style={{
            background: "linear-gradient(135deg, #2b6cb0 0%, #5a9fd4 100%)",
            color: "#fff",
          }}
        >
          <Modal.Title>Edit Item</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                min={0}
                inputMode="numeric"
                value={editQty}
                onChange={(e) => {
                  const val = e.target.value;

                  // allow empty while typing
                  if (val === "") {
                    setEditQty("");
                    return;
                  }

                  // block negatives
                  if (Number(val) < 0) return;

                  setEditQty(val);
                }}
                onBlur={() => {
                  // normalize on blur
                  if (editQty === "") {
                    setEditQty(0);
                  }
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Purchase Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={editPurchase}
                onChange={(e) => setEditPurchase(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Sale Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={editSale}
                onChange={(e) => setEditSale(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mfg Date</Form.Label>
              <Form.Control
                type="date"
                value={editMfg}
                onChange={(e) => setEditMfg(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Exp Date</Form.Label>
              <Form.Control
                type="date"
                value={editExp}
                onChange={(e) => setEditExp(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowEdit(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            style={{ backgroundColor: "#2b6cb0", border: "none" }}
            onClick={saveUpdates}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

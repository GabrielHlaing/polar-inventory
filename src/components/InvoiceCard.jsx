import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Badge, Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaUser, FaPhoneAlt, FaAddressBook } from "react-icons/fa";

export default function InvoiceCard({
  invoice,
  onEdit,
  onDelete,
  loadItems,
  processing,
}) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    ...invoice,
    history: Array.isArray(invoice.history) ? [...invoice.history] : [],
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const data = isEditing ? editData : invoice;
  const items = data.history || [];
  const customer = data.customer;
  const isPurchase = data.type === "purchase";

  const formattedDateTime = new Date(data.created_at).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );

  const getPrice = (item) =>
    isPurchase
      ? Number(item.purchase_price || 0)
      : Number(item.sale_price || 0);

  const calcTotal = (item) => Number(item.qty_change) * getPrice(item);

  /* ---------- live subtotal while editing ---------- */
  const subtotal = isEditing
    ? (editData.history || []).reduce(
        (s, i) =>
          s +
          Number(i.qty_change) *
            (isPurchase
              ? Number(i.purchase_price || 0)
              : Number(i.sale_price || 0)),
        0
      )
    : (invoice.history || []).reduce(
        (s, i) =>
          s +
          Number(i.qty_change) *
            (isPurchase
              ? Number(i.purchase_price || 0)
              : Number(i.sale_price || 0)),
        0
      );

  /* ---------- edit ---------- */
  const handleStartEdit = () => {
    setEditData({
      ...invoice,
      history: Array.isArray(invoice.history) ? [...invoice.history] : [],
    });
    setIsEditing(true);
    setOpen(true);
  };

  /* ---------- save ---------- */
  // InvoiceCard.jsx
  const handleSaveEdit = async () => {
    if (processing || saving) return;

    setSaving(true);

    // guarantee we always send an array
    const safeHistory = Array.isArray(editData.history) ? editData.history : [];

    const freshTotal = safeHistory.reduce(
      (s, i) =>
        s +
        Number(i.qty_change) *
          (isPurchase
            ? Number(i.purchase_price || 0)
            : Number(i.sale_price || 0)),
      0
    );

    await onEdit({
      ...editData,
      history: safeHistory,
      total_amount: freshTotal,
    });

    toast.success("Editing successful!");
    setIsEditing(false);
    setSaving(false);
    loadItems();
  };

  /* ---------- delete ---------- */
  const confirmDelete = async () => {
    if (processing) return;
    setShowDeleteModal(false);
    await onDelete(invoice.id);
    toast.info("Invoice deleted!");
    loadItems();
  };

  const updateItemField = (id, field, value) =>
    setEditData((p) => {
      const history = Array.isArray(p.history) ? p.history : [];

      return {
        ...p,
        history: history.map((i) =>
          i.id === id ? { ...i, [field]: value } : i
        ),
      };
    });

  return (
    <>
      <Card className="mb-1 shadow-sm border-0">
        {/* ---------- HEADER ---------- */}
        <Card.Header
          className="d-flex justify-content-between align-items-center py-3"
          role="button"
          onClick={() => setOpen((v) => !v)}
        >
          <div>
            <div className="fw-bold fs-6">
              Invoice #{invoice.invoice_number}
            </div>
            <small className="text-muted">{formattedDateTime}</small>
          </div>

          <div className="text-end">
            <Badge bg={isPurchase ? "primary" : "success"} className="mb-1">
              {data.type}
            </Badge>
            <div className="fw-semibold">
              {data.total_amount?.toLocaleString()} Ks
            </div>
          </div>
        </Card.Header>

        {/* ---------- BODY ---------- */}
        {open && (
          <Card.Body
            className="border-top"
            style={{ backgroundColor: "#edededed", border: "1px solid #ddd" }}
          >
            {/* ACTIONS */}
            <div className="d-flex justify-content-end gap-2 mb-3">
              {!isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    as={Link}
                    to={`/history/${invoice.id}/print`}
                  >
                    Print
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit();
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal(true);
                    }}
                  >
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="success"
                    onClick={handleSaveEdit}
                    disabled={processing}
                  >
                    {processing ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>

            {/* CUSTOMER */}
            <Card className="mb-3 border-0 shadow-sm">
              <Card.Body>
                <div className="fw-semibold mb-2">Customer</div>
                {customer ? (
                  <div className="row small text-muted">
                    {customer.name && (
                      <div className="col-md-4">
                        <FaUser className="me-1" />
                        {customer.name}
                      </div>
                    )}
                    {customer.phone && (
                      <div className="col-md-4">
                        <FaPhoneAlt className="me-1" />
                        {customer.phone}
                      </div>
                    )}
                    {customer.address && (
                      <div className="col-md-4">
                        <FaAddressBook className="me-1" />
                        {customer.address}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="fst-italic text-muted">No customer info</div>
                )}
              </Card.Body>
            </Card>

            {/* ITEMS */}
            <div className="mb-3">
              {/* desktop header */}
              <div className="d-none d-md-flex fw-semibold small text-muted px-2 mb-2">
                <div className="col-5">Item</div>
                <div className="col-2 text-center">Qty</div>
                <div className="col-2 text-end">Price</div>
                <div className="col-3 text-end">Total</div>
              </div>

              {items.map((item) => (
                <Card key={item.id} className="mb-2 border-0 shadow-sm">
                  <Card.Body className="py-2">
                    <div className="row align-items-center">
                      {/* name */}
                      <div className="col-md-5 fw-medium">
                        {isEditing ? (
                          <Form.Control
                            size="sm"
                            value={item.metadata?.name || ""}
                            onChange={(e) =>
                              updateItemField(item.id, "metadata", {
                                ...item.metadata,
                                name: e.target.value,
                              })
                            }
                          />
                        ) : (
                          item.metadata?.name
                        )}
                      </div>

                      {/* qty */}
                      <div className="col-md-2 text-md-center small">
                        <span className="d-md-none text-muted">Qty: </span>
                        {isEditing ? (
                          <Form.Control
                            size="sm"
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={item.qty_change ?? ""}
                            onChange={(e) =>
                              updateItemField(
                                item.id,
                                "qty_change",
                                e.target.value === "" ? "" : e.target.value
                              )
                            }
                            onBlur={(e) =>
                              updateItemField(
                                item.id,
                                "qty_change",
                                Math.max(1, Number(e.target.value || 1))
                              )
                            }
                          />
                        ) : (
                          item.qty_change
                        )}
                      </div>

                      {/* price */}
                      <div className="col-md-2 text-md-end small">
                        <span className="d-md-none text-muted">Price: </span>
                        {isEditing ? (
                          <Form.Control
                            size="sm"
                            type="number"
                            value={getPrice(item)}
                            onChange={(e) =>
                              updateItemField(
                                item.id,
                                isPurchase ? "purchase_price" : "sale_price",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          `${getPrice(item).toLocaleString()} Ks`
                        )}
                      </div>

                      {/* total */}
                      <div className="col-md-3 text-md-end fw-semibold">
                        <span className="d-md-none text-muted">Total: </span>
                        {calcTotal(item).toLocaleString()} Ks
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>

            {/* TOTAL */}
            <div className="d-flex justify-content-end">
              <Card className="border-0 shadow-sm">
                <Card.Body className="fw-bold">
                  Grand Total: {subtotal.toLocaleString()} Ks
                </Card.Body>
              </Card>
            </div>
          </Card.Body>
        )}
      </Card>

      {/* DELETE MODAL */}
      <Modal
        show={showDeleteModal}
        centered
        onHide={() => setShowDeleteModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Invoice #{invoice.invoice_number} will be deleted permanently.
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={confirmDelete}
            disabled={processing}
          >
            {processing ? "Deleting…" : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

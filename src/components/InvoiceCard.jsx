import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Badge, Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaAddressBook, FaPhoneAlt, FaUser } from "react-icons/fa";

export default function InvoiceCard({
  invoice,
  onEdit,
  onDelete,
  loadItems,
  processing,
}) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(invoice);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const customer = invoice.customer;
  const items = (isEditing ? editData.history : invoice.history) || [];
  const isPurchase = (isEditing ? editData.type : invoice.type) === "purchase";
  const formattedDate = new Date(
    isEditing ? editData.created_at : invoice.created_at
  ).toLocaleDateString();

  const getPrice = (item) =>
    isPurchase
      ? Number(item.purchase_price || 0)
      : Number(item.sale_price || 0);
  const calcTotal = (item) => Number(item.qty_change) * getPrice(item);

  /* ---------- edit ---------- */
  const handleStartEdit = () => {
    setEditData(invoice);
    setIsEditing(true);
    setOpen(true);
  };

  const handleCancelEdit = () => setIsEditing(false);

  const handleSaveEdit = async () => {
    if (processing) return;
    const updated = {
      ...editData,
      total_amount: editData.history.reduce((s, i) => s + calcTotal(i), 0),
    };
    await onEdit(invoice.id, updated);
    toast.success("Invoice updated");
    setIsEditing(false);
    loadItems();
  };

  /* ---------- delete ---------- */
  const confirmDelete = async () => {
    if (processing) return;
    setShowDeleteModal(false);
    await onDelete(invoice.id);
    toast.success("Invoice deleted");
    loadItems();
  };

  /* ---------- item field update ---------- */
  const updateItemField = (itemId, field, value) =>
    setEditData((p) => ({
      ...p,
      history: p.history.map((i) =>
        i.id === itemId ? { ...i, [field]: value } : i
      ),
    }));

  /* ---------- UI helpers ---------- */
  const Pill = ({ children, bg }) => (
    <Badge bg={bg} className="ms-auto">
      {children}
    </Badge>
  );

  return (
    <>
      <Card
        className="mb-3 shadow-sm border-0"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen((v) => !v)}
      >
        <Card.Header className="d-flex justify-content-between align-items-center py-3">
          <div>
            <div className="fw-bold">Invoice #{invoice.invoice_number}</div>
            <small className="text-muted">{formattedDate}</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Pill bg={isPurchase ? "primary" : "success"}>{invoice.type}</Pill>
            <div className="fw-semibold">
              {invoice.total_amount?.toLocaleString()} Ks
            </div>
          </div>
        </Card.Header>

        <Card.Body className={open ? "border-top bg-light" : "d-none"}>
          {/* actions */}
          <div className="d-flex flex-wrap justify-content-end gap-2 mb-3">
            {!isEditing && (
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
            )}
            {isEditing && (
              <>
                <Button
                  size="sm"
                  variant="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveEdit();
                  }}
                  disabled={processing}
                >
                  {processing ? "Saving…" : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelEdit();
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>

          {/* customer info */}
          <Card
            className="mb-3 border-0"
            style={{
              background: "linear-gradient(135deg,#e6f7ff 0%,#ffffff 100%)",
            }}
          >
            <Card.Body>
              <div className="fw-semibold mb-2">Customer</div>
              {customer ? (
                <div className="small">
                  {customer.name && (
                    <div>
                      <FaUser /> {customer.name}
                    </div>
                  )}
                  {customer.phone && (
                    <div>
                      <FaPhoneAlt /> {customer.phone}
                    </div>
                  )}
                  {customer.address && (
                    <div className="text-muted">
                      <FaAddressBook /> {customer.address}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted fst-italic">No customer info</div>
              )}
            </Card.Body>
          </Card>

          {/* items table */}
          <Card className="border-0">
            <Card.Header className="d-none d-md-flex bg-transparent fw-semibold small">
              <div className="col-5">Item</div>
              <div className="col-2 text-center">Qty</div>
              <div className="col-2 text-end">Price</div>
              <div className="col-3 text-end">Total</div>
            </Card.Header>
            <Card.Body className="p-0">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="d-flex flex-column flex-md-row align-items-md-center border-bottom py-2 px-3 gap-2"
                >
                  {/* name */}
                  <div className="flex-fill">
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
                      <div className="fw-medium">{item.metadata?.name}</div>
                    )}
                  </div>

                  {/* qty */}
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted d-md-none">Qty:</span>
                    {isEditing ? (
                      <Form.Control
                        size="sm"
                        type="number"
                        min={1}
                        value={item.qty_change}
                        onChange={(e) =>
                          updateItemField(
                            item.id,
                            "qty_change",
                            Number(e.target.value)
                          )
                        }
                        style={{ width: 70 }}
                      />
                    ) : (
                      <div className="text-center">{item.qty_change}</div>
                    )}
                  </div>

                  {/* price */}
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted d-md-none">Price:</span>
                    {isEditing ? (
                      <Form.Control
                        size="sm"
                        type="number"
                        step="0.01"
                        value={getPrice(item)}
                        onChange={(e) =>
                          updateItemField(
                            item.id,
                            isPurchase ? "purchase_price" : "sale_price",
                            e.target.value
                          )
                        }
                        style={{ width: 100 }}
                      />
                    ) : (
                      <div className="text-end">
                        {getPrice(item).toLocaleString()} Ks
                      </div>
                    )}
                  </div>

                  {/* total */}
                  <div className="fw-semibold text-end">
                    {calcTotal(item).toLocaleString()} Ks
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* grand total */}
          <div className="text-end mt-3">
            <div className="fw-bold">
              Subtotal:{" "}
              {items.reduce((s, i) => s + calcTotal(i), 0).toLocaleString()} Ks
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* delete confirmation modal */}
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

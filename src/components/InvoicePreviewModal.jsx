import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import Receipt from "./Receipt";

export default function InvoicePreviewModal({ shop, invoice }) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="outline-primary" size="sm" onClick={handleShow}>
        Preview
      </Button>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Invoice Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {/* same receipt you already use for printing */}
          <Receipt shop={shop} invoice={invoice} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

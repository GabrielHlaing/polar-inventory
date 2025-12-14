import { useEffect, useState } from "react";
import { useHistoryData } from "../contexts/HistoryContext";
import getMonthlySummary from "../components/summary";
import InvoiceCard from "../components/InvoiceCard";
import { useItems } from "../contexts/ItemsContext";
import { Form, Button, Card, Placeholder, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import FabBack from "../components/FabBack";

export default function History() {
  const { fetchInvoicesByMonth, historyCache, editInvoice, deleteInvoice } =
    useHistoryData();
  const { loadItems } = useItems();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [processing, setProcessing] = useState(false); // double-click guard

  const key = `${year}-${String(month).padStart(2, "0")}`;
  const rawInvoices = historyCache[key]?.invoices || [];
  const invoices = [...rawInvoices].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const summary = getMonthlySummary(invoices);

  const filteredInvoices = invoices.filter((inv) => {
    if (typeFilter === "all") return true;
    return inv.history.some((h) => h.type === typeFilter);
  });

  useEffect(() => {
    fetchInvoicesByMonth(year, month);
  }, [year, month]);

  /* ---------- handlers with toast & guard ---------- */
  const handleDelete = async (id) => {
    if (processing) return;
    setProcessing(true);
    await deleteInvoice(id);
    toast.success("Invoice deleted");
    setProcessing(false);
  };

  const handleEdit = async (inv, updates) => {
    if (processing) return;
    setProcessing(true);
    await editInvoice(inv.id, updates);
    toast.success("Invoice updated");
    setProcessing(false);
  };

  /* ---------- skeleton loader ---------- */
  const SkeletonCard = () => (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <Placeholder animation="glow">
          <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={3} />
        </Placeholder>
      </Card.Body>
    </Card>
  );

  /* ---------- month selector ---------- */
  const MonthSelector = () => (
    <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
      <Form.Select
        value={month}
        onChange={(e) => setMonth(Number(e.target.value))}
        style={{ maxWidth: 160 }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <option key={i} value={i + 1}>
            {new Date(0, i).toLocaleString("default", { month: "long" })}
          </option>
        ))}
      </Form.Select>

      <Form.Control
        type="number"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        style={{ maxWidth: 100 }}
      />

      <Badge bg="secondary" className="ms-auto">
        {filteredInvoices.length} invoice
        {filteredInvoices.length !== 1 ? "s" : ""}
      </Badge>
    </div>
  );

  /* ---------- filter pills ---------- */
  const FilterPills = () => (
    <div className="d-flex flex-wrap gap-2 mb-3">
      {["all", "sale", "purchase"].map((f) => (
        <Button
          key={f}
          size="sm"
          variant={typeFilter === f ? "primary" : "outline-primary"}
          style={
            typeFilter === f
              ? { backgroundColor: "#72b3f7", borderColor: "#72b3f7" }
              : {}
          }
          onClick={() => setTypeFilter(f)}
        >
          {f === "all" ? "All" : f === "sale" ? "Sales" : "Purchases"}
        </Button>
      ))}
    </div>
  );

  /* ---------- summary cards ---------- */
  const SummaryCards = () => (
    <div className="row g-3 mb-4">
      <div className="col-6">
        <Card
          className="h-100 shadow-sm border-0"
          style={{
            background: "linear-gradient(135deg,#e6f7ff 0%,#ffffff 100%",
          }}
        >
          <Card.Body className="d-flex flex-column justify-content-between">
            <div className="text-muted small">Sales</div>
            <div className="fs-4 fw-semibold text-success">
              {summary.totalSales} Ks
            </div>
          </Card.Body>
        </Card>
      </div>
      <div className="col-6">
        <Card
          className="h-100 shadow-sm border-0"
          style={{
            background: "linear-gradient(135deg,#fff4e6 0%,#ffffff 100%",
          }}
        >
          <Card.Body className="d-flex flex-column justify-content-between">
            <div className="text-muted small">Purchases</div>
            <div className="fs-4 fw-semibold text-primary">
              {summary.totalPurchase} Ks
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );

  /* ---------- invoice list ---------- */
  const InvoiceList = () =>
    filteredInvoices.map((inv) => (
      <InvoiceCard
        key={inv.id}
        invoice={inv}
        onEdit={(upd) => handleEdit(inv, upd)}
        onDelete={() => handleDelete(inv.id)}
        loadItems={loadItems}
        processing={processing}
      />
    ));

  return (
    <div className="container py-3" style={{ marginBottom: 80 }}>
      <FabBack toHome />
      <h1 className="fw-bold mb-4">History</h1>
      <MonthSelector />
      <FilterPills />
      <SummaryCards />

      {filteredInvoices.length === 0 && !historyCache[key]?.loading && (
        <Card className="shadow-sm border-0">
          <Card.Body className="text-center text-muted">
            No invoices for this period.
          </Card.Body>
        </Card>
      )}

      {historyCache[key]?.loading && (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}

      <div className="d-flex flex-column gap-3">
        {!historyCache[key]?.loading && <InvoiceList />}
      </div>
    </div>
  );
}

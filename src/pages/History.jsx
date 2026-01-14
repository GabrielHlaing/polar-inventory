import { useEffect, useState } from "react";
import { useHistoryData } from "../contexts/HistoryContext";
import getMonthlySummary from "../components/summary";
import InvoiceCard from "../components/InvoiceCard";
import { useItems } from "../contexts/ItemsContext";
import { Form, Button, Card, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import FabBack from "../components/FabBack";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function History() {
  const { fetchInvoicesByMonth, historyCache, editInvoice, deleteInvoice } =
    useHistoryData();
  const { loadItems } = useItems();
  const navigate = useNavigate();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [totalExpenses, setTotalExpenses] = useState(0);
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
  }, []);

  useEffect(() => {
    const loadExpenses = async () => {
      const start = new Date(year, month - 1, 1).toISOString();
      const end = new Date(year, month, 1).toISOString(); // next month (no off-by-one)

      const { data } = await supabase
        .from("expenses")
        .select("amount")
        .gte("created_at", start)
        .lt("created_at", end);

      const sum = (data || []).reduce((acc, e) => acc + Number(e.amount), 0);

      setTotalExpenses(sum);
    };

    loadExpenses();
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

  /* ---------- History Skeleton Loaders ---------- */
  const SkeletonHistory = () => (
    <div className="d-flex flex-column gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card shadow-sm border-0 p-3">
          <div className="d-flex justify-content-between align-items-start mb-1">
            <div>
              <SkeletonBox w={110} h={18} className="mb-1" />
              <SkeletonBox w={70} h={12} />
            </div>
            <div className="text-end">
              <SkeletonBox w={60} h={14} className="mb-1" />
              <SkeletonBox w={80} h={18} />
            </div>
          </div>

          <SkeletonBox w="60%" h={16} className="mb-1" />
          <SkeletonBox w="40%" h={16} />
        </div>
      ))}
    </div>
  );

  const SkeletonControls = () => (
    <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
      <SkeletonBox w={160} h={38} round />
      <SkeletonBox w={100} h={38} round />
      <SkeletonBox w={60} h={24} round className="ms-auto" />
    </div>
  );

  /* ---------- atomic shapes ---------- */
  const SkeletonBox = ({ w, h = 16, round = false, className = "" }) => (
    <div
      className={`placeholder ${className}`}
      style={{
        width: typeof w === "number" ? `${w}px` : w,
        height: `${h}px`,
        borderRadius: round ? 50 : 6,
        background:
          "linear-gradient(90deg, #e0eafc 0%, #cfdef3 50%, #e0eafc 100%)",
        backgroundSize: "200% 100%",
        animation: "placeholder-glow 1.5s ease-in-out infinite",
      }}
    />
  );

  /* ---------- filter pills ---------- */
  const FilterPills = () => (
    <div className="d-flex flex-wrap gap-2 mb-3">
      {["all", "sale", "purchase"].map((f) => (
        <Button
          key={f}
          size="sm"
          variant={typeFilter === f ? "primary" : "outline-primary"}
          onClick={() => setTypeFilter(f)}
        >
          {f === "all" ? "All" : f === "sale" ? "Sales" : "Purchases"}
        </Button>
      ))}
    </div>
  );

  const netProfit = summary.totalSales - summary.totalPurchase - totalExpenses;

  /* ---------- summary cards ---------- */
  const SummaryCards = () => (
    <div className="row g-3 mb-4">
      {/* Expenses + Net Profit */}
      <div className="col-12">
        <div className="row g-2">
          {/* Expenses */}
          <div
            className="col-6"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/expenses")}
          >
            <Card
              className="border-0 shadow-sm h-100"
              style={{
                background:
                  "linear-gradient(135deg, #ffe0e0 0%, #ffeeee 60%, #FFFFFF 100%)",
              }}
            >
              <Card.Body
                className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between py-2 px-3"
                style={{ minHeight: 56 }}
              >
                <div
                  className="text-uppercase"
                  style={{
                    fontSize: 11,
                    letterSpacing: 0.6,
                    color: "#784141",
                    fontWeight: 600,
                  }}
                >
                  Expenses
                </div>

                <div
                  className="fw-bold"
                  style={{ fontSize: 18, color: "#784141" }}
                >
                  {totalExpenses.toLocaleString()} Ks
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Net Profit */}
          <div className="col-6">
            <Card
              className="border-0 shadow-sm h-100"
              style={{
                background:
                  "linear-gradient(135deg, #fff4d3 0%, #FFF6D8 60%, #FFFFFF 100%)",
              }}
            >
              <Card.Body
                className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between py-2 px-3"
                style={{ minHeight: 56 }}
              >
                <div>
                  <div
                    className="text-uppercase"
                    style={{
                      fontSize: 11,
                      letterSpacing: 0.6,
                      color: "#6c5516",
                      fontWeight: 600,
                    }}
                  >
                    Net Profit
                  </div>
                </div>

                <div
                  className={`fw-bold ${
                    netProfit >= 0 ? "text-success" : "text-danger"
                  }`}
                  style={{ fontSize: 18 }}
                >
                  {netProfit.toLocaleString()} Ks
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>

      <div className="col-6">
        <Card
          className="h-100 shadow-sm border-0"
          style={{
            background: "linear-gradient(135deg,#B8E6FF 0%,#ffffff 100%",
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
            background: "linear-gradient(135deg,#FFE9C2 0%,#ffffff 100%",
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

      <FilterPills />
      <SummaryCards />

      {historyCache[key]?.loading && (
        <>
          <SkeletonControls />
          <SkeletonHistory />
        </>
      )}

      {filteredInvoices.length === 0 && !historyCache[key]?.loading && (
        <Card className="shadow-sm border-0">
          <Card.Body className="text-center text-muted">
            No invoices for this period.
          </Card.Body>
        </Card>
      )}

      <div className="d-flex flex-column gap-3">
        {!historyCache[key]?.loading && <InvoiceList />}
      </div>
    </div>
  );
}

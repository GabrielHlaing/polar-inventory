import React from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../contexts/DashboardContext";
import { useProfile } from "../contexts/ProfileContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { Card, Badge, Button, Row, Col } from "react-bootstrap";
import {
  BsCart4,
  BsBoxSeam,
  BsClockHistory,
  BsPlusLg,
  BsPerson,
} from "react-icons/bs";
import Navbar from "../components/Navbar";
import Header from "../components/Header";

export default function Home() {
  const navigate = useNavigate();
  const { kpis, series, topItems, refresh, lastFetched } = useDashboard();
  const { profile } = useProfile();
  const isPremium = profile?.tier === "premium";

  /* ---------- visual helpers ---------- */
  const GlassCard = ({ children, onClick }) => (
    <Card
      onClick={onClick}
      className="h-100 border-0 shadow-sm hover-shadow"
      style={{
        background: "rgba(255,255,255,.75)",
        backdropFilter: "blur(6px)",
        cursor: onClick ? "pointer" : "default",
        transition: "transform .2s, box-shadow .2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-2px)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
    >
      <Card.Body className="d-flex flex-column justify-content-between">
        {children}
      </Card.Body>
    </Card>
  );

  const NavigatorCard = () => (
    <Card
      className="mb-4 border-0 pb-2"
      style={
        isPremium
          ? {
              background: "linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)",
              boxShadow: "0 0 20px rgba(253, 203, 110, .5)",
              color: "#744210",
            }
          : { background: "#f5f5f5", color: "#6c757d" }
      }
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="fw-bold">Quick Navigator</span>
          <Badge
            bg={isPremium ? "warning" : "secondary"}
            text={isPremium ? "dark" : ""}
          >
            {isPremium ? "★ Premium" : "Free"}
          </Badge>
        </div>

        <Row className="g-2">
          <Col xs={6}>
            <Button
              variant={isPremium ? "outline-dark" : "outline-secondary"}
              className="w-100 rounded-pill d-flex align-items-center justify-content-center gap-2"
              onClick={() => navigate("/profile")}
            >
              <BsPerson /> Profile
            </Button>
          </Col>
          <Col xs={6}>
            <Button
              variant={isPremium ? "outline-dark" : "outline-secondary"}
              className="w-100 rounded-pill d-flex align-items-center justify-content-center gap-2"
              onClick={() => navigate("/inventory")}
            >
              <BsBoxSeam /> Inventory
            </Button>
          </Col>
          <Col xs={6}>
            <Button
              variant={isPremium ? "outline-dark" : "outline-secondary"}
              className="w-100 rounded-pill d-flex align-items-center justify-content-center gap-2"
              onClick={() => navigate("/history")}
            >
              <BsClockHistory /> History
            </Button>
          </Col>
          <Col xs={6}>
            <Button
              variant={isPremium ? "outline-dark" : "outline-secondary"}
              className="w-100 rounded-pill d-flex align-items-center justify-content-center gap-2"
              onClick={() => navigate("/more-info")}
            >
              <BsPlusLg /> More
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  /* ---------- KPI row ---------- */
  const KPICards = () => (
    <Row className="g-2 mb-4">
      <Col xs={6} onClick={() => navigate("/history")}>
        <GlassCard>
          <div className="text-xs text-muted">Sales (today)</div>
          <div className="fs-5 fw-bold text-success">
            {Number(kpis.todaySales || 0).toLocaleString()} Ks
          </div>
        </GlassCard>
      </Col>
      <Col xs={6} onClick={() => navigate("/history")}>
        <GlassCard>
          <div className="text-xs text-muted">Purchases (today)</div>
          <div className="fs-5 fw-bold text-primary">
            {Number(kpis.todayPurchases || 0).toLocaleString()} Ks
          </div>
        </GlassCard>
      </Col>
      <Col xs={6} onClick={() => navigate("/inventory")}>
        <GlassCard>
          <div className="text-xs text-muted">Total items</div>
          <div className="fs-5 fw-bold">{Number(kpis.totalStock || 0)}</div>
        </GlassCard>
      </Col>
      <Col xs={6} onClick={() => navigate("/inventory")}>
        <GlassCard>
          <div className="text-xs text-muted">Low stock</div>
          <div className="fs-5 fw-bold text-danger">
            {Number(kpis.lowStockCount || 0)}
          </div>
        </GlassCard>
      </Col>
    </Row>
  );

  /* ---------- chart ---------- */
  const ChartCard = () => (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-semibold">Last 30 days</span>
          <Button
            size="sm"
            variant="outline-secondary"
            className="rounded-pill"
            onClick={refresh}
          >
            Refresh
          </Button>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
              <YAxis />
              <Tooltip formatter={(val) => Number(val).toLocaleString()} />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke={isPremium ? "#f59e0b" : "#16a34a"}
                strokeWidth={isPremium ? 3 : 2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="purchases"
                stroke={isPremium ? "#3b82f6" : "#2563eb"}
                strokeWidth={isPremium ? 3 : 2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="text-end text-muted small">
          {lastFetched
            ? `Updated ${new Date(lastFetched).toLocaleTimeString()}`
            : ""}
        </div>
      </Card.Body>
    </Card>
  );

  /* ---------- top items ---------- */
  const TopItemsCard = () => (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="fw-semibold">Top Selling (30d)</span>
          <Button
            size="sm"
            variant="link"
            className="text-decoration-none"
            onClick={() => navigate("/history")}
          >
            See all
          </Button>
        </div>
        {topItems.length === 0 ? (
          <div className="text-muted small">No sales yet.</div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {topItems.map((it, idx) => (
              <div
                key={it.id}
                className="d-flex justify-content-between align-items-center px-3 py-2 rounded-pill"
                style={{ background: "#f8f9fa" }}
              >
                <div>
                  <div className="fw-medium">
                    {it.name}{" "}
                    {!it.is_active && (
                      <span className="text-muted small ms-2">(Deleted)</span>
                    )}
                  </div>
                  <div className="small text-muted">Sold: {it.qty}</div>
                </div>
                <Badge
                  bg={isPremium ? "warning" : "secondary"}
                  text={isPremium ? "dark" : ""}
                >
                  #{idx + 1}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );

  /* ---------- render ---------- */
  return (
    <div className="container py-4" style={{ maxWidth: 680, marginBottom: 80 }}>
      <Header />
      <Navbar />
      <h1 className="fw-bold mb-4">Dashboard</h1>
      <NavigatorCard />
      <KPICards />
      <ChartCard />
      <TopItemsCard />

      <style>{`
        .hover-shadow:hover { box-shadow: 0 .5rem 1rem rgba(0,0,0,.15) !important; }
      `}</style>
    </div>
  );
}

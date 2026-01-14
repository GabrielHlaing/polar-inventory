import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { useProfile } from "../contexts/ProfileContext";
import { Card, Button, Form, Modal, Row, Col, Badge } from "react-bootstrap";
import { toast } from "react-toastify";

import * as Fa from "react-icons/fa";
import * as Bs from "react-icons/bs";
import FabBack from "../components/FabBack";

/* ---------- icon whitelist (expense-related only) ---------- */
const ICONS = {
  FaBus: Fa.FaBus,
  FaCar: Fa.FaCar,
  FaGasPump: Fa.FaGasPump,
  BsFuelPump: Bs.BsFuelPump,

  FaWifi: Fa.FaWifi,
  FaBolt: Fa.FaBolt,
  FaWater: Fa.FaWater,
  FaPhone: Fa.FaPhoneAlt,

  FaShoppingCart: Fa.FaShoppingCart,
  FaUtensils: Fa.FaUtensils,
  FaStore: Fa.FaStore,

  FaTools: Fa.FaTools,
  FaWrench: Fa.FaWrench,
  FaHammer: Fa.FaHammer,

  FaMoneyBill: Fa.FaMoneyBill,
  BsCash: Bs.BsCash,

  FaHome: Fa.FaHome,
  FaHospital: Fa.FaHospital,
  FaBriefcase: Fa.FaBriefcase,
};

const getIcon = (iconName) => ICONS[iconName] || null;

export default function Expenses() {
  const { profile, isPremium } = useProfile();

  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- add expense modal ---------- */
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  /* ---------- create category ---------- */
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("FaMoneyBill");

  /* ---------- month filter ---------- */
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const start = `${month}-01`;
  const end = new Date(`${month}-01`);
  end.setMonth(end.getMonth() + 1);

  /* ---------- load data ---------- */
  const load = async () => {
    setLoading(true);

    const [{ data: cats }, { data: exps }] = await Promise.all([
      supabase
        .from("expense_categories")
        .select("*")
        .or(`user_id.is.null,user_id.eq.${profile.id}`)
        .order("name"),

      supabase
        .from("expenses")
        .select("*, expense_categories(name, icon)")
        .eq("user_id", profile.id)
        .gte("created_at", start)
        .lt("created_at", end.toISOString())
        .order("created_at", { ascending: false }),
    ]);

    setCategories(cats || []);
    setExpenses(exps || []);
    setLoading(false);
  };

  useEffect(() => {
    if (profile) load();
  }, [profile, month]);

  /* ---------- totals ---------- */
  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    [expenses]
  );

  /* ---------- add expense ---------- */
  const addExpense = async () => {
    if (!isPremium) {
      toast.warning("Premium required");
      return;
    }

    if (!amount || (!selectedCategory && !newCatName)) {
      toast.warning("Missing fields");
      return;
    }

    let categoryId = selectedCategory;

    if (!categoryId) {
      const { data: cat } = await supabase
        .from("expense_categories")
        .insert({
          name: newCatName,
          icon: newCatIcon,
          user_id: profile.id,
        })
        .select()
        .single();

      categoryId = cat.id;
    }

    await supabase.from("expenses").insert({
      user_id: profile.id,
      category_id: categoryId,
      amount,
      note,
    });

    toast.success("Expense added");
    setShowAdd(false);
    setAmount("");
    setNote("");
    setSelectedCategory("");
    setNewCatName("");
    load();
  };

  /* ---------- delete expense ---------- */
  const deleteExpense = async (id) => {
    if (!isPremium) return toast.warning("Premium required");
    if (!window.confirm("Delete this expense?")) return;

    await supabase.from("expenses").delete().eq("id", id);
    load();
  };

  /* ---------- delete category ---------- */
  const deleteCategory = async (categoryId) => {
    if (!isPremium) return toast.warning("Premium required");

    const { count } = await supabase
      .from("expenses")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId);

    if (count > 0) {
      toast.warning("Category is used in expense history");
      return;
    }

    if (!window.confirm("Delete this category?")) return;

    await supabase
      .from("expense_categories")
      .delete()
      .eq("id", categoryId)
      .eq("user_id", profile.id);

    toast.success("Category deleted");
    load();
  };

  if (!profile) return null;

  return (
    <div className="container py-4" style={{ maxWidth: 720, marginBottom: 80 }}>
      <FabBack />

      <Row className="align-items-center mb-3">
        <Col>
          <h1 className="fw-bold">Expenses</h1>
          {!isPremium && (
            <Badge bg="secondary">Premium feature (view only)</Badge>
          )}
        </Col>
        <Col xs="auto">
          <Form.Control
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </Col>
      </Row>

      <Card
        className="border-0 shadow-sm mb-4"
        style={{ background: "linear-gradient(90deg, #e1f1ff, #ffffff)" }}
      >
        <Card.Body className="d-flex justify-content-between">
          <div>
            <div className="text-muted small">Total this month</div>
            <div className="fw-bold fs-4" style={{ color: "#850000" }}>
              {total.toLocaleString()} Ks
            </div>
          </div>
          <Button disabled={!isPremium} onClick={() => setShowAdd(true)}>
            Add Expense
          </Button>
        </Card.Body>
      </Card>

      {loading ? (
        <p className="text-muted text-center">Loading…</p>
      ) : (
        expenses.map((e) => {
          const Icon = getIcon(e.expense_categories?.icon);
          return (
            <Card
              key={e.id}
              className="border-0 shadow-sm mb-2"
              style={{ background: "linear-gradient(90deg, #fff0f0, #ffffff)" }}
            >
              <Card.Body className="d-flex align-items-center">
                <div className="me-3 fs-4">{Icon && <Icon />}</div>

                <div className="flex-grow-1">
                  <div className="fw-semibold">
                    {e.expense_categories?.name}
                  </div>

                  {e.note && (
                    <div className="text-muted small fst-italic">{e.note}</div>
                  )}

                  <div className="text-muted small">
                    {new Date(e.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </div>
                </div>

                <div className="fw-bold me-3">
                  {Number(e.amount).toLocaleString()}
                </div>

                {isPremium && (
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => deleteExpense(e.id)}
                  >
                    ×
                  </Button>
                )}
              </Card.Body>
            </Card>
          );
        })
      )}

      {/* ---------- add expense modal ---------- */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Expense</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Category</Form.Label>

            <div className="d-flex gap-2">
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select category…</option>

                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>

              {isPremium &&
                selectedCategory &&
                (() => {
                  const cat = categories.find((c) => c.id === selectedCategory);
                  if (!cat || cat.user_id === null) return null;

                  return (
                    <Button
                      variant="outline-danger"
                      onClick={() => deleteCategory(selectedCategory)}
                    >
                      <Fa.FaTrash size={12} />
                    </Button>
                  );
                })()}
            </div>
          </Form.Group>

          {!selectedCategory && (
            <>
              <Form.Control
                className="mb-2"
                placeholder="Add new category"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />

              <div className="d-flex flex-wrap gap-2 mb-2">
                {Object.entries(ICONS).map(([key, Icon]) => (
                  <Button
                    key={key}
                    variant={
                      newCatIcon === key ? "primary" : "outline-secondary"
                    }
                    onClick={() => setNewCatIcon(key)}
                    style={{ width: 44, height: 44 }}
                  >
                    <Icon />
                  </Button>
                ))}
              </div>
            </>
          )}

          <Form.Control
            type="number"
            placeholder="Amount"
            className="mb-2"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Form.Control
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdd(false)}>
            Cancel
          </Button>
          <Button onClick={addExpense}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

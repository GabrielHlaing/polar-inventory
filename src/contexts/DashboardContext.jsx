// src/contexts/DashboardContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { subDays, format } from "date-fns";
import { useProfile } from "./ProfileContext";

const DashboardContext = createContext();

// helper: format date YYYY-MM-DD
const fmt = (d) => format(d, "yyyy-MM-dd");

export function DashboardProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    todaySales: 0,
    todayPurchases: 0,
    totalStock: 0,
    stockValuePurchase: 0,
    lowStockCount: 0,
  });
  const [series, setSeries] = useState([]); // [{date, sales, purchases}]
  const [topItems, setTopItems] = useState([]);
  const [lastFetched, setLastFetched] = useState(null);

  const { profile, loading: profileLoading } = useProfile();

  async function fetchKpisAndSeries() {
    setLoading(true);
    try {
      const today = new Date();
      const todayStr = fmt(today);
      const from30 = subDays(today, 29);
      const fromStr = fmt(from30);

      // 1) Today's sales & purchases (by invoice_date)
      const { data: invoices, error: invErr } = await supabase
        .from("invoices")
        .select("id,type,total_amount,invoice_date")
        .gte("invoice_date", fromStr)
        .lte("invoice_date", todayStr);

      if (invErr) throw invErr;

      // Build date map for 30 days
      const dayMap = {};
      for (let i = 0; i < 30; i++) {
        const d = new Date(from30);
        d.setDate(from30.getDate() + i);
        const key = fmt(d);
        dayMap[key] = { date: key, sales: 0, purchases: 0 };
      }

      let todaySales = 0;
      let todayPurchases = 0;

      invoices.forEach((inv) => {
        const key = inv.invoice_date
          ? inv.invoice_date.slice(0, 10)
          : inv.created_at?.slice(0, 10);
        const amt = Number(inv.total_amount || 0);
        if (!dayMap[key]) dayMap[key] = { date: key, sales: 0, purchases: 0 };
        if (inv.type === "sale") {
          dayMap[key].sales += amt;
          if (key === todayStr) todaySales += amt;
        } else {
          dayMap[key].purchases += amt;
          if (key === todayStr) todayPurchases += amt;
        }
      });

      const seriesArr = Object.values(dayMap).sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      // 2) Inventory totals & low stock
      const { data: invData, error: invDataErr } = await supabase
        .from("inventory")
        .select("qty,purchase_price,sale_price")
        .eq("is_active", true);

      if (invDataErr) throw invDataErr;

      let totalStock = 0;
      let stockValuePurchase = 0;
      let lowStockCount = 0;
      invData.forEach((it) => {
        totalStock += Number(it.qty || 0);
        stockValuePurchase +=
          Number(it.qty || 0) * Number(it.purchase_price || 0);
        if ((it.qty || 0) < 5) lowStockCount++;
      });

      // 3) Top selling items (last 30 days) using history table
      // fetch history rows of type 'sale' during period, and join inventory name
      const { data: topRaw, error: topErr } = await supabase
        .from("history")
        .select("inventory_id, qty_change, inventory (id, name)")
        .gte("created_at", fromStr)
        .lte("created_at", todayStr)
        .eq("type", "sale");

      if (topErr) throw topErr;

      const agg = {};
      (topRaw || []).forEach((h) => {
        const id = h.inventory_id;
        const n = Number(h.qty_change || 0);
        if (!agg[id])
          agg[id] = { id, name: h.inventory?.name || "Item", qty: 0 };
        agg[id].qty += Math.abs(n);
      });

      const topArr = Object.values(agg)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      // set states
      setKpis({
        todaySales,
        todayPurchases,
        totalStock,
        stockValuePurchase,
        lowStockCount,
      });

      setSeries(seriesArr);
      setTopItems(topArr);
      setLastFetched(new Date().toISOString());
      setLoading(false);

      return { series: seriesArr, topArr };
    } catch (err) {
      console.error("Dashboard fetch error", err);
      setLoading(false);
      throw err;
    }
  }

  useEffect(() => {
    if (profileLoading) return;

    if (!profile) {
      setKpis({
        todaySales: 0,
        todayPurchases: 0,
        totalStock: 0,
        stockValuePurchase: 0,
        lowStockCount: 0,
      });
      setSeries([]);
      setTopItems([]);
      setLoading(false);
      return;
    }

    fetchKpisAndSeries();
  }, [profileLoading, profile?.id]);

  const refresh = async () => {
    await fetchKpisAndSeries();
  };

  return (
    <DashboardContext.Provider
      value={{
        loading,
        kpis,
        series,
        topItems,
        lastFetched,
        refresh,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDashboard = () => useContext(DashboardContext);

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { idbGet, idbPut, idbDelete, STORE_NAMES } from "../idb";
import { useProfile } from "./ProfileContext";

const HistoryContext = createContext();

export function HistoryProvider({ children }) {
  const [historyCache, setHistoryCache] = useState({});

  const { profile, loading: profileLoading } = useProfile();

  // --------------------------------------------
  // Fetch invoices (ONLINE first, but uses IDB when offline)
  // --------------------------------------------
  const fetchInvoicesByMonth = async (year, month) => {
    const key = `${year}-${String(month).padStart(2, "0")}`;

    // --------------------------------------------
    // 1️⃣ If offline → load from IndexedDB only
    // --------------------------------------------
    if (!navigator.onLine) {
      const cached = await idbGet(STORE_NAMES.HISTORY_CACHE, key);

      setHistoryCache((prev) => ({
        ...prev,
        [key]: {
          invoices: cached?.invoices || [],
          loading: false,
          fetched: true,
        },
      }));

      return cached?.invoices || [];
    }

    // --------------------------------------------
    // 2️⃣ If already fetching → do nothing
    // --------------------------------------------
    if (historyCache[key]?.loading) {
      return historyCache[key].invoices;
    }

    // --------------------------------------------
    // 3️⃣ Mark as loading (do NOT mark fetched yet)
    // --------------------------------------------
    setHistoryCache((prev) => ({
      ...prev,
      [key]: {
        invoices: prev[key]?.invoices || [],
        loading: true,
        fetched: false,
      },
    }));

    // --------------------------------------------
    // 4️⃣ Build date range
    // --------------------------------------------
    const monthStart = `${key}-01`;
    const nextMonth =
      month === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, "0")}-01`;

    // --------------------------------------------
    // 5️⃣ Fetch from Supabase
    // --------------------------------------------
    const { data, error } = await supabase
      .from("invoices")
      .select("*, history(*)")
      .gte("created_at", monthStart)
      .lt("created_at", nextMonth);

    if (error) {
      setHistoryCache((prev) => ({
        ...prev,
        [key]: {
          invoices: prev[key]?.invoices || [],
          loading: false,
          fetched: false,
        },
      }));
      throw error;
    }

    // --------------------------------------------
    // 6️⃣ Save to RAM cache
    // --------------------------------------------
    setHistoryCache((prev) => ({
      ...prev,
      [key]: {
        invoices: data,
        loading: false,
        fetched: true,
      },
    }));

    // --------------------------------------------
    // 7️⃣ Save to IndexedDB
    // --------------------------------------------
    await idbPut(STORE_NAMES.HISTORY_CACHE, {
      month: key,
      invoices: data,
    });

    // --------------------------------------------
    // 8️⃣ Keep ONLY this month in IndexedDB
    // --------------------------------------------
    for (const k of Object.keys(historyCache)) {
      if (k !== key) {
        await idbDelete(STORE_NAMES.HISTORY_CACHE, k);
      }
    }

    return data;
  };

  // --------------------------------------------
  // Update invoice in RAM + IDB
  // --------------------------------------------
  const updateInvoiceInCache = async (invoice) => {
    const key = invoice.created_at.slice(0, 7);
    const monthData = historyCache[key];

    // If month not loaded yet, do nothing (auto-refresh will handle it)
    if (!monthData) return;

    const exists = monthData.invoices.some((i) => i.id === invoice.id);

    const updatedInvoices = exists
      ? monthData.invoices.map((i) => (i.id === invoice.id ? invoice : i))
      : [invoice, ...monthData.invoices]; // ⬅️ ADD new invoice

    // RAM update
    const updatedCache = {
      ...historyCache,
      [key]: { ...monthData, invoices: updatedInvoices },
    };
    setHistoryCache(updatedCache);

    // IDB update
    await idbPut(STORE_NAMES.HISTORY_CACHE, {
      month: key,
      invoices: updatedInvoices,
    });
  };

  // --------------------------------------------
  // Delete invoice (RAM + IDB)
  // --------------------------------------------
  const deleteInvoice = async (invoiceId) => {
    // 1️⃣ Get the invoice & its history first
    const { data: invoiceData, error: fetchError } = await supabase
      .from("invoices")
      .select("*, history(*)")
      .eq("id", invoiceId)
      .single();

    if (fetchError) throw fetchError;
    if (!invoiceData) return;

    // 2️⃣ Adjust inventory for each history item
    for (const item of invoiceData.history) {
      const { data: invRes, error: invFetchErr } = await supabase
        .from("inventory")
        .select("qty")
        .eq("id", item.inventory_id)
        .single();

      if (invFetchErr) throw invFetchErr;

      let updatedQty = Number(invRes.qty);
      if (item.type === "sale") {
        updatedQty += Number(item.qty_change); // sale deleted → add back
      } else if (item.type === "purchase") {
        updatedQty -= Number(item.qty_change); // purchase deleted → subtract
        if (updatedQty < 0)
          throw new Error(
            `Cannot delete invoice: inventory ${item.inventory_id} would go negative`
          );
      }

      const { error: invUpdateErr } = await supabase
        .from("inventory")
        .update({ qty: updatedQty })
        .eq("id", item.inventory_id);

      if (invUpdateErr) throw invUpdateErr;
    }

    // 3️⃣ Delete the invoice
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoiceId);
    if (error) throw error;

    // 4️⃣ Update RAM + IDB cache
    const newCache = {};
    for (const key in historyCache) {
      const filtered = historyCache[key].invoices.filter(
        (inv) => inv.id !== invoiceId
      );

      newCache[key] = { fetched: true, invoices: filtered };

      await idbPut(STORE_NAMES.HISTORY_CACHE, {
        month: key,
        invoices: filtered,
      });
    }

    setHistoryCache(newCache);
  };

  // --------------------------------------------
  // Your existing editInvoice (unchanged)
  // --------------------------------------------
  async function editInvoice(id, updatedData) {
    // ✅ normalize once
    const safeHistory = Array.isArray(updatedData.history)
      ? updatedData.history
      : [];

    const { data: invoiceUpdate, error: invoiceError } = await supabase
      .from("invoices")
      .update({
        invoice_number: updatedData.invoice_number,
        created_at: updatedData.created_at,
        total_amount: updatedData.total_amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (invoiceError) return { error: invoiceError };

    const oldHistoryRes = await supabase
      .from("history")
      .select("id, inventory_id, qty_change, type")
      .eq("invoice_id", id);

    if (oldHistoryRes.error) return { error: oldHistoryRes.error };

    const oldHistoryMap = Object.fromEntries(
      oldHistoryRes.data.map((h) => [h.id, h])
    );

    // ✅ use safeHistory everywhere
    for (const newItem of safeHistory) {
      const oldItem = oldHistoryMap[newItem.id];

      const oldQty = oldItem ? Number(oldItem.qty_change) : 0;
      const newQty = Number(newItem.qty_change);

      const oldType = oldItem ? oldItem.type : newItem.type;
      const newType = newItem.type;

      const oldEffect = oldQty * (oldType === "purchase" ? +1 : -1);
      const newEffect = newQty * (newType === "purchase" ? +1 : -1);

      const inventoryChange = newEffect - oldEffect;

      if (inventoryChange !== 0) {
        const invRes = await supabase
          .from("inventory")
          .select("qty")
          .eq("id", newItem.inventory_id)
          .single();

        if (invRes.error) return { error: invRes.error };

        const updatedInvQty = Number(invRes.data.qty) + inventoryChange;

        if (updatedInvQty < 0) {
          return {
            error: new Error(
              `Not enough stock for inventory item ${newItem.inventory_id}`
            ),
          };
        }

        const { error: invErr } = await supabase
          .from("inventory")
          .update({ qty: updatedInvQty })
          .eq("id", newItem.inventory_id);

        if (invErr) return { error: invErr };
      }
    }

    for (const item of safeHistory) {
      const { error: histErr } = await supabase
        .from("history")
        .update({
          qty_change: item.qty_change,
          metadata: item.metadata,
          purchase_price: item.purchase_price,
          sale_price: item.sale_price,
        })
        .eq("id", item.id);

      if (histErr) return { error: histErr };
    }

    const existingInvoice =
      historyCache[invoiceUpdate.created_at.slice(0, 7)]?.invoices.find(
        (i) => i.id === id
      ) || {};

    const finalInvoice = {
      ...existingInvoice, // ⬅️ KEEP existing fields (customer, type, etc.)
      ...invoiceUpdate, // ⬅️ overwrite edited invoice fields
      history: safeHistory, // ⬅️ reattach history explicitly
    };

    updateInvoiceInCache(finalInvoice);

    return { data: finalInvoice };
  }

  // --------------------------------------------
  // Auto-refresh last month's invoices on mount + when coming online
  // --------------------------------------------
  useEffect(() => {
    if (profileLoading) return;

    if (!profile) {
      setHistoryCache({});
      return;
    }

    const fetchLastMonth = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const lastMonth = month === 0 ? 12 : month;
      const lastMonthYear = month === 0 ? year - 1 : year;

      fetchInvoicesByMonth(lastMonthYear, lastMonth).catch(console.error);
    };

    if (navigator.onLine) {
      fetchLastMonth();
    }

    window.addEventListener("online", fetchLastMonth);
    return () => window.removeEventListener("online", fetchLastMonth);
  }, [profileLoading, profile?.id]);

  return (
    <HistoryContext.Provider
      value={{
        historyCache,
        fetchInvoicesByMonth,
        updateInvoiceInCache,
        editInvoice,
        deleteInvoice,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useHistoryData = () => useContext(HistoryContext);

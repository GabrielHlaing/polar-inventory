import { createContext, useContext, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { idbGetAll, idbDelete, STORE_NAMES } from "../idb";

const SyncContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useSync = () => useContext(SyncContext);

export function SyncProvider({ children }) {
  // -------------------------
  // AUTO-CLEAN SYNC QUEUE
  // -------------------------
  async function trimSyncQueue() {
    const queue = await idbGetAll(STORE_NAMES.SYNC_QUEUE);
    if (queue.length <= 200) return;

    const sorted = [...queue].sort(
      (a, b) => (a.created_at ?? 0) - (b.created_at ?? 0)
    );

    const removeCount = queue.length - 200;
    for (let i = 0; i < removeCount; i++) {
      await idbDelete(STORE_NAMES.SYNC_QUEUE, sorted[i].queueId);
    }

    // Remove jobs older than 7 days
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    for (const job of queue) {
      if (Date.now() - (job.created_at ?? 0) > oneWeek) {
        await idbDelete(STORE_NAMES.SYNC_QUEUE, job.queueId);
      }
    }
  }

  // -------------------------
  // SYNC PROCESSOR
  // -------------------------
  let syncing = false;

  async function processSyncQueue() {
    if (syncing || !navigator.onLine) return;

    syncing = true;

    try {
      await trimSyncQueue();

      const queue = await idbGetAll(STORE_NAMES.SYNC_QUEUE);

      for (const job of queue) {
        try {
          // ---------- INVENTORY ----------
          if (job.type === "add") {
            await supabase.from("inventory").insert(job.payload);
          }

          if (job.type === "update") {
            await supabase
              .from("inventory")
              .update(job.payload)
              .eq("id", job.itemId);
          }

          if (job.type === "delete") {
            await supabase.from("inventory").delete().eq("id", job.itemId);
          }

          // ---------- CHECKOUT ----------
          if (job.type === "checkout") {
            const { invoice: localInvoice, history: localHistory } =
              job.payload;

            const invoiceRes = await supabase
              .from("invoices")
              .insert(localInvoice)
              .select()
              .single();

            if (invoiceRes.error) throw invoiceRes.error;

            const realInvoiceId = invoiceRes.data.id;

            const historyRows = localHistory.map((h) => ({
              ...h,
              invoice_id: realInvoiceId,
            }));

            if (historyRows.length) {
              const h = await supabase.from("history").insert(historyRows);
              if (h.error) throw h.error;
            }

            // Cleanup local invoice cache
            await idbDelete(STORE_NAMES.INVOICES, localInvoice.id);
          }

          // ✅ Remove job only after full success
          await idbDelete(STORE_NAMES.SYNC_QUEUE, job.queueId);
        } catch (jobError) {
          console.log("Sync error → retry later", jobError);
          break; // stop queue processing
        }
      }
    } finally {
      syncing = false; // 🔒 release lock exactly once
    }
  }

  // -------------------------
  // AUTO RUN
  // -------------------------
  useEffect(() => {
    processSyncQueue();

    const onOnline = () => processSyncQueue();
    window.addEventListener("online", onOnline);

    return () => window.removeEventListener("online", onOnline);
  }, []);

  return (
    <SyncContext.Provider value={{ processSyncQueue }}>
      {children}
    </SyncContext.Provider>
  );
}

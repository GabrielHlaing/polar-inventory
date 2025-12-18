import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useProfile } from "./ProfileContext";
import { idbPut, idbGetAll, idbClear, STORE_NAMES } from "../idb";

const ItemsContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useItems = () => useContext(ItemsContext);

export function ItemsProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const { profile, loading: profileLoading, isPremium } = useProfile();

  const FREE_LIMIT = 20;
  const PREMIUM_LIMIT = 1500;

  /* ----------  alphabetical helper  ---------- */
  const sortAlpha = (arr) =>
    [...arr]
      .filter((i) => typeof i.name === "string")
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );

  // -------------------------
  // LOAD ITEMS
  // -------------------------
  async function loadItems() {
    setLoading(true);

    const local = await idbGetAll(STORE_NAMES.INVENTORY);

    const clean = local.filter(
      (i) => typeof i.name === "string" && i.id && i.is_active !== false
    );

    // permanently fix corrupted cache
    if (clean.length !== local.length) {
      await idbClear(STORE_NAMES.INVENTORY);
      for (const item of clean) {
        await idbPut(STORE_NAMES.INVENTORY, item);
      }
    }
    setItems(sortAlpha(clean));

    if (navigator.onLine) {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (!error && data) {
        setItems(data);
        await idbClear(STORE_NAMES.INVENTORY);
        for (const item of data) {
          await idbPut(STORE_NAMES.INVENTORY, item);
        }
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    if (profileLoading) return;

    if (!profile) {
      setItems([]);
      setLoading(false);
      return;
    }

    loadItems();
  }, [profileLoading, profile?.id]);

  // -------------------------
  // ADD ITEM
  // -------------------------
  async function addItem(payload) {
    const limit = isPremium ? PREMIUM_LIMIT : FREE_LIMIT;
    if (items.length >= limit) {
      return { error: { message: `Item limit reached (${limit}).` } };
    }

    const newItem = {
      id: crypto.randomUUID(),
      ...payload,
      created_at: new Date().toISOString(),
    };

    // 1. Save to IndexedDB (offline-first)
    await idbPut(STORE_NAMES.INVENTORY, newItem);
    setItems((p) => sortAlpha([...p, newItem]));

    // 2. If offline → queue and return immediately
    if (!navigator.onLine) {
      await idbPut(STORE_NAMES.SYNC_QUEUE, {
        queueId: crypto.randomUUID(),
        type: "add",
        created_at: Date.now(),
        payload: newItem,
      });
      return { data: newItem };
    }

    // 3. Online → try Supabase, queue on error
    const { error } = await supabase.from("inventory").insert(newItem);
    if (error) {
      await idbPut(STORE_NAMES.SYNC_QUEUE, {
        queueId: crypto.randomUUID(),
        type: "add",
        created_at: Date.now(),
        payload: newItem,
      });
    } else {
      await loadItems(); // refresh from cloud
    }

    return { data: newItem };
  }

  // -------------------------
  // UPDATE ITEM
  // -------------------------
  async function updateItem(id, changes) {
    const existing = items.find((i) => i.id === id);
    if (!existing) return;

    const updated = {
      ...existing,
      ...changes,
    };

    await idbPut(STORE_NAMES.INVENTORY, updated);
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));

    if (!navigator.onLine) {
      await idbPut(STORE_NAMES.SYNC_QUEUE, {
        queueId: crypto.randomUUID(),
        type: "update",
        itemId: id,
        payload: changes,
      });
      return updated;
    }

    const { error } = await supabase
      .from("inventory")
      .update(changes)
      .eq("id", id);

    if (error) {
      await idbPut(STORE_NAMES.SYNC_QUEUE, {
        queueId: crypto.randomUUID(),
        type: "update",
        itemId: id,
        payload: changes,
      });
    }

    return updated;
  }

  // -------------------------
  // DELETE ITEM (soft-delete)
  // -------------------------
  async function deleteItem(id) {
    const existing = items.find((i) => i.id === id);
    if (!existing) return {};

    // 1. Soft-delete locally
    const softDeleted = {
      ...existing,
      is_active: false,
      created_at: new Date().toISOString(), // new timestamp for sync
    };

    // 2. Save to IndexedDB and remove from local state
    await idbPut(STORE_NAMES.INVENTORY, softDeleted);
    setItems((p) => p.filter((i) => i.id !== id));

    // 3. Offline → queue the full soft-deleted object
    if (!navigator.onLine) {
      await idbPut(STORE_NAMES.SYNC_QUEUE, {
        queueId: crypto.randomUUID(),
        type: "soft_delete",
        created_at: softDeleted.created_at,
        itemId: id,
        payload: softDeleted, // ← same object we saved locally
      });
      return {};
    }

    // 4. Online → send identical payload to server
    const { error } = await supabase
      .from("inventory")
      .update(softDeleted) // ← full object (includes new created_at)
      .eq("id", id);

    if (error) {
      // failed → queue for retry
      await idbPut(STORE_NAMES.SYNC_QUEUE, {
        queueId: crypto.randomUUID(),
        type: "soft_delete",
        created_at: softDeleted.created_at,
        itemId: id,
        payload: softDeleted,
      });
    }

    // 5. Do NOT re-fetch – trust local state
    return {};
  }

  return (
    <ItemsContext.Provider
      value={{
        items,
        loading,
        addItem,
        updateItem,
        deleteItem,
        loadItems,
        FREE_LIMIT,
        PREMIUM_LIMIT,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
}

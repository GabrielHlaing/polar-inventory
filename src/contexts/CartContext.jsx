// src/contexts/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { idbGet, idbPut, idbDelete, STORE_NAMES } from "../idb";

const CartContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Load once
  useEffect(() => {
    async function load() {
      const saved = await idbGet(STORE_NAMES.CART, "cart");
      if (saved?.items) setCart(saved.items);
    }
    load();
  }, []);

  // Save only when changed
  useEffect(() => {
    idbPut(STORE_NAMES.CART, { id: "cart", items: cart });
  }, [cart]);

  function addToCart(item) {
    setCart((p) => {
      const existing = p.find((i) => i.id === item.id);
      if (existing)
        return p.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      return [...p, { ...item, qty: 1 }];
    });
  }

  function updateQty(id, qty) {
    setCart((p) => p.map((i) => (i.id === id ? { ...i, qty } : i)));
  }

  function removeFromCart(id) {
    setCart((p) => p.filter((i) => i.id !== id));
  }

  async function clearCart() {
    setCart([]);

    // Remove the IndexedDB CART entry
    await idbDelete(STORE_NAMES.CART, "cart");
  }

  const totalCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        totalCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

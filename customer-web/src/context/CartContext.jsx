import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

function slotKey(date, startTime) {
  return `${date}_${startTime}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // { date, startTime, endTime, estimatedPricePerHour }

  function toggleSlot(slot) {
    setItems((prev) => {
      const key = slotKey(slot.date, slot.startTime);
      const exists = prev.some((s) => slotKey(s.date, s.startTime) === key);
      if (exists) return prev.filter((s) => slotKey(s.date, s.startTime) !== key);
      return [...prev, slot].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    });
  }

  function removeSlot(date, startTime) {
    setItems((prev) => prev.filter((s) => slotKey(s.date, s.startTime) !== slotKey(date, startTime)));
  }

  function clear() {
    setItems([]);
  }

  function has(date, startTime) {
    return items.some((s) => slotKey(s.date, s.startTime) === slotKey(date, startTime));
  }

  const estimatedTotal = useMemo(
    () => items.reduce((sum, s) => sum + Number(s.estimatedPricePerHour), 0),
    [items],
  );

  const value = { items, toggleSlot, removeSlot, clear, has, estimatedTotal };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

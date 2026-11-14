"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { CartItem } from "@/lib/types";

type CartContextType = {
  storeId: string | null;
  items: CartItem[];
  add: (item: CartItem, storeId: string) => void;
  remove: (index: number) => void;
  setQty: (index: number, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextType | null>(null);

const KEY = "tendazo_cart_v1";

type Stored = { storeId: string | null; items: CartItem[] };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Cargar desde localStorage al montar.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed: Stored = JSON.parse(raw);
        setStoreId(parsed.storeId ?? null);
        setItems(parsed.items ?? []);
      }
    } catch {
      // ignorar datos corruptos
    }
    setLoaded(true);
  }, []);

  // Persistir en cada cambio.
  useEffect(() => {
    if (!loaded) return;
    const data: Stored = { storeId, items };
    localStorage.setItem(KEY, JSON.stringify(data));
  }, [storeId, items, loaded]);

  const add = useCallback((item: CartItem, itemStoreId: string) => {
    // El carrito es de una sola tienda a la vez.
    setStoreId((current) => {
      if (current && current !== itemStoreId) {
        setItems([item]);
        return itemStoreId;
      }
      setItems((prev) => [...prev, item]);
      return itemStoreId;
    });
  }, []);

  const remove = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const setQty = useCallback((index: number, qty: number) => {
    setItems((prev) =>
      prev.map((it, i) =>
        i === index ? { ...it, qty: Math.max(1, qty) } : it,
      ),
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setStoreId(null);
  }, []);

  const total = items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0);
  const count = items.reduce((sum, it) => sum + it.qty, 0);

  return (
    <CartContext.Provider
      value={{ storeId, items, add, remove, setQty, clear, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}

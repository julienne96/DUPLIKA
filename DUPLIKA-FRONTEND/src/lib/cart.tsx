import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CartLine } from "./types";

/**
 * Panier client : persistance locale pour l'utilisateur non connecté.
 * Il ne stocke QUE des identifiants et des quantités — jamais de prix.
 * Les montants affichés proviennent du devis recalculé par le backend.
 */

const STORAGE_KEY = "duplika.cart.v1";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  isOpen: boolean;
  hydrated: boolean;
  open: () => void;
  close: () => void;
  addLine: (line: CartLine) => void;
  setQuantity: (variantId: string, productSlug: string, quantity: number) => void;
  removeLine: (variantId: string, productSlug: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* panier illisible : on repart d'un panier vide */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addLine = useCallback((line: CartLine) => {
    setLines((prev) => {
      const existing = prev.find(
        (l) => l.variantId === line.variantId && l.productSlug === line.productSlug,
      );
      if (existing) {
        return prev.map((l) =>
          l === existing ? { ...l, quantity: l.quantity + line.quantity } : l,
        );
      }
      return [...prev, line];
    });
    setIsOpen(true);
  }, []);

  const setQuantity = useCallback((variantId: string, productSlug: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => !(l.variantId === variantId && l.productSlug === productSlug))
        : prev.map((l) =>
            l.variantId === variantId && l.productSlug === productSlug ? { ...l, quantity } : l,
          ),
    );
  }, []);

  const removeLine = useCallback((variantId: string, productSlug: string) => {
    setLines((prev) => prev.filter((l) => !(l.variantId === variantId && l.productSlug === productSlug)));
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      isOpen,
      hydrated,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      addLine,
      setQuantity,
      removeLine,
      clear: () => setLines([]),
    }),
    [lines, isOpen, hydrated, addLine, setQuantity, removeLine],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans un CartProvider");
  return ctx;
}

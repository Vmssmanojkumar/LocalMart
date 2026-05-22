import { useSyncExternalStore, useState, useEffect } from "react";
import type { Product } from "@/lib/mock-data";

type CartItem = { product: Product; qty: number };
type State = {
  cart: CartItem[];
  wishlist: string[];
  dark: boolean;
};

const KEY = "localmart-state-v1";
const initial: State = { cart: [], wishlist: [], dark: false };

let state: State = (() => {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initial, ...JSON.parse(raw) };
  } catch {}
  return initial;
})();

const listeners = new Set<() => void>();
const emit = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(state));
    document.documentElement.classList.toggle("dark", state.dark);
  }
  listeners.forEach((l) => l());
};

const set = (next: Partial<State>) => { state = { ...state, ...next }; emit(); };

export const store = {
  getState: () => state,
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
  addToCart: (p: Product, qty = 1) => {
    const existing = state.cart.find((c) => c.product.id === p.id);
    const cart = existing
      ? state.cart.map((c) => c.product.id === p.id ? { ...c, qty: c.qty + qty } : c)
      : [...state.cart, { product: p, qty }];
    set({ cart });
  },
  removeFromCart: (id: string) => set({ cart: state.cart.filter((c) => c.product.id !== id) }),
  setQty: (id: string, qty: number) => set({
    cart: state.cart.map((c) => c.product.id === id ? { ...c, qty: Math.max(1, qty) } : c)
  }),
  toggleWishlist: (id: string) => set({
    wishlist: state.wishlist.includes(id)
      ? state.wishlist.filter((x) => x !== id)
      : [...state.wishlist, id]
  }),
  toggleDark: () => set({ dark: !state.dark }),
  setDark: (dark: boolean) => set({ dark }),
  clearCart: () => set({ cart: [] }),
};

export function useStore<T>(selector: (s: State) => T): T {
  const storeState = useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(initial)
  );

  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated ? storeState : selector(initial);
}

// Apply dark on load
if (typeof window !== "undefined") {
  document.documentElement.classList.toggle("dark", state.dark);
}

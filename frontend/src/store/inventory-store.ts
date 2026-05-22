import { useSyncExternalStore } from "react";
import { products as seedProducts, type Product } from "@/lib/mock-data";

export type StockItem = Product & { stock: number; cost: number };
export type Sale = {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  revenue: number;
  cost: number;
  profit: number;
  date: string; // ISO
  shopId: string;
};

type InvState = {
  stock: Record<string, StockItem>; // by product id
  sales: Sale[];
};

const KEY = "localmart-inventory-v1";

function seedSales(): Sale[] {
  // generate ~120 days of sales for demo
  const sales: Sale[] = [];
  const now = Date.now();
  const day = 86400000;
  let n = 0;
  for (let d = 0; d < 120; d++) {
    const date = new Date(now - d * day);
    const dailyOrders = 2 + Math.floor(Math.random() * 6);
    for (let i = 0; i < dailyOrders; i++) {
      const p = seedProducts[Math.floor(Math.random() * seedProducts.length)];
      const qty = 1 + Math.floor(Math.random() * 4);
      const cost = Math.round(p.price * (0.55 + Math.random() * 0.2));
      const revenue = p.price * qty;
      const profit = revenue - cost * qty;
      sales.push({
        id: `s_${n++}`,
        productId: p.id,
        productName: p.name,
        qty,
        revenue,
        cost: cost * qty,
        profit,
        date: date.toISOString(),
        shopId: p.storeId,
      });
    }
  }
  return sales;
}

function seedStock(): Record<string, StockItem> {
  const out: Record<string, StockItem> = {};
  for (const p of seedProducts) {
    out[p.id] = { ...p, stock: 10 + Math.floor(Math.random() * 80), cost: Math.round(p.price * 0.65) };
  }
  return out;
}

const initial: InvState = { stock: seedStock(), sales: seedSales() };

let state: InvState = (() => {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { stock: parsed.stock || initial.stock, sales: parsed.sales || initial.sales };
    }
  } catch {}
  return initial;
})();

const listeners = new Set<() => void>();
const emit = () => {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
};
const set = (next: Partial<InvState>) => { state = { ...state, ...next }; emit(); };

export const inventory = {
  getState: () => state,
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
  updateStock: (id: string, stock: number) => {
    if (!state.stock[id]) return;
    set({ stock: { ...state.stock, [id]: { ...state.stock[id], stock: Math.max(0, stock) } } });
  },
  updatePrice: (id: string, price: number) => {
    if (!state.stock[id]) return;
    set({ stock: { ...state.stock, [id]: { ...state.stock[id], price: Math.max(0, price) } } });
  },
  addProduct: (item: Omit<StockItem, "id"> & { id?: string }) => {
    const id = item.id || `p_${Date.now()}`;
    set({ stock: { ...state.stock, [id]: { ...item, id } as StockItem } });
  },
  removeProduct: (id: string) => {
    const { [id]: _, ...rest } = state.stock;
    set({ stock: rest });
  },
};

export function useInventory<T>(selector: (s: InvState) => T): T {
  return useSyncExternalStore(inventory.subscribe, () => selector(state), () => selector(initial));
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Package, DollarSign, Plus, Trash2, Minus, LayoutDashboard, Boxes, LogOut, UserCircle } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { useAuth, auth } from "@/store/auth-store";
import { useInventory, inventory } from "@/store/inventory-store";
import { RetailerProfilePanel } from "@/components/profile/RetailerProfilePanel";
import { apiRetailerProfile, type ApiFullProfile } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/retailer")({
  head: () => ({ meta: [{ title: "Retailer Dashboard — LocalMart" }] }),
  component: RetailerPage,
});

type Range = "daily" | "weekly" | "monthly" | "yearly";

function RetailerPage() {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ApiFullProfile | null>(null);
  
  useEffect(() => {
    if (!user) navigate({ to: "/login", search: {} } as any);
    else if (user.role !== "retailer") navigate({ to: "/" });
    else {
      apiRetailerProfile.get()
        .then(setProfile)
        .catch(() => toast.error("Could not load profile"));
    }
  }, [user, navigate]);

  const [tab, setTab] = useState<"dashboard" | "stock" | "orders-in" | "orders-out" | "profile">("dashboard");

  if (!user || user.role !== "retailer") return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[2rem] gradient-hero p-6 shadow-soft sm:p-10">
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground text-2xl">🏪</div>
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{user.shopName || "Your shop"}</h1>
            <p className="text-sm text-foreground/70">Welcome back, {user.name} · Retailer console</p>
          </div>
          <button onClick={() => { auth.logout(); navigate({ to: "/" }); }} className="ml-auto flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </motion.div>

      <div className="mt-6 flex flex-wrap gap-2">
        <TabBtn active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
        <TabBtn active={tab === "stock"} onClick={() => setTab("stock")} icon={<Boxes className="h-4 w-4" />} label="Manage Stock" />
        <TabBtn active={tab === "orders-in"} onClick={() => setTab("orders-in")} icon={<Package className="h-4 w-4" />} label="Orders In" />
        <TabBtn active={tab === "orders-out"} onClick={() => setTab("orders-out")} icon={<Package className="h-4 w-4" />} label="Orders Out" />
        <TabBtn active={tab === "profile"} onClick={() => setTab("profile")} icon={<UserCircle className="h-4 w-4" />} label="My Profile" />
      </div>

      <div className="mt-6">
        {tab === "dashboard" && <Dashboard />}
        {tab === "stock" && <StockManager />}
        {tab === "orders-in" && <div className="glass rounded-3xl p-10 text-center text-foreground/60 shadow-soft">No pending incoming orders at the moment.</div>}
        {tab === "orders-out" && <div className="glass rounded-3xl p-10 text-center text-foreground/60 shadow-soft">No outbound orders at the moment.</div>}
        {tab === "profile" && profile && (
          <RetailerProfilePanel
            profile={profile}
            onProfileUpdate={setProfile}
          />
        )}
        {tab === "profile" && !profile && (
          <div className="glass rounded-3xl p-10 text-center text-foreground/60 shadow-soft animate-pulse">Loading profile…</div>
        )}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground" : "glass"}`}>
      {icon} {label}
    </button>
  );
}

function Dashboard() {
  const sales = useInventory((s) => s.sales);
  const stock = useInventory((s) => s.stock);
  const [range, setRange] = useState<Range>("daily");

  const buckets = useMemo(() => aggregate(sales, range), [sales, range]);
  const totals = useMemo(() => {
    const revenue = sales.reduce((a, s) => a + s.revenue, 0);
    const profit = sales.reduce((a, s) => a + s.profit, 0);
    const orders = sales.length;
    const units = sales.reduce((a, s) => a + s.qty, 0);
    return { revenue, profit, orders, units };
  }, [sales]);

  const profitable = buckets.filter((b) => b.profit >= 0).length;
  const lossDays = buckets.length - profitable;

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; qty: number }>();
    for (const s of sales) {
      const cur = map.get(s.productId) || { name: s.productName, revenue: 0, qty: 0 };
      cur.revenue += s.revenue; cur.qty += s.qty;
      map.set(s.productId, cur);
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [sales]);

  const colors = ["oklch(0.55 0.09 130)", "oklch(0.78 0.07 100)", "oklch(0.82 0.05 55)", "oklch(0.7 0.1 50)", "oklch(0.6 0.12 30)"];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total Revenue" value={`₹${totals.revenue.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} trend="+12.4%" up />
        <Kpi label="Net Profit" value={`₹${totals.profit.toLocaleString()}`} icon={<TrendingUp className="h-5 w-5" />} trend={totals.profit >= 0 ? "+8.1%" : "-3.2%"} up={totals.profit >= 0} />
        <Kpi label="Orders" value={totals.orders.toLocaleString()} icon={<Package className="h-5 w-5" />} trend="+5.7%" up />
        <Kpi label="In Stock SKUs" value={Object.keys(stock).length.toString()} icon={<Boxes className="h-5 w-5" />} trend={`${Object.values(stock).reduce((a, s) => a + s.stock, 0)} units`} up />
      </div>

      <div className="glass rounded-3xl p-6 shadow-soft">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold">Sales & Profit Trend</h2>
            <p className="text-xs text-foreground/60">{profitable} profitable periods · {lossDays} loss periods</p>
          </div>
          <div className="flex gap-1 rounded-full bg-foreground/5 p-1">
            {(["daily","weekly","monthly","yearly"] as Range[]).map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${range === r ? "bg-background shadow-soft" : "text-foreground/60"}`}>{r}</button>
            ))}
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={buckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0 0 / 0.15)" />
              <XAxis dataKey="label" stroke="currentColor" fontSize={11} />
              <YAxis stroke="currentColor" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="oklch(0.55 0.09 130)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="profit" stroke="oklch(0.7 0.15 50)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-3xl p-6 shadow-soft">
          <h2 className="mb-4 font-display text-xl font-bold">Profit vs Loss</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buckets.slice(-12)}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0 0 / 0.15)" />
                <XAxis dataKey="label" stroke="currentColor" fontSize={11} />
                <YAxis stroke="currentColor" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="profit" radius={[8,8,0,0]}>
                  {buckets.slice(-12).map((b, i) => (
                    <Cell key={i} fill={b.profit >= 0 ? "oklch(0.55 0.09 130)" : "oklch(0.6 0.2 25)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 shadow-soft">
          <h2 className="mb-4 font-display text-xl font-bold">Top Products by Revenue</h2>
          <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={topProducts} dataKey="revenue" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                    {topProducts.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2 text-sm">
              {topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 truncate"><span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[i] }} /><span className="truncate">{p.name}</span></span>
                  <span className="font-semibold">₹{p.revenue.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, icon, trend, up }: { label: string; value: string; icon: React.ReactNode; trend: string; up: boolean }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="glass rounded-3xl p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/15 text-primary">{icon}</div>
        <span className={`flex items-center gap-1 text-xs font-medium ${up ? "text-primary" : "text-destructive"}`}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {trend}
        </span>
      </div>
      <div className="mt-4 font-display text-2xl font-bold">{value}</div>
      <div className="text-xs text-foreground/60">{label}</div>
    </motion.div>
  );
}

function StockManager() {
  const stockRecord = useInventory((s) => s.stock);
  const stock = useMemo(() => Object.values(stockRecord), [stockRecord]);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ name: "", price: "", cost: "", stock: "", image: "", category: "groceries" });
  const [errorMsg, setErrorMsg] = useState("");

  const onAdd = () => {
    if (!draft.name.trim()) return setErrorMsg("Product name is required.");
    if (!draft.price || Number(draft.price) <= 0) return setErrorMsg("Valid price is required.");
    
    setErrorMsg("");
    inventory.addProduct({
      name: draft.name,
      price: Number(draft.price),
      cost: Number(draft.cost) || Math.round(Number(draft.price) * 0.65),
      stock: Number(draft.stock) || 0,
      image: draft.image || "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=800&q=80",
      category: draft.category || "groceries",
      rating: 4.5,
      storeId: "my-shop",
      storeName: "My Shop",
      distance: 0,
      deliveryHours: 2,
      description: draft.name,
    });
    setDraft({ name: "", price: "", cost: "", stock: "", image: "", category: "groceries" });
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Inventory ({stock.length})</h2>
        <button onClick={() => { setShowAdd((v) => !v); setErrorMsg(""); }} className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          {showAdd ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {showAdd ? "Cancel" : "Add product"}
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass rounded-3xl p-5 shadow-soft">
          {errorMsg && <div className="mb-3 text-sm font-medium text-destructive">{errorMsg}</div>}
          <div className="grid gap-3 sm:grid-cols-2">
            <Inp placeholder="Product name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
            <Inp placeholder="Image URL (optional)" value={draft.image} onChange={(v) => setDraft({ ...draft, image: v })} />
            <Inp placeholder="Selling price (₹)" type="number" value={draft.price} onChange={(v) => setDraft({ ...draft, price: v })} />
            <Inp placeholder="Cost price (₹)" type="number" value={draft.cost} onChange={(v) => setDraft({ ...draft, cost: v })} />
            <Inp placeholder="Initial stock" type="number" value={draft.stock} onChange={(v) => setDraft({ ...draft, stock: v })} />
            <Inp placeholder="Category" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} />
          </div>
          <button onClick={onAdd} className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Save product</button>
        </motion.div>
      )}

      <div className="glass overflow-hidden rounded-3xl shadow-soft">
        <div className="hidden border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wide text-foreground/60 sm:grid sm:grid-cols-[2fr_1fr_1fr_1.2fr_auto] sm:gap-4">
          <div>Product</div><div>Price</div><div>Cost</div><div>Stock</div><div></div>
        </div>
        {stock.map((p) => (
          <StockRow key={p.id} item={p} />
        ))}
        {stock.length === 0 && <div className="p-10 text-center text-sm text-foreground/60">No products yet — add your first one above.</div>}
      </div>
    </div>
  );
}

function StockRow({ item }: { item: ReturnType<typeof useInventory<any[]>>[number] }) {
  const [stockVal, setStockVal] = useState(item.stock);
  const [priceVal, setPriceVal] = useState(item.price);
  
  useEffect(() => {
    setStockVal(item.stock);
    setPriceVal(item.price);
  }, [item.stock, item.price]);

  return (
    <div className="grid items-center gap-3 border-b border-border px-5 py-4 sm:grid-cols-[2fr_1fr_1fr_1.2fr_auto] sm:gap-4">
      <div className="flex items-center gap-3">
        <img src={item.image || "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=800&q=80"} alt={item.name} className="h-12 w-12 rounded-xl object-cover" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=800&q=80" }} />
        <div className="min-w-0">
          <div className="truncate font-medium">{item.name}</div>
          <div className="text-xs text-foreground/60">{item.category}</div>
        </div>
      </div>
      <div className="font-semibold flex items-center gap-1">
        ₹ <input type="number" value={priceVal} onChange={(e) => setPriceVal(Number(e.target.value))} onBlur={() => inventory.updatePrice(item.id, priceVal)} className="w-16 rounded-lg bg-background px-2 py-1 text-sm outline-none ring-1 ring-border" />
      </div>
      <div className="text-foreground/70">₹{item.cost}</div>
      <div className="flex items-center gap-1">
        <button onClick={() => inventory.updateStock(item.id, item.stock - 1)} className="grid h-8 w-8 place-items-center rounded-full bg-foreground/5 hover:bg-foreground/10"><Minus className="h-3 w-3" /></button>
        <input
          type="number"
          value={stockVal}
          onChange={(e) => setStockVal(Number(e.target.value))}
          onBlur={() => inventory.updateStock(item.id, stockVal)}
          className="w-16 rounded-lg bg-background px-2 py-1 text-center text-sm outline-none ring-1 ring-border"
        />
        <button onClick={() => inventory.updateStock(item.id, item.stock + 1)} className="grid h-8 w-8 place-items-center rounded-full bg-foreground/5 hover:bg-foreground/10"><Plus className="h-3 w-3" /></button>
        {item.stock < 10 && <span className="ml-2 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive">Low</span>}
      </div>
      <button onClick={() => inventory.removeProduct(item.id)} className="grid h-9 w-9 place-items-center rounded-full text-destructive hover:bg-destructive/10">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function Inp({ placeholder, value, onChange, type = "text" }: { placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="rounded-2xl bg-background/60 px-4 py-2.5 text-sm outline-none ring-1 ring-border focus:ring-primary" />
  );
}

// Aggregate sales into time buckets
function aggregate(sales: { date: string; revenue: number; profit: number; cost: number }[], range: Range) {
  const now = new Date();
  type B = { label: string; revenue: number; profit: number; cost: number; key: string };
  const map = new Map<string, B>();

  const keyOf = (d: Date): { key: string; label: string } => {
    if (range === "daily") {
      const k = d.toISOString().slice(0, 10);
      return { key: k, label: `${d.getMonth() + 1}/${d.getDate()}` };
    }
    if (range === "weekly") {
      const tmp = new Date(d); tmp.setDate(tmp.getDate() - tmp.getDay());
      const k = tmp.toISOString().slice(0, 10);
      return { key: k, label: `W${Math.ceil((tmp.getDate()) / 7)} ${tmp.toLocaleString("en", { month: "short" })}` };
    }
    if (range === "monthly") {
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      return { key: k, label: d.toLocaleString("en", { month: "short", year: "2-digit" }) };
    }
    const k = `${d.getFullYear()}`;
    return { key: k, label: k };
  };

  // limit window
  const windowDays = range === "daily" ? 30 : range === "weekly" ? 84 : range === "monthly" ? 365 : 365 * 4;
  const cutoff = now.getTime() - windowDays * 86400000;

  for (const s of sales) {
    const d = new Date(s.date);
    if (d.getTime() < cutoff) continue;
    const { key, label } = keyOf(d);
    const cur = map.get(key) || { key, label, revenue: 0, profit: 0, cost: 0 };
    cur.revenue += s.revenue; cur.profit += s.profit; cur.cost += s.cost;
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

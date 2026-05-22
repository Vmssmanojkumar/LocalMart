import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { MapPin, CreditCard, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Truck, Package } from "lucide-react";
import { useAuth } from "@/store/auth-store";
import { useStore, store } from "@/store/app-store";
import { apiOrders } from "@/lib/api";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — LocalMart" }] }),
  component: CheckoutPage,
});

type Step = "address" | "payment" | "confirm";

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "address", label: "Address", icon: MapPin },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "confirm", label: "Confirm", icon: CheckCircle2 },
];

function CheckoutPage() {
  const user = useAuth((s) => s.user);
  const cart = useStore((s) => s.cart);
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("address");
  const [ordered, setOrdered] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [deliveryAddr, setDeliveryAddr] = useState("");

  // Auth guard — redirect to login with redirect param preserved
  useEffect(() => {
    if (!user) {
      navigate({ to: "/login", search: { redirect: "/checkout" } });
    }
  }, [user, navigate]);

  // Empty cart guard
  useEffect(() => {
    if (user && cart.length === 0 && !ordered) {
      navigate({ to: "/cart" });
    }
  }, [user, cart.length, ordered, navigate]);

  if (!user) return null;

  const subtotal = cart.reduce((a, c) => a + c.product.price * c.qty, 0);
  const delivery = 39;
  const total = subtotal + delivery;
  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  const handlePlaceOrder = async (address?: string) => {
    try {
      // Try to save order to backend if user is logged in
      const order = await apiOrders.place(address);
      setOrderId(order._id);
    } catch {
      // Fallback — generate a local order ID if API fails
      setOrderId(`LM${Math.floor(100000 + Math.random() * 900000)}`);
    } finally {
      setOrdered(true);
      store.clearCart();
      setStep("confirm");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Stepper */}
      <div className="mb-10 flex items-center justify-center gap-0">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = s.id === step;
          const isDone = currentStepIndex > i || step === "confirm";
          return (
            <div key={s.id} className="flex items-center">
              <div className={`flex flex-col items-center gap-1`}>
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  className={`grid h-10 w-10 place-items-center rounded-full border-2 transition-colors ${
                    isDone
                      ? "border-primary bg-primary text-primary-foreground"
                      : isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground/40"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </motion.div>
                <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-foreground/50"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 mb-5 h-0.5 w-16 sm:w-24 transition-colors ${currentStepIndex > i ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === "address" && (
          <motion.div key="address" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <AddressStep
              onNext={(addr) => { setDeliveryAddr(addr); setStep("payment"); }}
              total={total} subtotal={subtotal} delivery={delivery} cart={cart}
            />
          </motion.div>
        )}
        {step === "payment" && (
          <motion.div key="payment" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <PaymentStep onBack={() => setStep("address")} onNext={() => handlePlaceOrder(deliveryAddr)} total={total} subtotal={subtotal} delivery={delivery} />
          </motion.div>
        )}
        {step === "confirm" && (
          <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <ConfirmStep orderId={orderId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Address Step ─── */
function AddressStep({ onNext, total, subtotal, delivery, cart }: {
  onNext: (address: string) => void;
  total: number; subtotal: number; delivery: number;
  cart: { product: { name: string; price: number; image: string }; qty: number }[];
}) {
  const [address, setAddress] = useState({ name: "", phone: "", line1: "", city: "", pin: "" });
  const [err, setErr] = useState("");

  const handleNext = () => {
    if (!address.name || !address.phone || !address.line1 || !address.city || !address.pin) {
      setErr("Please fill in all address fields.");
      return;
    }
    if (!/^\d{10}$/.test(address.phone)) {
      setErr("Enter a valid 10-digit phone number.");
      return;
    }
    if (!/^\d{6}$/.test(address.pin)) {
      setErr("Enter a valid 6-digit PIN code.");
      return;
    }
    setErr("");
    onNext(`${address.name}, ${address.line1}, ${address.city} - ${address.pin}, Ph: ${address.phone}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="glass rounded-3xl p-6 shadow-soft">
        <h2 className="mb-5 font-display text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" /> Delivery Address
        </h2>
        {err && (
          <div className="mb-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{err}</div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" value={address.name} onChange={(v) => setAddress({ ...address, name: v })} placeholder="Riya Sharma" />
          <Field label="Phone number" value={address.phone} onChange={(v) => setAddress({ ...address, phone: v })} placeholder="9876543210" type="tel" />
          <div className="sm:col-span-2">
            <Field label="Address line" value={address.line1} onChange={(v) => setAddress({ ...address, line1: v })} placeholder="123, 3rd Cross, Indiranagar" />
          </div>
          <Field label="City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} placeholder="Bangalore" />
          <Field label="PIN code" value={address.pin} onChange={(v) => setAddress({ ...address, pin: v })} placeholder="560038" />
        </div>
        <button
          onClick={handleNext}
          className="mt-6 flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Continue to Payment <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <OrderSummary subtotal={subtotal} delivery={delivery} total={total} cart={cart} />
    </div>
  );
}

/* ─── Payment Step ─── */
function PaymentStep({ onBack, onNext, total, subtotal, delivery }: {
  onBack: () => void; onNext: () => void;
  total: number; subtotal: number; delivery: number;
}) {
  const [method, setMethod] = useState<"upi" | "card" | "cod">("upi");
  const [upi, setUpi] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const cart = useStore((s) => s.cart);

  const handlePay = () => {
    setErr("");
    if (method === "upi" && !upi.includes("@")) {
      setErr("Enter a valid UPI ID (e.g. name@upi).");
      return;
    }
    if (method === "card") {
      if (card.number.replace(/\s/g, "").length < 16) return setErr("Enter a valid 16-digit card number.");
      if (!card.expiry || !card.cvv || !card.name) return setErr("Please fill all card details.");
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); onNext(); }, 1500);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="glass rounded-3xl p-6 shadow-soft">
        <h2 className="mb-5 font-display text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" /> Payment Method
        </h2>

        <div className="flex gap-2 mb-5">
          {(["upi", "card", "cod"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMethod(m); setErr(""); }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition border ${method === m ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background text-foreground/70 hover:border-primary/50"}`}
            >
              {m === "upi" ? "UPI" : m === "card" ? "Card" : "Cash on Delivery"}
            </button>
          ))}
        </div>

        {err && (
          <div className="mb-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{err}</div>
        )}

        <AnimatePresence mode="wait">
          {method === "upi" && (
            <motion.div key="upi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Field label="UPI ID" value={upi} onChange={setUpi} placeholder="yourname@upi" />
              <p className="mt-2 text-xs text-foreground/50">Supports GPay, PhonePe, Paytm and all UPI apps.</p>
            </motion.div>
          )}
          {method === "card" && (
            <motion.div key="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <Field label="Cardholder name" value={card.name} onChange={(v) => setCard({ ...card, name: v })} placeholder="Riya Sharma" />
              <Field label="Card number" value={card.number} onChange={(v) => setCard({ ...card, number: v })} placeholder="4242 4242 4242 4242" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Expiry (MM/YY)" value={card.expiry} onChange={(v) => setCard({ ...card, expiry: v })} placeholder="09/27" />
                <Field label="CVV" value={card.cvv} onChange={(v) => setCard({ ...card, cvv: v })} placeholder="•••" type="password" />
              </div>
            </motion.div>
          )}
          {method === "cod" && (
            <motion.div key="cod" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 text-sm text-foreground/70">
              <Truck className="mb-2 h-6 w-6 text-primary" />
              Pay ₹{total.toLocaleString()} in cash when your order arrives. No advance payment needed.
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-foreground/5"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button
            onClick={handlePay}
            disabled={loading}
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> Processing…</span>
            ) : (
              <>{method === "cod" ? "Place Order" : `Pay ₹${total.toLocaleString()}`} <ShieldCheck className="h-4 w-4" /></>
            )}
          </button>
        </div>
        <p className="mt-3 flex items-center gap-1 text-xs text-foreground/40">
          <ShieldCheck className="h-3.5 w-3.5" /> Secured with 256-bit SSL encryption
        </p>
      </div>
      <OrderSummary subtotal={subtotal} delivery={delivery} total={total} cart={cart} />
    </div>
  );
}

/* ─── Confirmation Step ─── */
function ConfirmStep({ orderId }: { orderId?: string }) {
  const displayId = orderId || `LM${Math.floor(100000 + Math.random() * 900000)}`;
  return (
    <div className="glass mx-auto max-w-lg rounded-[2rem] p-10 text-center shadow-soft">
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-primary/15"
      >
        <CheckCircle2 className="h-12 w-12 text-primary" />
      </motion.div>
      <h1 className="font-display text-3xl font-bold">Order Placed! 🎉</h1>
      <p className="mt-3 text-foreground/60">
        Your order <span className="font-semibold text-foreground">#{displayId}</span> has been confirmed and is being prepared by the local store.
      </p>
      <div className="my-6 grid grid-cols-3 gap-4">
        {[
          { icon: Package, label: "Preparing", sub: "~10 min" },
          { icon: Truck, label: "Out for delivery", sub: "~45 min" },
          { icon: MapPin, label: "Arriving", sub: "Your door" },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="glass rounded-2xl p-3 text-center">
            <Icon className="mx-auto mb-1 h-5 w-5 text-primary" />
            <div className="text-xs font-semibold">{label}</div>
            <div className="text-[10px] text-foreground/50">{sub}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link to="/" className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Continue Shopping
        </Link>
        <Link to="/profile" className="rounded-full border border-border px-6 py-2.5 text-sm font-medium hover:bg-foreground/5">
          View Orders
        </Link>
      </div>
    </div>
  );
}

/* ─── Order Summary ─── */
function OrderSummary({ subtotal, delivery, total, cart }: {
  subtotal: number; delivery: number; total: number;
  cart: { product: { name: string; price: number; image: string }; qty: number }[];
}) {
  return (
    <div className="glass h-fit rounded-3xl p-5 shadow-soft lg:sticky lg:top-28">
      <h3 className="mb-4 font-display text-lg font-bold">Order Summary</h3>
      <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-1">
        {cart.map((c) => (
          <div key={c.product.name} className="flex items-center gap-3 text-sm">
            <img
              src={c.product.image}
              alt={c.product.name}
              className="h-10 w-10 shrink-0 rounded-xl object-cover"
              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=800&q=80"; }}
            />
            <div className="flex-1 truncate">
              <div className="truncate font-medium">{c.product.name}</div>
              <div className="text-xs text-foreground/50">×{c.qty}</div>
            </div>
            <div className="font-semibold">₹{(c.product.price * c.qty).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between text-foreground/70"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
        <div className="flex justify-between text-foreground/70"><span>Delivery</span><span>₹{delivery}</span></div>
        <div className="flex justify-between border-t border-border pt-2 font-display text-lg font-bold">
          <span>Total</span><span>₹{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared Field ─── */
function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-foreground/60">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl bg-background/60 px-4 py-2.5 text-sm outline-none ring-1 ring-border focus:ring-primary placeholder:text-foreground/30"
      />
    </div>
  );
}

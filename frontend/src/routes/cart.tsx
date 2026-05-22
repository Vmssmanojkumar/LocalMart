import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Zap, LogIn, Tag, ChevronRight, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { useStore, store } from "@/store/app-store";
import { useAuth } from "@/store/auth-store";
import { useState } from "react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — LocalMart" }] }),
  component: CartPage,
});

function CartPage() {
  const cart = useStore((s) => s.cart);
  const currentUser = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const subtotal = cart.reduce((a, c) => a + c.product.price * c.qty, 0);
  const delivery = cart.length ? 39 : 0;
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + delivery - discount;

  const handleCheckout = () => {
    if (!currentUser) {
      navigate({ to: "/login", search: { redirect: "/checkout" } });
      return;
    }
    navigate({ to: "/checkout" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
          Shopping Cart
        </h1>
        <p className="text-sm text-gray-500">
          {cart.length > 0 ? `${cart.length} item${cart.length !== 1 ? "s" : ""} in your cart` : "Your cart is empty"}
        </p>
      </motion.div>

      {cart.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 rounded-3xl border border-gray-100 bg-white p-16 text-center shadow-sm"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 float">
            <ShoppingBag className="h-10 w-10 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Nothing here yet</h2>
          <p className="mt-2 text-gray-500 text-sm">Browse local stores and add things you love.</p>
          <Link
            to="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition"
          >
            Start Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px] items-start">
          {/* Cart Items */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {cart.map((c) => (
                <motion.div
                  key={c.product.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -80, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Link to="/product/$id" params={{ id: c.product.id }} className="shrink-0">
                    <img
                      src={c.product.image}
                      alt={c.product.name}
                      className="h-24 w-24 rounded-xl object-cover bg-gray-50"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">{c.product.storeName}</div>
                        <Link to="/product/$id" params={{ id: c.product.id }}>
                          <h3 className="font-semibold text-gray-900 text-sm hover:text-blue-600 transition line-clamp-2">{c.product.name}</h3>
                        </Link>
                      </div>
                      <button
                        onClick={() => store.removeFromCart(c.product.id)}
                        className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 mt-1 text-xs text-blue-600 font-medium">
                      <Zap className="h-3 w-3" /> {c.product.deliveryHours}h delivery
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      {/* Qty stepper */}
                      <div className="flex items-center gap-0.5 rounded-xl border border-gray-200 overflow-hidden">
                        <button
                          onClick={() => store.setQty(c.product.id, c.qty - 1)}
                          className="h-8 w-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <motion.span
                          key={c.qty}
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-8 text-center text-sm font-bold text-gray-900"
                        >
                          {c.qty}
                        </motion.span>
                        <button
                          onClick={() => store.setQty(c.product.id, c.qty + 1)}
                          className="h-8 w-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-extrabold text-gray-900">
                          ₹{(c.product.price * c.qty).toLocaleString()}
                        </div>
                        {c.qty > 1 && (
                          <div className="text-xs text-gray-400">₹{c.product.price.toLocaleString()} each</div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue shopping */}
            <Link
              to="/search"
              className="flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-4 py-3 text-sm font-medium text-gray-400 hover:border-blue-300 hover:text-blue-500 transition"
            >
              <RefreshCw className="h-4 w-4" /> Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <motion.div layout className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

            {/* Coupon */}
            <div className="flex gap-2 mb-5">
              <div className="flex-1 flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-blue-400 transition">
                <Tag className="h-4 w-4 text-gray-300 shrink-0" />
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={() => { if (coupon === "LOCALFIRST") setCouponApplied(true); }}
                className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-700 transition"
              >
                Apply
              </button>
            </div>
            {couponApplied && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-green-600"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Coupon applied! 10% off
              </motion.div>
            )}

            <div className="space-y-3 text-sm">
              <SummaryRow label="Subtotal" value={`₹${subtotal.toLocaleString()}`} />
              <SummaryRow label="Delivery" value={delivery === 0 ? "Free" : `₹${delivery}`} />
              {discount > 0 && <SummaryRow label="Discount" value={`-₹${discount.toLocaleString()}`} highlight />}
              <div className="my-3 border-t border-dashed border-gray-200" />
              <SummaryRow label="Total" value={`₹${total.toLocaleString()}`} bold />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-bold text-white hover:bg-blue-700 transition"
            >
              {currentUser ? (
                <><ArrowRight className="h-4 w-4" /> Proceed to Checkout</>
              ) : (
                <><LogIn className="h-4 w-4" /> Sign in to Checkout</>
              )}
            </motion.button>

            {!currentUser && (
              <p className="mt-2 text-center text-xs text-gray-400">
                You'll be redirected back after signing in.
              </p>
            )}

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Truck className="h-3.5 w-3.5 text-blue-400" /> Delivery in 2–4 hours from local stores
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="h-3.5 w-3.5 text-green-400" /> 100% secure checkout
              </div>
            </div>

            {/* Accepted payments */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-2">
              {["Visa", "MC", "UPI", "GPay"].map((p) => (
                <span key={p} className="rounded-md border border-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-400">{p}</span>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-bold text-gray-900 text-base" : "text-gray-600"}`}>
      <span>{label}</span>
      <span className={highlight ? "text-green-600 font-semibold" : ""}>{value}</span>
    </div>
  );
}

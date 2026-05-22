import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Search, ShoppingBag, Heart, Menu, X, ChevronDown,
  User, LogOut, LayoutDashboard, Sun, Moon,
  MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin,
  Package, Headphones, ShieldCheck
} from "lucide-react";
import { useStore, store } from "@/store/app-store";
import { useAuth, auth } from "@/store/auth-store";
import { Logo } from "@/components/ui/logo";

/* ─── Header ─────────────────────────────────────────────────── */
export function Header() {
  const cart = useStore((s) => s.cart);
  const dark = useStore((s) => s.dark);
  const wishlist = useStore((s) => s.wishlist);
  const cartCount = cart.reduce((a, c) => a + c.qty, 0);
  const currentUser = useAuth((s) => s.user);
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate({ to: "/search", search: { q } });
    setSearchOpen(false);
    setQ("");
  };

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Products", to: "/search" },
    ...(currentUser?.role === "retailer" ? [{ label: "Dashboard", to: "/retailer" }] : []),
    ...(currentUser?.role === "admin" ? [{ label: "Admin", to: "/admin" }] : []),
  ];

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-gray-900 text-white text-center text-xs py-2 px-4 hidden sm:block">
        <span>🚀 Free delivery on orders above ₹499 · Use code </span>
        <span className="font-bold text-yellow-400">LOCALFIRST</span>
        <span> for 10% off your first order!</span>
      </div>

      {/* Main Navbar */}
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? "shadow-[0_2px_16px_rgba(0,0,0,0.08)]" : "border-b border-gray-100"}`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">L</div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block">LocalMart</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  path === item.to
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar — desktop */}
          <form
            onSubmit={onSearch}
            className="hidden md:flex flex-1 max-w-md mx-4 items-center gap-2 h-10 rounded-full border border-gray-200 bg-gray-50 px-4 focus-within:border-blue-400 focus-within:bg-white transition-colors"
          >
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, stores..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
            />
          </form>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1">
            {/* Mobile search toggle */}
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </button>

            {/* Dark toggle */}
            <button
              onClick={() => store.toggleDark()}
              className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={dark ? "dark" : "light"}
                  initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                >
                  {dark ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-600" />}
                </motion.span>
              </AnimatePresence>
            </button>

            {/* Wishlist */}
            {currentUser && (
              <Link to="/profile" className="relative h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                <Heart className="h-5 w-5 text-gray-600" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {wishlist.length}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 h-9 rounded-full bg-blue-600 px-3 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:block">Cart</span>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-gray-900"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* User menu */}
            {currentUser ? (
              <div className="relative ml-1">
                <button
                  onClick={() => setUserMenu((v) => !v)}
                  className="flex items-center gap-2 h-9 rounded-full border border-gray-200 pl-1 pr-3 hover:border-gray-300 hover:bg-gray-50 transition"
                >
                  <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[80px] truncate">{currentUser.name.split(" ")[0]}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>
                <AnimatePresence>
                  {userMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-11 z-50 w-52 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
                      >
                        <div className="px-3 py-2 mb-1">
                          <p className="text-xs font-semibold text-gray-900 truncate">{currentUser.name}</p>
                          <p className="text-[11px] text-gray-400 truncate">{currentUser.email}</p>
                        </div>
                        <div className="h-px bg-gray-100 mb-1" />
                        <MenuItem icon={<User className="h-4 w-4" />} label="My Profile" to="/profile" onClick={() => setUserMenu(false)} />
                        {currentUser.role === "retailer" && (
                          <MenuItem icon={<LayoutDashboard className="h-4 w-4" />} label="Retailer Dashboard" to="/retailer" onClick={() => setUserMenu(false)} />
                        )}
                        {currentUser.role === "admin" && (
                          <MenuItem icon={<LayoutDashboard className="h-4 w-4" />} label="Admin Panel" to="/admin" onClick={() => setUserMenu(false)} />
                        )}
                        <div className="h-px bg-gray-100 my-1" />
                        <button
                          onClick={() => { auth.logout(); setUserMenu(false); navigate({ to: "/" }); }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                        >
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                search={{ redirect: undefined }}
                className="ml-1 flex items-center gap-1.5 h-9 rounded-full border border-gray-200 px-3 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition"
              >
                <User className="h-4 w-4" /> <span className="hidden sm:block">Sign In</span>
              </Link>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition ml-1"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              className="bg-white px-4 py-4"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={onSearch} className="flex items-center gap-3">
                <Search className="h-5 w-5 text-gray-400 shrink-0" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 bg-transparent text-base outline-none text-gray-800"
                />
                <button type="button" onClick={() => setSearchOpen(false)}>
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <span className="font-bold text-gray-900">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${path === item.to ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                {currentUser ? (
                  <button
                    onClick={() => { auth.logout(); setMobileOpen(false); navigate({ to: "/" }); }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-sm font-medium text-red-500"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" search={{ redirect: undefined }} onClick={() => setMobileOpen(false)} className="flex-1 text-center rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700">Sign In</Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex-1 text-center rounded-xl bg-blue-600 py-3 text-sm font-medium text-white">Sign Up</Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MenuItem({ icon, label, to, onClick }: { icon: React.ReactNode; label: string; to: string; onClick?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
    >
      <span className="text-gray-400">{icon}</span>
      {label}
    </Link>
  );
}

/* ─── Footer ─────────────────────────────────────────────────── */
export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-24">
      {/* Features bar */}
      <div className="border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { icon: <Package className="h-6 w-6" />, title: "Free Shipping", sub: "On orders above ₹499" },
            { icon: <ShieldCheck className="h-6 w-6" />, title: "Secure Payments", sub: "100% safe & protected" },
            { icon: <Headphones className="h-6 w-6" />, title: "24/7 Support", sub: "Always here to help" },
            { icon: <MapPin className="h-6 w-6" />, title: "Hyperlocal", sub: "Stores near you" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-4">
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 shrink-0">
                {f.icon}
              </div>
              <div>
                <div className="font-semibold text-white text-sm">{f.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">L</div>
            <span className="font-bold text-xl text-white">LocalMart</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">Your neighborhood marketplace. Discover and order from local stores with delivery in hours.</p>
          <div className="flex gap-3 mt-5">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600 transition text-gray-400 hover:text-white">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            {[{ label: "Home", to: "/" }, { label: "Products", to: "/search" }, { label: "My Profile", to: "/profile" }, { label: "Shopping Cart", to: "/cart" }].map((l) => (
              <li key={l.to}><Link to={l.to} className="hover:text-white transition">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">For Partners</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            {["Sell on LocalMart", "Retailer Login", "Partner Guidelines", "Business Support"].map((l) => (
              <li key={l}><a href="#" className="hover:text-white transition">{l}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Contact</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-3"><MapPin className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" /><span>123 Market St, Koramangala, Bangalore 560034</span></li>
            <li className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-blue-400" />+91 98765 43210</li>
            <li className="flex items-center gap-3"><Mail className="h-4 w-4 shrink-0 text-blue-400" />hello@localmart.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} LocalMart Technologies. All rights reserved.</p>
          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((t) => (
              <a key={t} href="#" className="hover:text-white transition">{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

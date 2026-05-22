import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Search, ArrowRight, Zap, Star, MapPin, TrendingUp,
  ShieldCheck, Truck, Headphones, Package, ChevronRight
} from "lucide-react";
import { useState } from "react";
import { categories, stores, products as mockProducts } from "@/lib/mock-data";
import { ProductCard, ProductSkeleton } from "@/components/product-card";
import { useProducts } from "@/hooks/use-products";
import { OptimizedImage } from "@/components/optimized-image";

export const Route = createFileRoute("/")(({
  head: () => ({
    meta: [
      { title: "LocalMart — Premium Shopping, Local Delivery" },
      { name: "description", content: "Shop electronics, fashion, groceries and more from local stores. Fast delivery in hours." },
    ],
  }),
  component: Index,
} as any));

/* ─── Category config ─────────────────────────────────────────── */
const catConfig = [
  { id: "electronics", name: "Electronics",  emoji: "🎧", bg: "bg-blue-50",   accent: "text-blue-600",   ring: "ring-blue-100",  icon: "💻" },
  { id: "fashion",     name: "Fashion",      emoji: "👗", bg: "bg-pink-50",   accent: "text-pink-600",   ring: "ring-pink-100",  icon: "👠" },
  { id: "groceries",   name: "Groceries",    emoji: "🥦", bg: "bg-green-50",  accent: "text-green-600",  ring: "ring-green-100", icon: "🛒" },
  { id: "beauty",      name: "Beauty",       emoji: "💄", bg: "bg-purple-50", accent: "text-purple-600", ring: "ring-purple-100",icon: "✨" },
  { id: "home",        name: "Home & Living",emoji: "🪴", bg: "bg-orange-50", accent: "text-orange-600", ring: "ring-orange-100",icon: "🏠" },
  { id: "sports",      name: "Sports",       emoji: "🏏", bg: "bg-yellow-50", accent: "text-yellow-700", ring: "ring-yellow-100",icon: "⚽" },
  { id: "books",       name: "Books",        emoji: "📚", bg: "bg-teal-50",   accent: "text-teal-600",   ring: "ring-teal-100",  icon: "📖" },
  { id: "toys",        name: "Toys & Games", emoji: "🧸", bg: "bg-red-50",    accent: "text-red-600",    ring: "ring-red-100",   icon: "🎮" },
];

function Index() {
  const [q, setQ] = useState("");
  const [activeCategory, setActiveCategory] = useState("electronics");
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const trending = products.slice(0, 8);
  const categoryProducts = products.filter((p) => p.category === activeCategory).slice(0, 15);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/search", search: { q } });
  };

  return (
    <div>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        {/* Big faded text */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <span className="select-none text-[clamp(80px,20vw,200px)] font-extrabold text-white/5 whitespace-nowrap tracking-tight">
            LOCALMART
          </span>
        </div>

        {/* Blob decorations */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-24 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur border border-white/20 px-4 py-1.5 text-xs font-semibold text-white mb-6"
              >
                <Zap className="h-3.5 w-3.5 text-yellow-300" />
                Hyperlocal delivery in 2–4 hours
              </motion.div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight text-balance">
                Shop Local.<br />
                <span className="text-yellow-300">Delivered</span> Fast.
              </h1>
              <p className="mt-5 text-blue-100 text-lg max-w-md leading-relaxed">
                Discover amazing products from stores near you. Electronics, fashion, groceries and more — at your doorstep in hours.
              </p>

              {/* Search box */}
              <form onSubmit={onSearch} className="mt-8 flex items-center gap-2 rounded-2xl bg-white p-2 shadow-xl max-w-lg">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 shrink-0">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products, stores..."
                  className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  Search <ArrowRight className="h-4 w-4" />
                </motion.button>
              </form>

              <div className="mt-5 flex flex-wrap gap-4 text-sm text-blue-100">
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-yellow-300" /> Koramangala, Bengaluru</span>
                <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-yellow-300" /> 124 stores nearby</span>
              </div>
            </motion.div>

            {/* Right — floating product cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block relative"
            >
              <div className="relative flex items-end justify-center gap-4 h-72">
                {/* Main product image */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 relative">
                    <OptimizedImage
                      src={mockProducts[2]?.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"}
                      alt="Product"
                      aspectRatio="square"
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-4 py-2 shadow-lg whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-semibold text-gray-800">₹{mockProducts[2]?.price.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Side card */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-32 h-32 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 mb-8 relative"
                >
                  <OptimizedImage
                    src={mockProducts[6]?.image || "https://images.unsplash.com/photo-1556228578-8c89e6adf883"}
                    alt="Product"
                    aspectRatio="square"
                  />
                </motion.div>

                {/* Rating badge */}
                <div className="absolute top-4 right-0 bg-white rounded-2xl px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-1 text-sm font-bold text-gray-800">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> 4.9
                  </div>
                  <div className="text-[10px] text-gray-400">Top rated</div>
                </div>

                {/* Delivery badge */}
                <div className="absolute bottom-12 left-0 bg-yellow-400 rounded-2xl px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                    <Zap className="h-3.5 w-3.5" /> 2h Delivery
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CATEGORY SHOWCASE ═══════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Browse Categories</h2>
            <p className="text-gray-500 text-sm mt-1">Explore our fully expanded selection of locally delivered items</p>
          </div>
          <Link
            to="/search"
            search={{ category: activeCategory }}
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Explore All in Discover <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {catConfig.map((cat, i) => {
            const isActive = activeCategory === cat.id;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <button
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full group flex flex-col items-center gap-2 rounded-2xl ${cat.bg} p-4 border transition-all duration-300 hover:shadow-md cursor-pointer ${
                    isActive
                      ? "border-blue-600 ring-2 ring-blue-500/25 shadow-md scale-102"
                      : "border-transparent hover:border-blue-200"
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="text-3xl"
                  >
                    {cat.emoji}
                  </motion.div>
                  <span className={`text-xs font-bold ${isActive ? "text-blue-700" : cat.accent} text-center leading-tight`}>
                    {cat.name}
                  </span>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Category Products Grid (15 Products) */}
        <div className="mt-10">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{catConfig.find(c => c.id === activeCategory)?.emoji}</span>
              <h3 className="text-lg font-bold text-gray-900">
                15 Premium {catConfig.find(c => c.id === activeCategory)?.name} Products Available
              </h3>
            </div>
            <Link
              to="/search"
              search={{ category: activeCategory }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition"
            >
              View in Search Grid
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[...Array(15)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
            >
              {categoryProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══════════════ PROMO BANNERS ═══════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-14">
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Banner 1 — Electronics */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 cursor-pointer"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute right-16 bottom-0 h-24 w-24 rounded-full bg-blue-400/30" />
            <div className="relative z-10">
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white mb-3">⚡ Flash Sale</span>
              <h3 className="text-2xl font-extrabold text-white mb-2">Electronics<br />Up to 40% Off</h3>
              <p className="text-blue-100 text-sm mb-5">Latest gadgets from local stores</p>
              <Link to="/search" search={{ category: "electronics" }} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50 transition">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-7xl opacity-20 select-none">🎧</div>
          </motion.div>

          {/* Banner 2 — Fashion */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 to-rose-600 p-8 cursor-pointer"
          >
            <div className="pointer-events-none absolute -left-8 -bottom-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10">
              <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white mb-3">🔥 Trending</span>
              <h3 className="text-2xl font-extrabold text-white mb-2">Fashion<br />New Arrivals</h3>
              <p className="text-pink-100 text-sm mb-5">Curated styles from local designers</p>
              <Link to="/search" search={{ category: "fashion" }} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-pink-600 hover:bg-pink-50 transition">
                Explore <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-7xl opacity-20 select-none">👗</div>
          </motion.div>
        </div>

        {/* Wide banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.005 }}
          className="mt-4 relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-8 cursor-pointer"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_right,#1d4ed840,transparent_60%)]" />
          <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
            <div>
              <span className="inline-block rounded-full bg-yellow-400/20 border border-yellow-400/30 px-3 py-1 text-xs font-bold text-yellow-400 mb-3">⭐ Best Sellers</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Premium Picks<br />Just for You</h3>
              <p className="text-gray-400 text-sm">Hand-curated products from top-rated local stores</p>
            </div>
            <Link to="/search" className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-gray-900 hover:bg-gray-100 transition whitespace-nowrap">
              Browse All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="absolute right-24 top-1/2 -translate-y-1/2 text-[80px] opacity-10 select-none hidden sm:block">🛒</div>
        </motion.div>
      </section>

      {/* ═══════════════ NEARBY STORES ═══════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Stores Near You</h2>
            <p className="text-gray-500 text-sm mt-1">Local shops with fast delivery</p>
          </div>
          <Link to="/search" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="-mx-4 sm:-mx-6 flex gap-4 overflow-x-auto px-4 sm:px-6 pb-4 [scrollbar-width:none]">
          {stores.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="shrink-0"
            >
              <Link
                to="/store/$id"
                params={{ id: s.id }}
                className="block w-64 rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-32 overflow-hidden bg-gray-100">
                  <OptimizedImage
                    src={s.banner}
                    alt={s.name}
                    aspectRatio="wide"
                    enableHoverScale
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-2xl">{s.logo}</div>
                  {s.trusted && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-green-600">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-sm">{s.name}</h3>
                    <div className="flex items-center gap-1 text-xs font-semibold">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {s.rating}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <MapPin className="h-3 w-3" /> {s.distance} km away
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════ TRENDING PRODUCTS ═══════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Trending Products</h2>
            <p className="text-gray-500 text-sm mt-1">What your neighborhood is loving</p>
          </div>
          <Link to="/search" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
            Explore all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : trending.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
          }
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-600 px-6 py-3 text-sm font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition"
          >
            View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ═══════════════ WHY LOCALMART ═══════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Why LocalMart?</h2>
          <p className="text-gray-500 text-sm mt-2">Built for modern shoppers who value speed and locality</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: <Truck className="h-6 w-6" />, title: "Fast Delivery", text: "Get items in 2–4 hours from stores within 5km.", color: "bg-blue-50 text-blue-600" },
            { icon: <MapPin className="h-6 w-6" />, title: "Hyperlocal", text: "Support neighborhood shops, not giant warehouses.", color: "bg-green-50 text-green-600" },
            { icon: <ShieldCheck className="h-6 w-6" />, title: "100% Genuine", text: "All stores verified. Authentic products only.", color: "bg-purple-50 text-purple-600" },
            { icon: <Headphones className="h-6 w-6" />, title: "24/7 Support", text: "Round-the-clock help whenever you need it.", color: "bg-orange-50 text-orange-600" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${f.color} mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════ MARQUEE / TRUST BAR ═══════════════ */}
      <section className="mt-20 bg-gray-900 overflow-hidden py-5">
        <div className="marquee">
          {[...Array(2)].map((_, j) => (
            <div key={j} className="flex items-center gap-12 px-6 text-gray-400 text-sm font-medium whitespace-nowrap">
              {["⚡ Fast Delivery", "🛡️ Secure Payments", "🏪 124+ Local Stores", "⭐ 4.8 Avg Rating", "🔄 Easy Returns", "📦 Free Shipping ₹499+", "💚 Support Local"].map((t) => (
                <span key={t} className="flex items-center gap-2">{t}<span className="text-gray-700">·</span></span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 my-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-14 text-center"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
          <div className="relative z-10">
            <span className="inline-block rounded-full bg-white/15 border border-white/20 px-4 py-1.5 text-xs font-bold text-white mb-4">🛍️ Start Shopping Today</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Ready to discover your neighborhood?</h2>
            <p className="text-blue-100 max-w-md mx-auto text-sm mb-8">Browse products from stores near you and get them delivered in hours.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/search" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 transition">
                <Package className="h-4 w-4" /> Browse Products
              </Link>
              <Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/40 px-6 py-3 text-sm font-bold text-white hover:bg-white/10 transition">
                Create Free Account
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { Sliders, X, Search, SlidersHorizontal } from "lucide-react";
import { categories } from "@/lib/mock-data";
import { ProductCard, ProductSkeleton } from "@/components/product-card";
import { useProducts } from "@/hooks/use-products";

type Search = { q?: string; category?: string };

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Discover — LocalMart" },
      { name: "description", content: "Browse products from stores nearby." },
    ],
  }),
  component: SearchPage,
});

const catColors: Record<string, string> = {
  groceries: "bg-green-50 text-green-700 border-green-200",
  electronics: "bg-blue-50 text-blue-700 border-blue-200",
  fashion: "bg-pink-50 text-pink-700 border-pink-200",
  beauty: "bg-purple-50 text-purple-700 border-purple-200",
  home: "bg-orange-50 text-orange-700 border-orange-200",
  sports: "bg-yellow-50 text-yellow-700 border-yellow-200",
  books: "bg-teal-50 text-teal-700 border-teal-200",
  toys: "bg-red-50 text-red-700 border-red-200",
};

function SearchPage() {
  const { q, category } = Route.useSearch();
  const [maxPrice, setMaxPrice] = useState(15000);
  const [maxDist, setMaxDist] = useState(5);
  const [cat, setCat] = useState<string | undefined>(category);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState<"default" | "price-asc" | "price-desc" | "rating">("default");
  const [visibleCount, setVisibleCount] = useState(16);

  const { products: apiProducts, loading } = useProducts({ category: cat, search: q });

  // Reset pagination when search parameters, filters or sorting change
  useEffect(() => {
    setVisibleCount(16);
  }, [cat, q, maxPrice, maxDist, sort]);

  const results = useMemo(() => {
    let list = apiProducts.filter((p) => p.price <= maxPrice && p.distance <= maxDist);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [apiProducts, maxPrice, maxDist, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 mb-6"
      >
        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
          {q ? (
            <>Results for <span className="text-blue-600">"{q}"</span></>
          ) : cat ? (
            <>
              {categories.find((c) => c.id === cat)?.emoji}{" "}
              <span className="capitalize">{categories.find((c) => c.id === cat)?.name || "Products"}</span>
            </>
          ) : (
            "Discover Products"
          )}
        </h1>
        <p className="text-gray-500 text-sm mt-1">{results.length} product{results.length !== 1 ? "s" : ""} found near you</p>
      </motion.div>

      {/* Category Pills */}
      <div className="-mx-4 sm:-mx-6 flex gap-2 overflow-x-auto px-4 sm:px-6 pb-3 mb-6 [scrollbar-width:none]">
        <button
          onClick={() => setCat(undefined)}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${!cat ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id === cat ? undefined : c.id)}
            className={`shrink-0 flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              cat === c.id
                ? "bg-blue-600 border-blue-600 text-white"
                : `bg-white border-gray-200 text-gray-600 hover:border-gray-300 ${catColors[c.id] || ""}`
            }`}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => setFilterOpen(true)}
          className="md:hidden flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-gray-300 shadow-sm"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:block">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-blue-400 shadow-sm"
          >
            <option value="default">Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        {/* Sidebar Filters — Desktop */}
        <aside className="hidden md:block">
          <FilterPanel {...{ maxPrice, setMaxPrice, maxDist, setMaxDist, cat, setCat }} />
        </aside>

        {/* Results */}
        <div>
          {results.length === 0 && !loading ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-gray-100 bg-white p-16 text-center shadow-sm"
            >
              <Search className="mx-auto h-12 w-12 text-gray-200 mb-4" />
              <h2 className="text-xl font-bold text-gray-800">No products found</h2>
              <p className="mt-2 text-sm text-gray-500">Try a different search or widen your filters.</p>
              <button
                onClick={() => { setCat(undefined); setMaxPrice(15000); setMaxDist(5); }}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {loading
                    ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
                    : results.slice(0, visibleCount).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
                  }
                </AnimatePresence>
              </div>

              {/* Incremental loading / progress indicator */}
              {!loading && results.length > visibleCount && (
                <div className="mt-12 flex flex-col items-center justify-center gap-4 bg-gray-50/50 border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500">
                    Showing <span className="text-blue-600 font-bold">{visibleCount}</span> of <span className="text-gray-800 font-bold">{results.length}</span> premium products
                  </div>
                  <div className="w-56 h-1.5 rounded-full bg-gray-200 overflow-hidden relative">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(visibleCount / results.length) * 100}%` }}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setVisibleCount((prev) => Math.min(prev + 16, results.length))}
                    className="mt-1 rounded-2xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all"
                  >
                    Load More Products
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setFilterOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28 }}
              className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-6 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterPanel {...{ maxPrice, setMaxPrice, maxDist, setMaxDist, cat, setCat }} />
              <button
                onClick={() => setFilterOpen(false)}
                className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition"
              >
                Apply Filters ({results.length} results)
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterPanel(props: {
  maxPrice: number; setMaxPrice: (n: number) => void;
  maxDist: number; setMaxDist: (n: number) => void;
  cat?: string; setCat: (c?: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-6 sticky top-24">
      <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
        <Sliders className="h-4 w-4 text-blue-500" /> Filters
      </h3>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">Max Price</label>
          <span className="text-sm font-bold text-blue-600">₹{props.maxPrice.toLocaleString()}</span>
        </div>
        <input
          type="range" min={100} max={15000} step={100} value={props.maxPrice}
          onChange={(e) => props.setMaxPrice(+e.target.value)}
          className="w-full h-2 rounded-full accent-blue-600 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>₹100</span><span>₹15,000</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">Distance</label>
          <span className="text-sm font-bold text-blue-600">{props.maxDist} km</span>
        </div>
        <input
          type="range" min={0.5} max={10} step={0.5} value={props.maxDist}
          onChange={(e) => props.setMaxDist(+e.target.value)}
          className="w-full h-2 rounded-full accent-blue-600 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0.5 km</span><span>10 km</span>
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold text-gray-700 mb-3">Category</div>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => props.setCat(undefined)}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition text-left ${!props.cat ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => props.setCat(c.id === props.cat ? undefined : c.id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition text-left ${props.cat === c.id ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => { props.setCat(undefined); props.setMaxPrice(15000); props.setMaxDist(5); }}
        className="w-full rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition"
      >
        Reset All
      </button>
    </div>
  );
}

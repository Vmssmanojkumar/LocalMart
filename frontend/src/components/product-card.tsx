import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Zap, Star, ShoppingCart, Eye } from "lucide-react";
import type { Product } from "@/lib/mock-data";
import { useStore, store } from "@/store/app-store";
import { useState, memo } from "react";
import { toast } from "sonner";
import { OptimizedImage } from "./optimized-image";

function ProductCardComponent({ product, index = 0 }: { product: Product; index?: number }) {
  const wishlist = useStore((s) => s.wishlist);
  const liked = wishlist.includes(product.id);
  const fast = product.deliveryHours <= 2;
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    store.addToCart(product);
    toast.success(`${product.name} added to cart!`, {
      duration: 1800,
      icon: "🛒",
    });
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.35), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
    >
      {/* Image */}
      <Link to="/product/$id" params={{ id: product.id }} className="block relative overflow-hidden bg-gray-50 aspect-square">
        <OptimizedImage
          src={product.image}
          alt={product.name}
          aspectRatio="square"
          enableHoverScale={hovered}
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {discount >= 10 && (
            <span className="rounded-lg bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white leading-tight">
              -{discount}%
            </span>
          )}
          {fast && (
            <span className="flex items-center gap-0.5 rounded-lg bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white leading-tight">
              <Zap className="h-2.5 w-2.5 fill-current" /> FAST
            </span>
          )}
          {product.tags?.includes("New") && (
            <span className="rounded-lg bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white leading-tight">NEW</span>
          )}
          {product.tags?.includes("Bestseller") && (
            <span className="rounded-lg bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white leading-tight">⭐ HOT</span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); store.toggleWishlist(product.id); }}
          className="absolute right-2.5 top-2.5 h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-md hover:scale-110 transition"
          aria-label="Wishlist"
        >
          <motion.span animate={{ scale: liked ? [1, 1.4, 1] : 1 }} transition={{ duration: 0.3 }}>
            <Heart className={`h-4 w-4 transition ${liked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
          </motion.span>
        </button>

        {/* Quick view overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/50 to-transparent pb-3 pt-8"
            >
              <Link
                to="/product/$id"
                params={{ id: product.id }}
                className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 transition"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye className="h-3.5 w-3.5" /> Quick View
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-1">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{product.storeName}</span>
          <span className="ml-auto shrink-0">{product.distance}km</span>
        </div>

        <Link to="/product/$id" params={{ id: product.id }}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-blue-600 transition">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-3 w-3 ${s <= Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200"}`}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400 font-medium">{product.rating}</span>
          <span className="ml-1 text-[11px] text-gray-300">·</span>
          <span className="text-[11px] text-blue-500 font-medium">{product.deliveryHours}h delivery</span>
        </div>

        {/* Price + Add */}
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <div className="text-base sm:text-lg font-extrabold text-gray-900">
              ₹{product.price.toLocaleString()}
            </div>
            {product.originalPrice && (
              <div className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
              adding
                ? "bg-green-500 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>{adding ? "Added!" : "Add"}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export const ProductCard = memo(ProductCardComponent);

export function ProductSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <div className="aspect-square bg-gray-100 shimmer" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 w-1/2 rounded-lg bg-gray-100 shimmer" />
        <div className="h-4 w-4/5 rounded-lg bg-gray-100 shimmer" />
        <div className="h-3 w-2/5 rounded-lg bg-gray-100 shimmer" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-6 w-1/3 rounded-lg bg-gray-100 shimmer" />
          <div className="h-8 w-16 rounded-xl bg-gray-100 shimmer" />
        </div>
      </div>
    </div>
  );
}

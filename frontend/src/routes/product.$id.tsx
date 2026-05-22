import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Heart, Zap, MapPin, Star, ShoppingBag, Check, ChevronLeft } from "lucide-react";
import { products } from "@/lib/mock-data";
import { useStore, store } from "@/store/app-store";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Product not found</h1>
      <Link to="/search" className="mt-4 inline-block text-primary">Back to discover</Link>
    </div>
  ),
});

function ProductPage() {
  const { id } = Route.useParams();
  const product = products.find((p) => p.id === id);
  if (!product) throw notFound();
  const wishlist = useStore((s) => s.wishlist);
  const liked = wishlist.includes(product.id);
  const [added, setAdded] = useState(false);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    store.addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <Link to="/search" className="mt-8 inline-flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="glass relative overflow-hidden rounded-[2rem] shadow-soft"
        >
          <motion.img
            src={product.image}
            alt={product.name}
            className="aspect-square w-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.6 }}
          />
          {product.deliveryHours <= 2 && (
            <div className="pulse-glow absolute left-4 top-4 flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
              <Zap className="h-3.5 w-3.5 fill-current" /> INSTANT DELIVERY
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Link to="/store/$id" params={{ id: product.storeId }} className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
            <MapPin className="h-3 w-3 text-primary" /> {product.storeName} · {product.distance} km
          </Link>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" />{product.rating}</span>
            <span className="text-foreground/60">·</span>
            <span className="text-foreground/70">{product.tags?.join(" · ") ?? product.category}</span>
          </div>
          <p className="mt-5 text-foreground/70">{product.description}</p>

          <div className="mt-6 flex items-end gap-3">
            <div className="font-display text-4xl font-bold">₹{product.price.toLocaleString()}</div>
            {product.originalPrice && (
              <>
                <div className="text-lg text-foreground/40 line-through">₹{product.originalPrice.toLocaleString()}</div>
                <div className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                </div>
              </>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-6 flex items-center gap-2 rounded-2xl glass p-4 shadow-soft"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold">Delivery in {product.deliveryHours}–{product.deliveryHours + 1} hours</div>
              <div className="text-xs text-foreground/60">From {product.storeName}, {product.distance} km away</div>
            </div>
          </motion.div>

          <div className="mt-6 flex gap-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleAdd}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground py-3.5 text-sm font-semibold text-background transition hover:bg-primary hover:text-primary-foreground"
            >
              <motion.span key={added ? "ok" : "add"} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2">
                {added ? <><Check className="h-4 w-4" /> Added to cart</> : <><ShoppingBag className="h-4 w-4" /> Add to cart</>}
              </motion.span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => store.toggleWishlist(product.id)}
              className="grid h-12 w-12 place-items-center rounded-full glass shadow-soft"
              aria-label="Wishlist"
            >
              <Heart className={`h-5 w-5 transition ${liked ? "fill-destructive text-destructive" : ""}`} />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl font-bold">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}

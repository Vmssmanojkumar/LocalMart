import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Star, Zap, ChevronLeft } from "lucide-react";
import { stores, products } from "@/lib/mock-data";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/store/$id")({
  component: StorePage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Store not found</h1>
      <Link to="/" className="mt-4 inline-block text-primary">Back home</Link>
    </div>
  ),
});

function StorePage() {
  const { id } = Route.useParams();
  const store = stores.find((s) => s.id === id);
  if (!store) throw notFound();
  const items = products.filter((p) => p.storeId === store.id);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <Link to="/" className="mt-8 inline-flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative mt-4 overflow-hidden rounded-[2rem] shadow-soft"
      >
        <div className="relative h-56 sm:h-72">
          <img src={store.banner} alt={store.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-background sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-background/20 px-3 py-1 text-xs backdrop-blur">
                <span className="text-lg">{store.logo}</span> {store.category}
                {store.trusted && <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">✓ Trusted Local Seller</span>}
              </div>
              <h1 className="font-display text-4xl font-bold sm:text-6xl">{store.name}</h1>
              <p className="mt-2 max-w-xl text-sm opacity-90">{store.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge icon={<Star className="h-3.5 w-3.5 fill-current" />} text={`${store.rating} rating`} />
              <Badge icon={<MapPin className="h-3.5 w-3.5" />} text={`${store.distance} km`} />
              <Badge icon={<Zap className="h-3.5 w-3.5" />} text="Fast delivery" />
            </div>
          </div>
        </div>
      </motion.div>

      <section className="mt-12">
        <h2 className="font-display text-3xl font-bold">From this store</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
        {items.length === 0 && (
          <div className="glass mt-6 rounded-3xl p-12 text-center text-sm text-foreground/60">No products listed yet.</div>
        )}
      </section>
    </div>
  );
}

function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground">
      {icon} {text}
    </span>
  );
}

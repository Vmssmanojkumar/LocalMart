/**
 * useProducts — fetches products from the backend API.
 * Falls back to mock data if the API is unreachable or returns nothing,
 * so the UI always has something to display.
 */
import { useState, useEffect } from "react";
import { apiProducts, type ApiProduct } from "@/lib/api";
import { products as mockProducts, type Product } from "@/lib/mock-data";

/** Converts an ApiProduct (from MongoDB) to the frontend Product shape */
export function toProduct(p: ApiProduct): Product {
  return {
    id: p._id,
    name: p.name,
    price: p.price,
    image: p.image ?? "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=800&q=80",
    category: p.category ?? "general",
    rating: 4.5,
    storeId: typeof p.retailer === "string" ? p.retailer : "local",
    storeName: "Local Store",
    distance: 1.0,
    deliveryHours: p.deliveryTime ? parseInt(p.deliveryTime) || 2 : 2,
    description: `${p.name} — available for delivery.`,
    tags: p.category ? [p.category] : undefined,
  };
}

type UseProductsOptions = {
  category?: string;
  search?: string;
};

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiProducts
      .getAll({ category: options.category, search: options.search })
      .then((apiProds) => {
        if (cancelled) return;
        if (apiProds.length > 0) {
          setProducts(apiProds.map(toProduct));
          setFromApi(true);
        } else {
          // No products in DB yet — use mock data
          let filtered = mockProducts;
          if (options.category) filtered = filtered.filter((p) => p.category === options.category);
          if (options.search) {
            const q = options.search.toLowerCase();
            filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
          }
          setProducts(filtered);
          setFromApi(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        // API unreachable — silently fall back to mock data
        let filtered = mockProducts;
        if (options.category) filtered = filtered.filter((p) => p.category === options.category);
        if (options.search) {
          const q = options.search.toLowerCase();
          filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
        }
        setProducts(filtered);
        setFromApi(false);
        setError(null); // suppress error — mock fallback is seamless
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [options.category, options.search]);

  return { products, loading, error, fromApi };
}

/** Fetches a single product by ID — tries API first, falls back to mock */
export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Try API first (only if id looks like a MongoDB ObjectId)
    if (/^[a-f\d]{24}$/i.test(id)) {
      apiProducts
        .getById(id)
        .then((p) => { if (!cancelled) setProduct(toProduct(p)); })
        .catch(() => { if (!cancelled) setProduct(null); })
        .finally(() => { if (!cancelled) setLoading(false); });
    } else {
      // Mock id format — use mock data directly
      const found = mockProducts.find((p) => p.id === id) ?? null;
      setProduct(found);
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, [id]);

  return { product, loading };
}

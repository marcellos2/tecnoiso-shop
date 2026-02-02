import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";

type DbProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  category: string;
  in_stock: boolean | null;
  discount: number | null;
  rating: number | null;
  reviews_count: number | null;
  specifications: unknown;
};

const mapDbToUiProduct = (p: DbProductRow): Product => {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    price: Number(p.price),
    originalPrice: p.original_price ?? undefined,
    image: p.image_url ?? "/placeholder.svg",
    category: p.category,
    inStock: p.in_stock ?? true,
    discount: p.discount ?? undefined,
    rating: p.rating ?? undefined,
    reviews: p.reviews_count ?? undefined,
    specifications: (p.specifications as Record<string, string> | null) ?? undefined,
  };
};

export function useProducts() {
  const [rows, setRows] = useState<DbProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("products")
        .select(
          "id,name,description,price,original_price,image_url,category,in_stock,discount,rating,reviews_count,specifications"
        )
        .order("created_at", { ascending: false });

      if (!isMounted) return;
      if (error) {
        setError(error.message);
        setRows([]);
      } else {
        setRows((data as unknown as DbProductRow[]) ?? []);
      }
      setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const products = useMemo(() => rows.map(mapDbToUiProduct), [rows]);

  return { products, loading, error };
}

export function useProduct(productId: string | undefined) {
  const [row, setRow] = useState<DbProductRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!productId) {
      setLoading(false);
      setRow(null);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("products")
        .select(
          "id,name,description,price,original_price,image_url,category,in_stock,discount,rating,reviews_count,specifications"
        )
        .eq("id", productId)
        .maybeSingle();

      if (!isMounted) return;
      if (error) {
        setError(error.message);
        setRow(null);
      } else {
        setRow((data as unknown as DbProductRow) ?? null);
      }
      setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const product = useMemo(() => (row ? mapDbToUiProduct(row) : null), [row]);

  return { product, loading, error };
}

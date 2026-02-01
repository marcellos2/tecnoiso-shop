import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { products as staticProducts } from '@/data/products';

interface DbProduct {
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
  specifications: Record<string, string> | null;
}

const mapDbProductToProduct = (dbProduct: DbProduct, fallbackImage?: string): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  description: dbProduct.description || '',
  price: dbProduct.price,
  originalPrice: dbProduct.original_price || undefined,
  image: dbProduct.image_url || fallbackImage || '/placeholder.svg',
  category: dbProduct.category,
  inStock: dbProduct.in_stock ?? true,
  discount: dbProduct.discount || undefined,
  rating: dbProduct.rating || undefined,
  reviews: dbProduct.reviews_count || 0,
  specifications: (dbProduct.specifications as Record<string, string>) || {},
});

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(staticProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching products:', error);
          setError(error.message);
          // Fallback to static products
          setProducts(staticProducts);
        } else if (data && data.length > 0) {
          const mappedProducts = data.map((p) => mapDbProductToProduct(p as unknown as DbProduct));
          setProducts(mappedProducts);
        } else {
          // No products in DB, use static
          setProducts(staticProducts);
        }
      } catch (e) {
        console.error('Error in fetchProducts:', e);
        setProducts(staticProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { products, loading, error };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // First try to get from DB
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching product:', error);
          // Fallback to static
          const staticProduct = staticProducts.find((p) => p.id === id);
          setProduct(staticProduct || null);
        } else if (data) {
          setProduct(mapDbProductToProduct(data as unknown as DbProduct));
        } else {
          // Try static products
          const staticProduct = staticProducts.find((p) => p.id === id);
          setProduct(staticProduct || null);
        }
      } catch (e) {
        console.error('Error in fetchProduct:', e);
        const staticProduct = staticProducts.find((p) => p.id === id);
        setProduct(staticProduct || null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, loading, error };
};

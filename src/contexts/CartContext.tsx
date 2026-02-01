import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product, CartItem } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "tecnoiso_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load cart from localStorage on initial mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (e) {
        console.error("Error parsing cart from localStorage:", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoading]);

  // Listen for auth changes and sync cart
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const newUserId = session?.user?.id ?? null;
        setUserId(newUserId);

        if (event === 'SIGNED_IN' && newUserId) {
          // User just signed in - merge local cart with server cart
          await mergeCartsOnLogin(newUserId);
        } else if (event === 'SIGNED_OUT') {
          // Keep local cart when signing out
          setUserId(null);
        }
      }
    );

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
        loadCartFromServer(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync cart to server when items change and user is logged in
  useEffect(() => {
    if (userId && !isLoading && !isSyncing && items.length >= 0) {
      const timeoutId = setTimeout(() => {
        saveCartToServer(userId, items);
      }, 500); // Debounce to avoid too many requests
      return () => clearTimeout(timeoutId);
    }
  }, [items, userId, isLoading, isSyncing]);

  const loadCartFromServer = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('user_carts')
        .select('items')
        .eq('user_id', uid)
        .maybeSingle();

      if (error) {
        console.error("Error loading cart from server:", error);
        return;
      }

      if (data?.items && Array.isArray(data.items)) {
        setItems(data.items as unknown as CartItem[]);
      }
    } catch (e) {
      console.error("Error loading cart:", e);
    }
  };

  const saveCartToServer = async (uid: string, cartItems: CartItem[]) => {
    try {
      const { error } = await supabase
        .from('user_carts')
        .upsert(
          { user_id: uid, items: cartItems as unknown as any },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error("Error saving cart to server:", error);
      }
    } catch (e) {
      console.error("Error saving cart:", e);
    }
  };

  const mergeCartsOnLogin = async (uid: string) => {
    setIsSyncing(true);
    try {
      // Get server cart
      const { data: serverData } = await supabase
        .from('user_carts')
        .select('items')
        .eq('user_id', uid)
        .maybeSingle();

      const serverItems = (serverData?.items as unknown as CartItem[]) || [];
      const localItems = [...items];

      // Merge: prioritize local cart quantities, add server items not in local
      const mergedMap = new Map<string, CartItem>();

      // Add local items first
      localItems.forEach(item => {
        mergedMap.set(item.id, item);
      });

      // Add server items that aren't in local cart
      serverItems.forEach(item => {
        if (!mergedMap.has(item.id)) {
          mergedMap.set(item.id, item);
        } else {
          // If item exists in both, keep the higher quantity
          const existing = mergedMap.get(item.id)!;
          if (item.quantity > existing.quantity) {
            mergedMap.set(item.id, item);
          }
        }
      });

      const mergedItems = Array.from(mergedMap.values());
      setItems(mergedItems);

      // Save merged cart to server
      await saveCartToServer(uid, mergedItems);

      if (localItems.length > 0 && serverItems.length > 0) {
        toast.success("Seu carrinho foi sincronizado");
      }
    } catch (e) {
      console.error("Error merging carts:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        toast.success(`Quantidade atualizada: ${product.name}`);
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      toast.success(`Adicionado ao carrinho: ${product.name}`);
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
    toast.info("Produto removido do carrinho");
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    toast.info("Carrinho limpo");
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

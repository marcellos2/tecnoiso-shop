import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

export function CartSidebar() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Seu carrinho está vazio
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3 pb-4 border-b border-border">
          <img
            src={item.image}
            alt={item.name}
            className="w-16 h-16 object-cover rounded"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
            <p className="text-primary font-semibold text-sm mt-1">
              {formatPrice(item.price)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 ml-auto text-destructive"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
      <div className="pt-4 border-t border-border">
        <div className="flex justify-between items-center font-semibold text-lg">
          <span>Total</span>
          <span className="text-primary">{formatPrice(totalPrice)}</span>
        </div>
        <p className="text-sm text-success mt-1">
          {formatPrice(totalPrice * 0.95)} no PIX (5% off)
        </p>
      </div>
    </div>
  );
}

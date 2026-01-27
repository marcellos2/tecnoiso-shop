import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const pixPrice = product.price * 0.95; // 5% discount for PIX

  return (
    <div className="product-card group">
      <div className="relative overflow-hidden aspect-square bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.discount && (
          <span className="badge-discount absolute top-3 left-3">
            -{product.discount}%
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground px-4 py-2 rounded font-semibold">
              Esgotado
            </span>
          </div>
        )}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link to={`/produto/${product.id}`}>
            <Button size="icon" variant="secondary" className="shadow-lg">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-4">
        <span className="badge-category">{product.category}</span>
        <h3 className="font-semibold mt-2 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>
        
        <div className="mt-3 space-y-1">
          {product.originalPrice && (
            <p className="price-original">{formatPrice(product.originalPrice)}</p>
          )}
          <p className="price-current">{formatPrice(product.price)}</p>
          <p className="price-pix text-sm">
            {formatPrice(pixPrice)} no PIX
          </p>
          <p className="text-xs text-muted-foreground">
            ou 12x de {formatPrice(product.price / 12)}
          </p>
        </div>

        <Button
          onClick={() => addItem(product)}
          disabled={!product.inStock}
          className="w-full mt-4 gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}

import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Eye } from "lucide-react";
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

  const pixPrice = product.price * 0.95;

  return (
    <div className="product-card group">
      <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-secondary to-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.discount && (
            <span className="badge-discount">
              -{product.discount}%
            </span>
          )}
          {!product.discount && product.inStock && (
            <span className="badge-new">NOVO</span>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
          <Button size="icon" variant="secondary" className="w-9 h-9 rounded-full shadow-lg backdrop-blur-sm bg-card/80">
            <Heart className="w-4 h-4" />
          </Button>
          <Link to={`/produto/${product.id}`}>
            <Button size="icon" variant="secondary" className="w-9 h-9 rounded-full shadow-lg backdrop-blur-sm bg-card/80">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-foreground/70 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-card text-foreground px-6 py-2 rounded-full font-semibold shadow-lg">
              Esgotado
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <span className="badge-category">{product.category}</span>
        <Link to={`/produto/${product.id}`}>
          <h3 className="font-semibold mt-3 line-clamp-2 min-h-[3rem] hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-4 space-y-1">
          {product.originalPrice && (
            <p className="price-original">{formatPrice(product.originalPrice)}</p>
          )}
          <p className="price-current">{formatPrice(product.price)}</p>
          <p className="price-pix text-sm flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-success rounded-full"></span>
            {formatPrice(pixPrice)} no PIX
          </p>
          <p className="text-xs text-muted-foreground">
            12x de {formatPrice(product.price / 12)} sem juros
          </p>
        </div>

        <Button
          onClick={() => addItem(product)}
          disabled={!product.inStock}
          className="w-full mt-4 gap-2 h-11 rounded-xl font-semibold"
        >
          <ShoppingCart className="w-4 h-4" />
          Comprar
        </Button>
      </div>
    </div>
  );
}

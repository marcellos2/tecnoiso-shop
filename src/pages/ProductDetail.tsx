import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Truck, ShieldCheck, Clock, CheckCircle2, QrCode, CreditCard, Star, Package, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/contexts/CartContext";
import { products } from "@/data/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useState } from "react";

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === id);
  const relatedProducts = products.filter((p) => p.category === product?.category && p.id !== id).slice(0, 4);

  if (!product) {
    return (
      <>
        <Header />
        <main className="container pt-56 md:pt-52 pb-12 text-center min-h-[60vh] flex flex-col items-center justify-center">
          <Package className="w-24 h-24 text-muted-foreground mb-6" />
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <p className="text-muted-foreground mb-6">O produto que você procura não existe ou foi removido.</p>
          <Link to="/">
            <Button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Início
            </Button>
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const pixPrice = product.price * 0.95;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
  };

  return (
    <>
      <Header />
      <main className="container pt-56 md:pt-52 pb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Início</Link>
          <span>/</span>
          <Link to="/produtos" className="hover:text-primary transition-colors">Produtos</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Image */}
          <div className="space-y-4 mt-12">
            <div className="aspect-square bg-gradient-to-br from-secondary to-muted rounded-3xl overflow-hidden relative group max-w-md mx-auto lg:mx-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {product.discount && (
                <Badge className="absolute top-6 left-6 bg-accent text-accent-foreground text-lg px-4 py-2">
                  -{product.discount}% OFF
                </Badge>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <Badge variant="secondary" className="badge-category mb-4">{product.category}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{product.name}</h1>
            
            {/* Rating placeholder */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(47 avaliações)</span>
            </div>

            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">{product.description}</p>

            {/* Price */}
            <Card className="p-6 mb-8 border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
              {product.originalPrice && (
                <p className="text-muted-foreground line-through text-lg">
                  De {formatPrice(product.originalPrice)}
                </p>
              )}
              <p className="text-4xl font-extrabold text-foreground mb-2">
                {formatPrice(product.price)}
              </p>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2 bg-success/10 px-3 py-1.5 rounded-full">
                  <QrCode className="w-5 h-5 text-success" />
                  <span className="text-lg font-bold text-success">
                    {formatPrice(pixPrice)} no PIX
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="w-4 h-4" />
                <span>ou 12x de {formatPrice(product.price / 12)} sem juros</span>
              </div>
            </Card>

            {/* Quantity & Add to Cart */}
            <div className="flex gap-4 mb-8">
              <div className="flex items-center border-2 border-border rounded-xl overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none h-14 w-14"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-14 text-center font-bold text-lg">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none h-14 w-14"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
              <Button
                className="flex-1 h-14 text-lg gap-3 rounded-xl font-bold"
                disabled={!product.inStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-6 h-6" />
                {product.inStock ? "Adicionar ao Carrinho" : "Produto Indisponível"}
              </Button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                <Truck className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold text-sm">Frete Grátis</p>
                  <p className="text-xs text-muted-foreground">Acima de R$500</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                <ShieldCheck className="w-6 h-6 text-success" />
                <div>
                  <p className="font-semibold text-sm">Garantia</p>
                  <p className="text-xs text-muted-foreground">12 meses</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                <Clock className="w-6 h-6 text-accent" />
                <div>
                  <p className="font-semibold text-sm">Entrega</p>
                  <p className="text-xs text-muted-foreground">3-7 dias úteis</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                <RotateCcw className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold text-sm">Troca Fácil</p>
                  <p className="text-xs text-muted-foreground">7 dias</p>
                </div>
              </div>
            </div>

            {/* Stock Status */}
            {product.inStock ? (
              <div className="flex items-center gap-2 text-success font-medium">
                <CheckCircle2 className="w-5 h-5" />
                <span>Em estoque - Pronta entrega</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-destructive font-medium">
                <Package className="w-5 h-5" />
                <span>Produto indisponível no momento</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="specs" className="mt-16">
          <TabsList className="w-full justify-start bg-secondary p-1 rounded-xl">
            <TabsTrigger value="specs" className="rounded-lg px-6">Especificações</TabsTrigger>
            <TabsTrigger value="description" className="rounded-lg px-6">Descrição</TabsTrigger>
          </TabsList>
          <TabsContent value="specs" className="mt-8">
            <Card className="p-8">
              <h3 className="font-bold text-xl mb-6">Especificações Técnicas</h3>
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-4 border-b border-border">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="description" className="mt-8">
            <Card className="p-8">
              <h3 className="font-bold text-xl mb-6">Descrição do Produto</h3>
              <div className="prose max-w-none text-muted-foreground">
                <p className="leading-relaxed mb-4">{product.description}</p>
                <p className="leading-relaxed">
                  Todos os nossos produtos são originais de fábrica e passam por rigoroso controle de qualidade. 
                  A Tecnoiso trabalha apenas com equipamentos de marcas reconhecidas no mercado de metrologia, 
                  garantindo precisão e durabilidade. Oferecemos suporte técnico especializado e garantia de 12 meses 
                  em todos os instrumentos.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-bold mb-8">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
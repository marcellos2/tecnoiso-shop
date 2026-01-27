import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Truck, ShieldCheck, Clock, CheckCircle2, QrCode, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/contexts/CartContext";
import { products } from "@/data/products";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
        <main className="container py-12 text-center">
          <h1 className="text-2xl font-bold">Produto não encontrado</h1>
          <Link to="/">
            <Button className="mt-4">Voltar ao Início</Button>
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
      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Início</Link>
          <span>/</span>
          <Link to="/produtos" className="hover:text-primary">Produtos</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-secondary rounded-xl overflow-hidden relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.discount && (
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                  -{product.discount}% OFF
                </Badge>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <Badge variant="secondary" className="mb-3">{product.category}</Badge>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-muted-foreground mb-6">{product.description}</p>

            {/* Price */}
            <Card className="p-6 mb-6">
              {product.originalPrice && (
                <p className="text-muted-foreground line-through text-lg">
                  {formatPrice(product.originalPrice)}
                </p>
              )}
              <p className="text-4xl font-bold text-foreground">
                {formatPrice(product.price)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <QrCode className="w-5 h-5 text-success" />
                <span className="text-xl font-semibold text-success">
                  {formatPrice(pixPrice)} no PIX
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <CreditCard className="w-4 h-4" />
                <span>ou 12x de {formatPrice(product.price / 12)} sem juros</span>
              </div>
            </Card>

            {/* Quantity & Add to Cart */}
            <div className="flex gap-4 mb-6">
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
              <Button
                className="flex-1 h-12 text-lg gap-2"
                disabled={!product.inStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5" />
                {product.inStock ? "Adicionar ao Carrinho" : "Indisponível"}
              </Button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col items-center text-center p-3 bg-secondary rounded-lg">
                <Truck className="w-6 h-6 text-primary mb-2" />
                <span className="text-xs font-medium">Frete Grátis</span>
                <span className="text-xs text-muted-foreground">acima de R$500</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-secondary rounded-lg">
                <ShieldCheck className="w-6 h-6 text-primary mb-2" />
                <span className="text-xs font-medium">Garantia</span>
                <span className="text-xs text-muted-foreground">12 meses</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-secondary rounded-lg">
                <Clock className="w-6 h-6 text-primary mb-2" />
                <span className="text-xs font-medium">Entrega</span>
                <span className="text-xs text-muted-foreground">3-7 dias</span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Em estoque - Pronta entrega</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="specs" className="mt-12">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="specs">Especificações</TabsTrigger>
            <TabsTrigger value="description">Descrição</TabsTrigger>
          </TabsList>
          <TabsContent value="specs" className="mt-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Especificações Técnicas</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="description" className="mt-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Descrição do Produto</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Todos os nossos produtos possuem certificado de calibração rastreável ao INMETRO, 
                garantindo a qualidade e precisão das medições. A Tecnoiso é especializada em 
                metrologia e calibração há mais de 20 anos, oferecendo soluções completas para 
                sua empresa.
              </p>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

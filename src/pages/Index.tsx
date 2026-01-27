import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, Award, Phone, ChevronRight, Gauge, Thermometer, Scale, Ruler, CircleDot, Zap, Star, Sparkles, CreditCard, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { products, categories } from "@/data/products";

const categoryIcons: Record<string, React.ElementType> = {
  Gauge,
  Thermometer,
  Scale,
  Ruler,
  CircleDot,
  Zap,
};

const Index = () => {
  const featuredProducts = products.slice(0, 8);
  const discountedProducts = products.filter((p) => p.discount).slice(0, 4);

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        <div className="container py-20 md:py-28 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <Badge className="bg-accent text-accent-foreground mb-6 px-4 py-2 text-sm font-semibold">
                <Sparkles className="w-4 h-4 mr-2" />
                Loja Oficial Tecnoiso
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Instrumentos de
                <span className="text-gradient bg-gradient-to-r from-accent to-yellow-300 bg-clip-text text-transparent"> Medição</span>
                <br />Profissionais
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg leading-relaxed">
                Equipamentos de alta precisão para indústria, laboratório e controle de qualidade. 
                Produtos com certificação e garantia de fábrica.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/produtos">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 h-14 px-8 rounded-xl font-bold text-lg shadow-glow">
                    Ver Produtos
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2 h-14 px-8 rounded-xl font-semibold">
                  <Phone className="w-5 h-5" />
                  (47) 3438-3175
                </Button>
              </div>
              
              {/* Payment methods */}
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-primary-foreground/20">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-success" />
                  <span className="text-sm">PIX 5% OFF</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-sm">12x sem juros</span>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block relative">
              <div className="relative animate-float">
                <img 
                  src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=500&fit=crop&auto=format"
                  alt="Equipamentos de medição"
                  className="rounded-3xl shadow-2xl border-4 border-white/10"
                />
                <div className="absolute -bottom-6 -left-6 bg-card text-card-foreground p-4 rounded-2xl shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="font-bold">Garantia</p>
                      <p className="text-sm text-muted-foreground">12 meses</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground p-4 rounded-2xl shadow-xl">
                  <p className="font-bold text-2xl">-20%</p>
                  <p className="text-sm">em produtos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="bg-card border-y border-border py-6">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Frete Grátis</p>
                <p className="text-xs text-muted-foreground">Acima de R$500</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="font-semibold text-sm">Garantia Total</p>
                <p className="text-xs text-muted-foreground">12 meses</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-sm">Certificação</p>
                <p className="text-xs text-muted-foreground">Rastreável RBC</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">+20 Anos</p>
                <p className="text-xs text-muted-foreground">No mercado</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Categorias</h2>
            <p className="text-muted-foreground mt-1">Navegue por departamento</p>
          </div>
          <Link to="/categorias" className="text-primary hover:underline flex items-center gap-1 font-medium">
            Ver todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const IconComponent = categoryIcons[category.icon] || Gauge;
            return (
              <Link key={category.id} to={`/produtos?categoria=${category.id}`}>
                <div className="category-card text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{category.productCount} produtos</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="container py-4">
        <div className="gradient-accent rounded-3xl p-8 md:p-12 text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white/5 rounded-full translate-y-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <Badge className="bg-white/20 text-white mb-4">Oferta Especial</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                5% de Desconto no PIX
              </h2>
              <p className="text-primary-foreground/80 max-w-md">
                Pague com PIX e economize ainda mais! Pagamento instantâneo e seguro.
              </p>
            </div>
            <Link to="/produtos">
              <Button size="lg" variant="secondary" className="gap-2 h-14 px-8 rounded-xl font-bold whitespace-nowrap">
                Aproveitar Agora
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Produtos em Destaque</h2>
            <p className="text-muted-foreground mt-1">Os mais vendidos da Tecnoiso</p>
          </div>
          <Link to="/produtos" className="text-primary hover:underline flex items-center gap-1 font-medium">
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <div key={product.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-up">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Discounted Products */}
      {discountedProducts.length > 0 && (
        <section className="bg-gradient-to-br from-accent/5 to-accent/10 py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Ofertas Imperdíveis</h2>
                  <p className="text-muted-foreground">Aproveite os melhores preços</p>
                </div>
              </div>
              <Link to="/ofertas" className="text-accent hover:underline flex items-center gap-1 font-medium">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {discountedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Por que escolher a Tecnoiso?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Há mais de 20 anos no mercado, somos referência em instrumentos de medição
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Produtos Certificados</h3>
            <p className="text-muted-foreground leading-relaxed">
              Todos os equipamentos com certificado de calibração rastreável ao INMETRO.
            </p>
          </Card>
          <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-success/20">
            <div className="w-20 h-20 bg-gradient-to-br from-success/20 to-success/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-success" />
            </div>
            <h3 className="text-xl font-bold mb-3">Garantia de Fábrica</h3>
            <p className="text-muted-foreground leading-relaxed">
              12 meses de garantia em todos os produtos com suporte técnico especializado.
            </p>
          </Card>
          <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-accent/20">
            <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Truck className="w-10 h-10 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3">Entrega para Todo Brasil</h3>
            <p className="text-muted-foreground leading-relaxed">
              Enviamos para todo o país com frete grátis em compras acima de R$500.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-hero text-primary-foreground py-20">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Precisa de ajuda para escolher?
          </h2>
          <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
            Nossa equipe técnica está pronta para ajudar você a encontrar 
            o equipamento ideal.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 h-14 px-8 rounded-xl font-bold">
              <Phone className="w-5 h-5" />
              (47) 3438-3175
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 h-14 px-8 rounded-xl font-semibold">
              Enviar WhatsApp
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Index;

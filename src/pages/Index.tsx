import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, Award, Phone, ChevronRight, Gauge, Thermometer, Scale, Ruler, Settings2, Wrench, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { products, categories } from "@/data/products";

const categoryIcons: Record<string, React.ElementType> = {
  Gauge,
  Thermometer,
  Scale,
  Ruler,
  Settings2,
  Wrench,
};

const Index = () => {
  const featuredProducts = products.slice(0, 8);
  const discountedProducts = products.filter((p) => p.discount).slice(0, 4);

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-foreground via-foreground to-primary/90 text-background">
        <div className="container py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="animate-fade-in">
              <span className="inline-block bg-primary/20 text-primary-foreground px-4 py-1 rounded-full text-sm font-medium mb-4">
                Metrologia de Precisão
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Equipamentos de
                <span className="text-primary"> Calibração</span>
                <br />de Alta Qualidade
              </h1>
              <p className="text-lg text-background/70 mb-8 max-w-lg">
                Instrumentos de medição e calibração com certificação RBC/INMETRO. 
                Qualidade garantida para sua indústria.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/produtos">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 px-8">
                    Ver Produtos
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-background/30 text-background hover:bg-background/10 gap-2 h-12 px-8">
                  <Phone className="w-5 h-5" />
                  Fale Conosco
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=500&fit=crop"
                alt="Equipamentos de calibração"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="bg-primary text-primary-foreground py-4">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Truck className="w-5 h-5" />
              <span>Frete Grátis +R$500</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Garantia 12 Meses</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Award className="w-5 h-5" />
              <span>Certificação RBC</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Star className="w-5 h-5" />
              <span>+20 Anos Experiência</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Categorias</h2>
            <p className="text-muted-foreground mt-1">Encontre o que você precisa</p>
          </div>
          <Link to="/produtos" className="text-primary hover:underline flex items-center gap-1">
            Ver todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const IconComponent = categoryIcons[category.icon] || Gauge;
            return (
              <Link key={category.id} to={`/produtos?categoria=${category.id}`}>
                <Card className="category-card text-center group">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.productCount} produtos</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-16 bg-secondary/50 -mx-4 px-4 md:mx-0 md:px-0 md:rounded-2xl">
        <div className="md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Produtos em Destaque</h2>
              <p className="text-muted-foreground mt-1">Os mais vendidos da Tecnoiso</p>
            </div>
            <Link to="/produtos" className="text-primary hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="container py-16">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              5% de Desconto no PIX
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-6">
              Pague suas compras com PIX e economize! Pagamento instantâneo, 
              seguro e com desconto exclusivo.
            </p>
            <Link to="/produtos">
              <Button size="lg" variant="secondary" className="gap-2">
                Aproveitar Agora
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Discounted Products */}
      {discountedProducts.length > 0 && (
        <section className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-primary">🔥 Ofertas</h2>
              <p className="text-muted-foreground mt-1">Aproveite os melhores preços</p>
            </div>
            <Link to="/produtos?ofertas=true" className="text-primary hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {discountedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Por que escolher a Tecnoiso?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Há mais de 20 anos no mercado, somos referência em calibração e metrologia industrial
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Certificação RBC</h3>
            <p className="text-muted-foreground">
              Todos os nossos serviços possuem rastreabilidade ao INMETRO, 
              garantindo qualidade e precisão.
            </p>
          </Card>
          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Garantia Total</h3>
            <p className="text-muted-foreground">
              Oferecemos garantia em todos os produtos e serviços, 
              com suporte técnico especializado.
            </p>
          </Card>
          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Entrega Rápida</h3>
            <p className="text-muted-foreground">
              Enviamos para todo o Brasil com frete grátis 
              em compras acima de R$500.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-foreground text-background py-16">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Precisa de ajuda para escolher?
          </h2>
          <p className="text-background/70 mb-8 max-w-xl mx-auto">
            Nossa equipe técnica está pronta para ajudar você a encontrar 
            o equipamento ideal para sua necessidade.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
              <Phone className="w-5 h-5" />
              (47) 3438-3175
            </Button>
            <Button size="lg" variant="outline" className="border-background/30 text-background hover:bg-background/10">
              Enviar Mensagem
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Index;

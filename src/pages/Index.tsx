import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroCarousel from '@/components/HeroCarousel';
import FeatureCards from '@/components/FeatureCards';
import ProductCarousel from '@/components/ProductCarousel';
import { ProductCard } from '@/components/ProductCard';
import { products, categories } from '@/data/products';
import { Link } from 'react-router-dom';
import { ChevronRight, Gauge, Thermometer, Scale, Ruler, CircleDot, Zap } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-muted">
      <Header />

      <main>
        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Feature Cards - ML Style */}
        <FeatureCards />

        {/* Product Carousel - Ofertas */}
        <ProductCarousel />

        {/* Oferta do Dia */}
        <section className="container py-8">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Oferta do dia</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.slice(0, 4).map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group">
                  <div className="bg-muted rounded-lg p-4 group-hover:shadow-md transition-shadow">
                    <div className="aspect-square mb-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-sm text-foreground line-clamp-2 mb-2">{product.name}</p>
                    <p className="text-lg font-semibold text-foreground">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="container py-8">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Categorias</h2>
              <Link to="/" className="text-sm text-[#3483fa] hover:underline flex items-center">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {categories.map((category) => {
                const IconComponent = categoryIcons[category.icon] || Gauge;
                return (
                  <Link key={category.id} to={`/produtos?categoria=${category.id}`}>
                    <div className="text-center group cursor-pointer">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-[#ffe600]/30 transition-colors">
                        <IconComponent className="w-7 h-7 text-foreground" />
                      </div>
                      <p className="text-sm text-foreground">{category.name}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* All Products Grid */}
        <section className="container py-8">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Produtos em Destaque</h2>
              <Link to="/" className="text-sm text-[#3483fa] hover:underline flex items-center">
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-foreground">
          <div className="container py-12">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-2">Cadastre-se e receba ofertas exclusivas</h2>
              <p className="text-white/70 mb-6">Fique por dentro das melhores promoções da Tecnoiso</p>
              <div className="flex max-w-md mx-auto gap-2">
                <input
                  type="email"
                  placeholder="Digite seu e-mail"
                  className="flex-1 px-4 py-3 rounded text-foreground"
                />
                <button className="bg-[#ffe600] text-foreground px-6 py-3 rounded font-semibold hover:bg-[#ffe600]/90 transition-colors">
                  Cadastrar
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

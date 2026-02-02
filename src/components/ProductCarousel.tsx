import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { products } from '@/data/products';
import { useProducts } from '@/hooks/useProducts';

const ProductCarousel = () => {
  const { products: dbProducts } = useProducts();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const catalog = dbProducts.length > 0 ? dbProducts : products;
  const displayProducts = catalog.slice(0, 8);

  return (
    <section className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">Ofertas do Dia</h2>
        </div>
        <Link to="/" className="text-sm text-accent font-medium hover:underline">
          Ver todas as ofertas →
        </Link>
      </div>

      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-4">
            {displayProducts.map((product) => {
              const discountPercent = product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  className="flex-[0_0_200px] md:flex-[0_0_220px] min-w-0"
                >
                  <Link to={`/produto/${product.id}`}>
                    <div className="bg-background border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all group">
                      <div className="relative aspect-square bg-muted p-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                        {discountPercent > 0 && (
                          <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm text-foreground line-clamp-2 mb-3 min-h-[40px]">
                          {product.name}
                        </h3>
                        {product.originalPrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </p>
                        )}
                        <p className="text-xl font-bold text-foreground">
                          {formatPrice(product.price)}
                        </p>
                        <p className="text-xs text-accent font-medium mt-1">
                          em 12x sem juros
                        </p>
                        <p className="text-xs text-accent mt-1 font-medium">Frete grátis</p>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Arrows */}
        {canScrollPrev && (
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-background border border-border rounded-full shadow-lg flex items-center justify-center hover:bg-muted transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {canScrollNext && (
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-background border border-border rounded-full shadow-lg flex items-center justify-center hover:bg-muted transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </section>
  );
};

export default ProductCarousel;

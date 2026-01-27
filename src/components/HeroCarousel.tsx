import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { products } from '@/data/products';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const bannerSlides = [
  {
    id: 1,
    title: 'PRECISÃO',
    subtitle: 'INDUSTRIAL',
    highlight: 'ATÉ 40% OFF',
    badge: 'FRETE GRÁTIS',
    badgeDetail: 'ACIMA DE R$ 500',
    bgImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1920&h=600&fit=crop&auto=format',
  },
  {
    id: 2,
    title: 'MANÔMETROS',
    subtitle: 'DIGITAIS',
    highlight: 'LANÇAMENTO',
    badge: 'GARANTIA',
    badgeDetail: '12 MESES',
    bgImage: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=1920&h=600&fit=crop&auto=format',
  },
  {
    id: 3,
    title: 'CALIBRAÇÃO',
    subtitle: 'CERTIFICADA',
    highlight: 'RBC/INMETRO',
    badge: 'QUALIDADE',
    badgeDetail: 'GARANTIDA',
    bgImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=600&fit=crop&auto=format',
  },
];

const HeroCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  return (
    <section className="relative overflow-hidden bg-foreground">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {bannerSlides.map((slide) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0">
              <div className="relative h-[400px] md:h-[500px]">
                {/* Background Image with Overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.bgImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/40" />
                
                <div className="container h-full flex items-center relative z-10">
                  <div className="max-w-xl text-background">
                    <div className="flex gap-3 mb-4">
                      <span className="bg-accent text-accent-foreground px-3 py-1 text-xs font-bold rounded">
                        {slide.highlight}
                      </span>
                      <span className="bg-background text-foreground px-3 py-1 text-xs font-medium rounded">
                        {slide.badge} {slide.badgeDetail}
                      </span>
                    </div>
                    
                    <p className="text-lg md:text-xl font-light mb-1 text-background/80">{slide.title}</p>
                    <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">{slide.subtitle}</h2>
                    
                    <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                      Ver Ofertas
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Product images on right */}
                  <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 gap-4">
                    {products.slice(0, 3).map((product, i) => (
                      <div
                        key={product.id}
                        className="w-36 h-36 bg-background rounded-lg shadow-2xl p-3"
                        style={{ transform: `translateY(${(i - 1) * 20}px)` }}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2 rounded-full transition-all ${
              index === selectedIndex ? 'bg-accent w-8' : 'bg-background/50 w-2'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;

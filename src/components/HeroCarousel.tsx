import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { products } from '@/data/products';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Importar as imagens
import banner1 from '@/assets/banner1.jpg';
import banner2 from '@/assets/banner2.jpg'
import banner3 from '@/assets/banner3.jpg';
import banner4 from '@/assets/banner4.jpg';
import banner5 from '@/assets/banner5.jpg';

const bannerSlides = [
  {
    id: 1,
    title: 'PRECISÃO',
    subtitle: 'INDUSTRIAL',
    highlight: 'ATÉ 40% OFF',
    badge: 'FRETE GRÁTIS',
    badgeDetail: 'ACIMA DE R$ 500',
    bgImage: banner1,
  },
  {
    id: 2,
    title: 'MANÔMETROS',
    subtitle: 'DIGITAIS',
    highlight: 'LANÇAMENTO',
    badge: 'GARANTIA',
    badgeDetail: '12 MESES',
    bgImage: banner2,
  },
  {
    id: 3,
    title: 'CALIBRAÇÃO',
    subtitle: 'CERTIFICADA',
    highlight: 'RBC/INMETRO',
    badge: 'QUALIDADE',
    badgeDetail: 'GARANTIDA',
    bgImage: banner3,
  },
  {
    id: 4,
    title: 'EQUIPAMENTOS',
    subtitle: 'PROFISSIONAIS',
    highlight: 'NOVIDADE',
    badge: 'ENTREGA',
    badgeDetail: 'RÁPIDA',
    bgImage: banner4,
  },
  {
    id: 5,
    title: 'MEDIÇÃO',
    subtitle: 'PRECISA',
    highlight: 'DESTAQUE',
    badge: 'SUPORTE',
    badgeDetail: 'TÉCNICO',
    bgImage: banner5,
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
    <section className="relative overflow-hidden">
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

      {/* Degradê de transição ULTRA SUAVE - múltiplas camadas para transição imperceptível */}
      <div 
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-20"
        style={{
          height: '200px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.03) 10%, rgba(255, 255, 255, 0.08) 20%, rgba(255, 255, 255, 0.15) 30%, rgba(255, 255, 255, 0.25) 40%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.6) 65%, rgba(255, 255, 255, 0.8) 80%, rgba(255, 255, 255, 0.95) 95%, rgb(255, 255, 255) 100%)'
        }}
      />

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
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
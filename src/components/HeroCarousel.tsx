import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { products } from '@/data/products';

const bannerSlides = [
  {
    id: 1,
    title: 'FESTIVAL DE',
    subtitle: 'EQUIPAMENTOS',
    highlight: 'ATÉ 40% OFF',
    badge: 'FRETE GRÁTIS',
    badgeDetail: 'A PARTIR DE R$ 500',
    bgColor: 'from-blue-600 to-blue-800',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop&auto=format',
  },
  {
    id: 2,
    title: 'MANÔMETROS',
    subtitle: 'DIGITAIS',
    highlight: 'LANÇAMENTO',
    badge: 'GARANTIA',
    badgeDetail: '12 MESES',
    bgColor: 'from-gray-700 to-gray-900',
    image: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=600&h=400&fit=crop&auto=format',
  },
  {
    id: 3,
    title: 'CALIBRAÇÃO',
    subtitle: 'PROFISSIONAL',
    highlight: 'CERTIFICADO RBC',
    badge: 'PRECISÃO',
    badgeDetail: 'GARANTIDA',
    bgColor: 'from-emerald-600 to-emerald-800',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format',
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
              <div className={`relative h-[350px] md:h-[400px] bg-gradient-to-r ${slide.bgColor}`}>
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                
                <div className="container h-full flex items-center relative z-10">
                  <div className="max-w-xl text-white">
                    <p className="text-lg md:text-xl font-medium mb-1">{slide.title}</p>
                    <h2 className="text-4xl md:text-6xl font-black mb-4">{slide.subtitle}</h2>
                    
                    <div className="flex gap-3 mb-4">
                      <div className="bg-white text-foreground px-4 py-2 rounded font-bold text-sm md:text-base">
                        {slide.highlight}
                      </div>
                      <div className="bg-success text-white px-4 py-2 rounded text-sm md:text-base">
                        <div className="font-bold">{slide.badge}</div>
                        <div className="text-xs">{slide.badgeDetail}</div>
                      </div>
                    </div>
                  </div>

                  {/* Product images on right */}
                  <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 gap-4">
                    {products.slice(0, 3).map((product, i) => (
                      <div
                        key={product.id}
                        className="w-32 h-32 bg-white rounded-lg shadow-xl p-2 transform rotate-3"
                        style={{ transform: `rotate(${(i - 1) * 5}deg)` }}
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
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === selectedIndex ? 'bg-white w-6' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;

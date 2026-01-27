import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { products } from '@/data/products';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const bannerSlides = [
  {
    id: 1,
    title: 'MANÔMETROS',
    subtitle: 'DIGITAIS',
    highlight: 'LANÇAMENTO',
    badge: 'FRETE GRÁTIS',
    badgeDetail: 'A PARTIR DE R$ 500',
    bgColor: 'bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-100',
    textColor: 'text-gray-900',
    products: products.slice(0, 3),
  },
  {
    id: 2,
    title: 'CALIBRAÇÃO',
    subtitle: 'CERTIFICADA',
    highlight: 'NOVIDADE',
    badge: 'GARANTIA',
    badgeDetail: '12 MESES',
    bgColor: 'bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200',
    textColor: 'text-gray-900',
    products: products.slice(1, 4),
  },
  {
    id: 3,
    title: 'EQUIPAMENTOS',
    subtitle: 'PROFISSIONAIS',
    highlight: 'ATÉ 40% OFF',
    badge: 'ENTREGA',
    badgeDetail: 'RÁPIDA',
    bgColor: 'bg-gradient-to-br from-purple-400 via-purple-300 to-pink-200',
    textColor: 'text-gray-900',
    products: products.slice(0, 3),
  },
];

const HeroCarousel = () => {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 100);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const handleProductClick = (productId: string) => {
    navigate(`/produto/${productId}`);
  };

  return (
    <section className="relative overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {bannerSlides.map((slide, slideIndex) => {
            const isActive = selectedIndex === slideIndex;
            
            return (
              <div key={slide.id} className="flex-[0_0_100%] min-w-0">
                <div className={`relative ${slide.bgColor} overflow-hidden`} style={{ paddingTop: '280px', paddingBottom: '80px' }}>
                  {/* Background decorations */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className={`absolute -top-20 -right-20 w-64 h-64 md:w-96 md:h-96 rounded-full bg-white/10 transition-all duration-[2000ms] ease-out ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} style={{ transitionDelay: '200ms' }} />
                    <div className={`absolute top-1/2 -left-20 md:-left-32 w-48 h-48 md:w-80 md:h-80 rounded-full bg-white/5 transition-all duration-[2000ms] ease-out ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} style={{ transitionDelay: '400ms' }} />
                  </div>

                  <div className="container relative z-10 px-4 sm:px-6 md:px-8">
                    <div className="flex items-center justify-between">
                      {/* Content */}
                      <div className={`max-w-[300px] sm:max-w-md md:max-w-xl ${slide.textColor}`}>
                        <div className={`inline-flex items-center gap-1.5 md:gap-2 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 mb-3 md:mb-4 shadow-lg transition-all duration-700 ease-out ${isActive && !isAnimating ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-10 opacity-0 scale-90'}`} style={{ transitionDelay: '100ms' }}>
                          <div className="w-4 h-4 md:w-5 md:h-5 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                            <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          </div>
                          <span className="text-[10px] md:text-xs font-bold text-blue-600">LOJAS OFICIAIS</span>
                        </div>

                        <div className="mb-1.5 md:mb-2 overflow-hidden">
                          <h3 className={`text-base sm:text-xl md:text-2xl lg:text-3xl font-bold transform transition-all duration-700 drop-shadow-md ${isActive && !isAnimating ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`} style={{ transitionDelay: '200ms' }}>{slide.title}</h3>
                        </div>

                        <div className="mb-3 md:mb-5 overflow-hidden">
                          <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black transform transition-all duration-700 leading-none drop-shadow-lg ${isActive && !isAnimating ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`} style={{ transitionDelay: '300ms' }}>{slide.subtitle}</h2>
                        </div>

                        <div className="flex flex-wrap gap-2 md:gap-3 mb-3 md:mb-4">
                          <span className={`bg-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-sm font-bold shadow-xl transform transition-all duration-700 ${isActive && !isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`} style={{ transitionDelay: '400ms' }}>{slide.highlight}</span>
                          <span className={`bg-white text-gray-900 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-sm font-bold shadow-xl transform transition-all duration-700 ${isActive && !isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`} style={{ transitionDelay: '500ms' }}>{slide.badge} {slide.badgeDetail}</span>
                        </div>

                        <p className={`text-[9px] md:text-[10px] mb-2 opacity-80 drop-shadow-md transform transition-all duration-700 ${isActive && !isAnimating ? 'translate-y-0 opacity-80' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '600ms' }}>*Consulte Termos e Condições. Imagens ilustrativas.</p>
                      </div>

                      {/* Products - Desktop */}
                      <div className="hidden lg:flex items-center justify-end relative" style={{ width: '500px', height: '300px' }}>
                        {slide.products.map((product, idx) => {
                          const animations = [
                            {size: 'w-40 h-40 xl:w-48 xl:h-48', delay: '700ms', initialY: -100, initialX: 80, initialRotate: 25, finalY: -30, finalRotate: -5},
                            {size: 'w-48 h-48 xl:w-56 xl:h-56', delay: '850ms', initialY: 100, initialX: 100, initialRotate: -35, finalY: 20, finalRotate: 3},
                            {size: 'w-36 h-36 xl:w-44 xl:h-44', delay: '1000ms', initialY: -80, initialX: 120, initialRotate: 45, finalY: -15, finalRotate: -8}
                          ];
                          const anim = animations[idx];
                          return (
                            <div 
                              key={product.id} 
                              onClick={() => handleProductClick(product.id)} 
                              className={`absolute ${anim.size} transition-all duration-[1200ms] ease-out cursor-pointer group`} 
                              style={{
                                right: `${idx * 130 + 30}px`,
                                transitionDelay: anim.delay,
                                transform: isActive && !isAnimating 
                                  ? `translateY(${anim.finalY}px) rotate(${anim.finalRotate}deg) scale(1)` 
                                  : `translateY(${anim.initialY}px) translateX(${anim.initialX}px) rotate(${anim.initialRotate}deg) scale(0.3)`,
                                opacity: isActive && !isAnimating ? 1 : 0
                              }}
                            >
                              <div className="w-full h-full p-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="w-full h-full object-contain pointer-events-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.3)] group-hover:drop-shadow-[0_20px_45px_rgba(0,0,0,0.4)] transition-all" 
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Products - Mobile */}
                      <div className="lg:hidden absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44">
                        <div className={`w-full h-full transform transition-all duration-1000 ease-out ${isActive && !isAnimating ? 'translate-y-0 rotate-0 scale-100 opacity-100' : 'translate-y-20 rotate-45 scale-50 opacity-0'}`} style={{ transitionDelay: '500ms' }}>
                          <div onClick={() => handleProductClick(slide.products[1]?.id || slide.products[0]?.id)} className="w-full h-full p-2 sm:p-3 animate-float cursor-pointer active:scale-95 transition-all">
                            <img src={slide.products[1]?.image || slide.products[0]?.image} alt={slide.products[1]?.name || slide.products[0]?.name} className="w-full h-full object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.3)]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-20" style={{height: '140px', background: `linear-gradient(to bottom, transparent 0%, hsl(var(--background) / 0.02) 10%, hsl(var(--background) / 0.08) 20%, hsl(var(--background) / 0.18) 30%, hsl(var(--background) / 0.32) 40%, hsl(var(--background) / 0.50) 50%, hsl(var(--background) / 0.68) 60%, hsl(var(--background) / 0.82) 70%, hsl(var(--background) / 0.92) 80%, hsl(var(--background) / 0.97) 90%, hsl(var(--background) / 1) 100%)`}} />

      {/* Navigation buttons */}
      <button onClick={scrollPrev} className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all z-30 hover:scale-110 active:scale-95 backdrop-blur-sm" aria-label="Slide anterior">
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-800" />
      </button>
      <button onClick={scrollNext} className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all z-30 hover:scale-110 active:scale-95 backdrop-blur-sm" aria-label="Próximo slide">
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-800" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-30">
        {bannerSlides.map((_, index) => (
          <button 
            key={index} 
            onClick={() => scrollTo(index)} 
            className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ease-out ${index === selectedIndex ? 'bg-blue-600 w-6 md:w-10 shadow-lg shadow-blue-500/50' : 'bg-white/80 w-1.5 md:w-2 hover:bg-white hover:w-3 md:hover:w-4'}`} 
            aria-label={`Ir para slide ${index + 1}`} 
          />
        ))}
      </div>

      <style>{`
        @keyframes float { 
          0%, 100% { transform: translateY(0px) rotate(0deg); } 
          50% { transform: translateY(-12px) rotate(2deg); } 
        } 
        .animate-float { 
          animation: float 3s ease-in-out infinite; 
        }
      `}</style>
    </section>
  );
};

export default HeroCarousel;
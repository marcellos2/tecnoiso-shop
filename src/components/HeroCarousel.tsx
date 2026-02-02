import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import das imagens
import balanca1 from '@/data/balanca-1.png';
import manometro1 from '@/data/manometro-1.png';
import multimetro1 from '@/data/multimetro-1.png';
import paquimetro1 from '@/data/paquimetro-1.png';
import termoigrometro1 from '@/data/termoigrometro1.png';
import termometro1 from '@/data/termometro-1.png';
import termometrodeumidade1 from '@/data/termometrodeumidade1.png';

// Produtos para cada slide do banner
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
    products: [
      { id: '1', image: manometro1, name: 'Manômetro Digital' }, // manometro-1.png
      { id: '5', image: multimetro1, name: 'Multímetro Digital' }, // multimetro-1.png
      { id: '4', image: paquimetro1, name: 'Paquímetro Digital' }, // paquimetro-1.png
    ],
  },
  {
    id: 2,
    title: 'TERMÔMETROS',
    subtitle: 'PRECISÃO',
    highlight: 'NOVIDADE',
    badge: 'GARANTIA',
    badgeDetail: '12 MESES',
    bgColor: 'bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200',
    textColor: 'text-gray-900',
    products: [
      { id: '8', image: termoigrometro1, name: 'Termo-Higrômetro' }, // termoigrometro1.png
      { id: '2', image: termometro1, name: 'Termômetro Digital' }, // termometro-1.png
      { id: '9', image: termometrodeumidade1, name: 'Termômetro de Umidade' }, // termometrodeumidade1.png
    ],
  },
  {
    id: 3,
    title: 'INSTRUMENTOS',
    subtitle: 'PROFISSIONAIS',
    highlight: 'ATÉ 40% OFF',
    badge: 'ENTREGA',
    badgeDetail: 'RÁPIDA',
    bgColor: 'bg-gradient-to-br from-purple-400 via-purple-300 to-pink-200',
    textColor: 'text-gray-900',
    products: [
      { id: '3', image: balanca1, name: 'Balança de Precisão' }, // balanca-1.png
      { id: '4', image: paquimetro1, name: 'Paquímetro Digital' }, // paquimetro-1.png
      { id: '5', image: multimetro1, name: 'Multímetro Digital' }, // multimetro-1.png
    ],
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
                 <div className={`relative ${slide.bgColor} overflow-hidden`} style={{ paddingBottom: '120px', minHeight: '550px' }}>
                  {/* Background decorations */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className={`absolute -top-20 -right-20 w-64 h-64 md:w-96 md:h-96 rounded-full bg-white/10 transition-all duration-[2000ms] ease-out ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} style={{ transitionDelay: '200ms' }} />
                    <div className={`absolute top-1/2 -left-20 md:-left-32 w-48 h-48 md:w-80 md:h-80 rounded-full bg-white/5 transition-all duration-[2000ms] ease-out ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} style={{ transitionDelay: '400ms' }} />
                  </div>

                  <div className="container relative z-10 px-4 sm:px-6 md:px-8">
                    <div className="flex items-center justify-between gap-8">
                      {/* Content - Left Side */}
                      <div className={`max-w-[380px] sm:max-w-[480px] md:max-w-[550px] lg:max-w-[620px] ${slide.textColor}`}>
                        <div className="mb-3 md:mb-4 overflow-hidden">
                          <h3 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold transform transition-all duration-700 drop-shadow-md ${isActive && !isAnimating ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`} style={{ transitionDelay: '100ms' }}>{slide.title}</h3>
                        </div>

                        <div className="mb-5 md:mb-7 overflow-hidden">
                          <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-[65px] xl:text-[80px] font-black transform transition-all duration-700 leading-[0.95] drop-shadow-lg whitespace-nowrap ${isActive && !isAnimating ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`} style={{ transitionDelay: '200ms' }}>{slide.subtitle}</h2>
                        </div>

                        <div className="flex flex-wrap gap-3 md:gap-4 mb-4 md:mb-5">
                          <span className={`bg-blue-600 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm md:text-base font-bold shadow-xl transform transition-all duration-700 ${isActive && !isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`} style={{ transitionDelay: '300ms' }}>{slide.highlight}</span>
                          <span className={`bg-white text-gray-900 px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm md:text-base font-bold shadow-xl transform transition-all duration-700 ${isActive && !isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`} style={{ transitionDelay: '400ms' }}>{slide.badge} {slide.badgeDetail}</span>
                        </div>

                        <p className={`text-xs md:text-sm mb-2 opacity-80 drop-shadow-md transform transition-all duration-700 ${isActive && !isAnimating ? 'translate-y-0 opacity-80' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '500ms' }}>*Consulte Termos e Condições. Imagens ilustrativas.</p>
                      </div>

                      {/* Products - Right Side - Desktop */}
                      <div className="hidden lg:flex items-center justify-end relative flex-1 max-w-[650px]" style={{ height: '400px' }}>
                        {slide.products.map((product, idx) => {
                          const animations = [
                            {size: 'w-48 h-48 xl:w-56 xl:h-56', delay: '600ms', initialY: -100, initialX: 80, initialRotate: 15, finalY: -40, finalRotate: -2, right: 420},
                            {size: 'w-56 h-56 xl:w-72 xl:h-72', delay: '750ms', initialY: 80, initialX: 100, initialRotate: -25, finalY: 10, finalRotate: 3, right: 200},
                            {size: 'w-44 h-44 xl:w-52 xl:h-52', delay: '900ms', initialY: -80, initialX: 120, initialRotate: 35, finalY: -30, finalRotate: -5, right: 10}
                          ];
                          const anim = animations[idx];
                          return (
                            <div 
                              key={product.id} 
                              onClick={() => handleProductClick(product.id)} 
                              className={`absolute ${anim.size} transition-all duration-[1200ms] ease-out cursor-pointer group`} 
                              style={{
                                right: `${anim.right}px`,
                                top: '50%',
                                transform: isActive && !isAnimating 
                                  ? `translateY(calc(-50% + ${anim.finalY}px)) rotate(${anim.finalRotate}deg) scale(1)` 
                                  : `translateY(calc(-50% + ${anim.initialY}px)) translateX(${anim.initialX}px) rotate(${anim.initialRotate}deg) scale(0.3)`,
                                opacity: isActive && !isAnimating ? 1 : 0,
                                transitionDelay: anim.delay
                              }}
                              title={product.name}
                            >
                              <div className="w-full h-full p-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-active:scale-105">
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="w-full h-full object-contain select-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)] group-hover:drop-shadow-[0_25px_50px_rgba(0,0,0,0.35)] transition-all" 
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Products - Mobile */}
                      <div className="lg:hidden absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52">
                        <div className={`w-full h-full transform transition-all duration-1000 ease-out ${isActive && !isAnimating ? 'translate-y-0 rotate-0 scale-100 opacity-100' : 'translate-y-20 rotate-45 scale-50 opacity-0'}`} style={{ transitionDelay: '500ms' }}>
                          <div onClick={() => handleProductClick(slide.products[1]?.id || slide.products[0]?.id)} className="w-full h-full p-3 sm:p-4 animate-float cursor-pointer active:scale-95 transition-all">
                            <img src={slide.products[1]?.image || slide.products[0]?.image} alt={slide.products[1]?.name || slide.products[0]?.name} className="w-full h-full object-contain select-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)]" />
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
      <button onClick={scrollPrev} className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all z-30 hover:scale-110 active:scale-95 backdrop-blur-sm" aria-label="Slide anterior">
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 text-gray-800" />
      </button>
      <button onClick={scrollNext} className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all z-30 hover:scale-110 active:scale-95 backdrop-blur-sm" aria-label="Próximo slide">
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 text-gray-800" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 md:gap-2.5 z-30">
        {bannerSlides.map((_, index) => (
          <button 
            key={index} 
            onClick={() => scrollTo(index)} 
            className={`h-2 md:h-2.5 rounded-full transition-all duration-500 ease-out ${index === selectedIndex ? 'bg-blue-600 w-8 md:w-12 shadow-lg shadow-blue-500/50' : 'bg-white/80 w-2 md:w-2.5 hover:bg-white hover:w-4 md:hover:w-5'}`} 
            aria-label={`Ir para slide ${index + 1}`} 
          />
        ))}
      </div>

      <style>{`
        @keyframes float { 
          0%, 100% { transform: translateY(0px) rotate(0deg); } 
          50% { transform: translateY(-15px) rotate(3deg); } 
        } 
        .animate-float { 
          animation: float 3.5s ease-in-out infinite; 
        }
      `}</style>
    </section>
  );
};

export default HeroCarousel;
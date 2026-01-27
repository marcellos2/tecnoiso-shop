import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { products } from '@/data/products';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// Importar as imagens dos banners
import banner1 from '@/assets/banner1.jpg';
import banner2 from '@/assets/banner2.jpg';
import banner3 from '@/assets/banner3.jpg';
import banner4 from '@/assets/banner4.jpg';
import banner5 from '@/assets/banner5.jpg';

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
    // Configurações únicas de animação para cada produto deste slide
    productAnimations: [
      {
        size: 'w-48 h-48',
        delay: '700ms',
        initialTransform: 'translate-x-32 -translate-y-10 rotate-45 scale-50',
        finalTransform: 'translate-y-[-40px]',
        hover: 'hover:scale-125 hover:rotate-12',
      },
      {
        size: 'w-56 h-56',
        delay: '850ms',
        initialTransform: 'translate-x-40 translate-y-20 -rotate-12 scale-75',
        finalTransform: 'translate-y-[20px]',
        hover: 'hover:scale-110 hover:-rotate-6',
      },
      {
        size: 'w-44 h-44',
        delay: '1000ms',
        initialTransform: 'translate-x-24 -translate-y-32 rotate-90 scale-0',
        finalTransform: 'translate-y-[-20px]',
        hover: 'hover:scale-130 hover:rotate-[-8deg]',
      },
    ],
  },
  {
    id: 2,
    title: 'CALIBRAÇÃO',
    subtitle: 'CERTIFICADA',
    highlight: 'NOVIDADE',
    badge: 'GARANTIA',
    badgeDetail: '12 MESES',
    bgColor: 'bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200',
    textColor: 'text-white',
    products: products.slice(1, 4),
    productAnimations: [
      {
        size: 'w-52 h-52',
        delay: '650ms',
        initialTransform: 'translate-x-[-40px] translate-y-40 -rotate-45 scale-90',
        finalTransform: 'translate-y-[30px]',
        hover: 'hover:scale-115 hover:rotate-3',
      },
      {
        size: 'w-40 h-40',
        delay: '800ms',
        initialTransform: 'translate-x-48 -translate-y-24 rotate-180 scale-0',
        finalTransform: 'translate-y-[-60px]',
        hover: 'hover:scale-140 hover:-rotate-12',
      },
      {
        size: 'w-60 h-60',
        delay: '950ms',
        initialTransform: 'translate-x-36 translate-y-16 rotate-[-30deg] scale-60',
        finalTransform: 'translate-y-[10px]',
        hover: 'hover:scale-105 hover:rotate-6',
      },
    ],
  },
  {
    id: 3,
    title: 'EQUIPAMENTOS',
    subtitle: 'PROFISSIONAIS',
    highlight: 'ATÉ 40% OFF',
    badge: 'ENTREGA',
    badgeDetail: 'RÁPIDA',
    bgColor: 'bg-gradient-to-br from-purple-400 via-purple-300 to-pink-200',
    textColor: 'text-white',
    products: products.slice(0, 3),
    productAnimations: [
      {
        size: 'w-36 h-36',
        delay: '720ms',
        initialTransform: 'translate-x-20 translate-y-[-50px] rotate-[135deg] scale-40',
        finalTransform: 'translate-y-[-50px]',
        hover: 'hover:scale-150 hover:rotate-[-15deg]',
      },
      {
        size: 'w-64 h-64',
        delay: '900ms',
        initialTransform: 'translate-x-44 translate-y-32 -rotate-90 scale-80',
        finalTransform: 'translate-y-[0px]',
        hover: 'hover:scale-108 hover:rotate-9',
      },
      {
        size: 'w-48 h-48',
        delay: '780ms',
        initialTransform: 'translate-x-28 -translate-y-40 rotate-[60deg] scale-55',
        finalTransform: 'translate-y-[40px]',
        hover: 'hover:scale-120 hover:rotate-[-20deg]',
      },
    ],
  },
];

const HeroCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
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

  return (
    <section className="relative overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {bannerSlides.map((slide, slideIndex) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0">
              <div className={`relative h-[400px] md:h-[500px] ${slide.bgColor}`}>
                <div className="container h-full flex items-center justify-between relative z-10">
                  {/* Lado Esquerdo - Texto Animado */}
                  <div className={`max-w-xl ${slide.textColor}`}>
                    {/* Badge Lojas Oficiais - Animado */}
                    <div
                      className={`inline-flex items-center gap-2 bg-white rounded-lg px-3 py-2 mb-4 shadow-lg transition-all duration-700 ${
                        selectedIndex === slideIndex && !isAnimating
                          ? 'translate-y-0 opacity-100'
                          : '-translate-y-10 opacity-0'
                      }`}
                      style={{ transitionDelay: '100ms' }}
                    >
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-blue-600">LOJAS OFICIAIS</span>
                    </div>

                    {/* Título - Animado */}
                    <div className="mb-2 overflow-hidden">
                      <h3
                        className={`text-2xl md:text-3xl font-bold transition-all duration-700 ${
                          selectedIndex === slideIndex && !isAnimating
                            ? 'translate-x-0 opacity-100'
                            : '-translate-x-10 opacity-0'
                        }`}
                        style={{ transitionDelay: '200ms' }}
                      >
                        {slide.title}
                      </h3>
                    </div>

                    {/* Subtítulo - Animado */}
                    <div className="mb-6 overflow-hidden">
                      <h2
                        className={`text-5xl md:text-7xl font-black transition-all duration-700 ${
                          selectedIndex === slideIndex && !isAnimating
                            ? 'translate-x-0 opacity-100'
                            : '-translate-x-10 opacity-0'
                        }`}
                        style={{ transitionDelay: '300ms' }}
                      >
                        {slide.subtitle}
                      </h2>
                    </div>

                    {/* Badges de Oferta - Animados */}
                    <div className="flex gap-3 mb-6">
                      <span
                        className={`bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all duration-700 ${
                          selectedIndex === slideIndex && !isAnimating
                            ? 'translate-y-0 opacity-100 scale-100'
                            : 'translate-y-10 opacity-0 scale-95'
                        }`}
                        style={{ transitionDelay: '400ms' }}
                      >
                        {slide.highlight}
                      </span>
                      <span
                        className={`bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-semibold shadow-lg transition-all duration-700 ${
                          selectedIndex === slideIndex && !isAnimating
                            ? 'translate-y-0 opacity-100 scale-100'
                            : 'translate-y-10 opacity-0 scale-95'
                        }`}
                        style={{ transitionDelay: '500ms' }}
                      >
                        {slide.badge} {slide.badgeDetail}
                      </span>
                    </div>

                    {/* Disclaimer - Animado */}
                    <p
                      className={`text-xs mb-6 opacity-80 transition-all duration-700 ${
                        selectedIndex === slideIndex && !isAnimating
                          ? 'translate-y-0 opacity-80'
                          : 'translate-y-10 opacity-0'
                      }`}
                      style={{ transitionDelay: '600ms' }}
                    >
                      *Consulte Termos e Condições. Imagens ilustrativas.
                    </p>
                  </div>

                  {/* Lado Direito - Produtos com Animações ÚNICAS */}
                  <div className="hidden lg:flex items-center justify-end gap-4 relative w-[600px] h-full">
                    {slide.products.map((product, idx) => {
                      const animation = slide.productAnimations[idx];
                      return (
                        <div
                          key={product.id}
                          className={`absolute transition-all duration-[1200ms] ease-out ${animation.size} ${animation.hover} ${
                            selectedIndex === slideIndex && !isAnimating
                              ? `translate-x-0 opacity-100 scale-100 rotate-0`
                              : `opacity-0 ${animation.initialTransform}`
                          }`}
                          style={{
                            transitionDelay: animation.delay,
                            right: `${idx * 150 + 20}px`,
                            transform: selectedIndex === slideIndex && !isAnimating
                              ? animation.finalTransform
                              : undefined,
                          }}
                        >
                          <div className="w-full h-full bg-white rounded-2xl shadow-2xl p-4 transition-transform duration-300">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Degradê de transição ULTRA SUAVE */}
      <div 
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-20"
        style={{
          height: '250px',
          background: `
            linear-gradient(
              to bottom,
              transparent 0%,
              hsl(var(--background) / 0.01) 5%,
              hsl(var(--background) / 0.02) 10%,
              hsl(var(--background) / 0.04) 15%,
              hsl(var(--background) / 0.07) 20%,
              hsl(var(--background) / 0.11) 25%,
              hsl(var(--background) / 0.16) 30%,
              hsl(var(--background) / 0.22) 35%,
              hsl(var(--background) / 0.29) 40%,
              hsl(var(--background) / 0.37) 45%,
              hsl(var(--background) / 0.46) 50%,
              hsl(var(--background) / 0.55) 55%,
              hsl(var(--background) / 0.64) 60%,
              hsl(var(--background) / 0.73) 65%,
              hsl(var(--background) / 0.81) 70%,
              hsl(var(--background) / 0.88) 75%,
              hsl(var(--background) / 0.93) 80%,
              hsl(var(--background) / 0.96) 85%,
              hsl(var(--background) / 0.98) 90%,
              hsl(var(--background) / 0.99) 95%,
              hsl(var(--background) / 1) 100%
            )
          `,
          backdropFilter: 'blur(0.5px)'
        }}
      />

      {/* Botões de Navegação */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-30 hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6 text-gray-800" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-30 hover:scale-110"
      >
        <ChevronRight className="w-6 h-6 text-gray-800" />
      </button>

      {/* Dots Indicadores */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? 'bg-blue-600 w-8 shadow-lg'
                : 'bg-white/70 w-2 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
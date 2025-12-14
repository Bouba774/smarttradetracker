import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Screenshot {
  src: string;
  altFr: string;
  altEn: string;
  titleFr: string;
  titleEn: string;
}

interface ScreenshotCarouselProps {
  screenshots: Screenshot[];
  language: 'fr' | 'en';
}

const ScreenshotCarousel: React.FC<ScreenshotCarouselProps> = ({ screenshots, language }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center',
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-scroll
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <div className="relative w-full">
      {/* Carousel container */}
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {screenshots.map((screenshot, index) => (
            <div 
              key={index} 
              className="flex-[0_0_85%] min-w-0 pl-3 first:pl-0"
            >
              <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-xl">
                <img
                  src={screenshot.src}
                  alt={language === 'fr' ? screenshot.altFr : screenshot.altEn}
                  className="w-full h-64 sm:h-80 object-cover object-top"
                  loading="lazy"
                  decoding="async"
                />
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 via-background/60 to-transparent p-4">
                  <p className="text-sm font-medium text-foreground">
                    {language === 'fr' ? screenshot.titleFr : screenshot.titleEn}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-background transition-colors z-10"
        aria-label={language === 'fr' ? 'Précédent' : 'Previous'}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-background transition-colors z-10"
        aria-label={language === 'fr' ? 'Suivant' : 'Next'}
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {screenshots.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex 
                ? 'bg-primary w-6' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={`${language === 'fr' ? 'Aller à l\'image' : 'Go to image'} ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ScreenshotCarousel;

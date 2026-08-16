'use client';

import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Collection } from '@/lib/api';

interface Props {
  categories: Collection[];
}

export default function FeaturedCategories({ categories }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: true }, [
    Autoplay({ delay: 3000, stopOnInteraction: false }),
  ]);

  const scrollPrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div className="relative mt-6 group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4 sm:-ml-6 py-4">
          {categories.map((category) => (
            <div key={category._id} className="relative min-w-0 flex-[0_0_35%] sm:flex-[0_0_25%] md:flex-[0_0_18%] lg:flex-[0_0_12%] pl-4 sm:pl-6">
              <Link href={`/collections/${category.slug}`} className="block text-center group/item">
                <div className="relative aspect-square mb-4 overflow-hidden rounded-[8px] bg-zinc-100 flex items-center justify-center transition-all duration-300 group-hover/item:shadow-lg">
                  {category.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover/item:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-zinc-400 text-sm">No Image</span>
                  )}
                </div>
                <h3 className="font-semibold text-zinc-900 group-hover/item:text-[var(--primary)] transition-colors line-clamp-1">{category.name}</h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 top-[40%] -translate-y-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-900 shadow-md transition hover:text-[var(--primary)] opacity-0 group-hover:opacity-100 z-10 hidden sm:flex border border-zinc-100"
        aria-label="Previous categories"
      >
        <FiChevronLeft size={24} />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-0 top-[40%] -translate-y-1/2 translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-900 shadow-md transition hover:text-[var(--primary)] opacity-0 group-hover:opacity-100 z-10 hidden sm:flex border border-zinc-100"
        aria-label="Next categories"
      >
        <FiChevronRight size={24} />
      </button>
    </div>
  );
}

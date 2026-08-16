'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/api';

interface Props {
  products: Product[];
}

export default function TopSellingProducts({ products }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);

  const scrollPrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="mx-auto mt-16 w-full max-w-[1650px] px-4 sm:px-6 lg:px-8">
      <h2 className="text-center text-2xl font-bold text-zinc-900">Top Selling Products</h2>

      <div className="relative mt-8 group">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4 sm:-ml-6 py-2">
            {products.map((product) => (
              <div
                key={product._id}
                className="min-w-0 flex-[0_0_50%] pl-4 sm:flex-[0_0_33.333%] sm:pl-6 lg:flex-[0_0_25%]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {products.length > 4 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-0 top-[35%] -translate-y-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 transition hover:text-[var(--primary)] opacity-0 group-hover:opacity-100 z-10 hidden sm:flex"
              aria-label="Previous products"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-0 top-[35%] -translate-y-1/2 translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 transition hover:text-[var(--primary)] opacity-0 group-hover:opacity-100 z-10 hidden sm:flex"
              aria-label="Next products"
            >
              <FiChevronRight size={24} />
            </button>
          </>
        )}
      </div>
    </section>
  );
}

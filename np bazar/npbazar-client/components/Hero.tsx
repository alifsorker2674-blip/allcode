'use client';

import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { Banner } from '@/lib/api';

interface HeroProps {
  sliderBanners: Banner[];
  sideBanner: Banner | null;
}

// Wraps banner content in a <Link> only when the admin set a click-through URL.
function BannerLink({ banner, children }: { banner: Banner; children: React.ReactNode }) {
  if (!banner.link) return <>{children}</>;
  return (
    <Link href={banner.link} className="block h-full w-full">
      {children}
    </Link>
  );
}

export default function Hero({ sliderBanners, sideBanner }: HeroProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

  const scrollPrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  if (sliderBanners.length === 0) return null;

  return (
    <section className="w-full">
      <div className="mx-auto max-w-[1650px] px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">

          {/* Left Column - Slider */}
          <div className="relative w-full lg:w-[68%] shrink-0 overflow-hidden rounded-[8px]">
            <div className="overflow-hidden h-full" ref={emblaRef}>
              <div className="flex h-full">
                {sliderBanners.map((banner, i) => (
                  <div key={banner._id} className="relative min-w-0 flex-[0_0_100%] h-[300px] sm:h-[400px] lg:h-[485px]">
                    <BannerLink banner={banner}>
                      <picture>
                        {banner.mobileImage && (
                          <source media="(max-width: 639px)" srcSet={banner.mobileImage} />
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={banner.image}
                          alt={banner.title || 'Promotional banner'}
                          className="h-full w-full object-cover"
                          loading={i === 0 ? 'eager' : 'lazy'}
                        />
                      </picture>
                    </BannerLink>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Navigation Arrows */}
            {sliderBanners.length > 1 && (
              <>
                <button
                  onClick={scrollPrev}
                  className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-white/90 text-zinc-900 transition hover:text-[var(--primary)] rounded-[8px] hover:bg-white"
                  aria-label="Previous slide"
                >
                  <FiChevronLeft size={24} />
                </button>
                <button
                  onClick={scrollNext}
                  className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-white/90 text-zinc-900 transition hover:text-[var(--primary)] rounded-[8px] hover:bg-white"
                  aria-label="Next slide"
                >
                  <FiChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Right Column - Side Advertisement */}
          {sideBanner && (
            <div className="relative hidden w-full lg:block lg:w-[32%] overflow-hidden rounded-[8px] h-[300px] sm:h-[400px] lg:h-[485px]">
              <BannerLink banner={sideBanner}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sideBanner.image}
                  alt={sideBanner.title || 'Promotional banner'}
                  className="h-full w-full object-cover"
                />
              </BannerLink>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

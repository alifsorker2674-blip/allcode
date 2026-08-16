'use client';

import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Props {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: Props) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-[8px] bg-zinc-50 text-sm text-zinc-400">
        No Image
      </div>
    );
  }

  const prev = () => setActive((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActive((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {images.length > 1 && (
        <div className="flex flex-row lg:flex-col shrink-0 gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 max-w-full">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-[8px] border-2 bg-zinc-50 transition ${
                i === active ? 'border-[var(--primary)]' : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`${name} ${i + 1}`} className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-square w-full lg:flex-1 overflow-hidden rounded-[8px] bg-zinc-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[active]} alt={name} className="h-full w-full object-contain" />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-[8px] bg-white/90 text-zinc-700 transition hover:text-[var(--primary)]"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-[8px] bg-white/90 text-zinc-700 transition hover:text-[var(--primary)]"
            >
              <FiChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

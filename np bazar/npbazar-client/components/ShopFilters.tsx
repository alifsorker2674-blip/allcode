'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FiSliders, FiChevronDown, FiX, FiGrid, FiTag, FiBarChart2 } from 'react-icons/fi';
import PriceRangeSlider from '@/components/PriceRangeSlider';
import type { Collection, Brand } from '@/lib/api';

interface Props {
  collections: Collection[];
  brands: Brand[];
  /** Upper bound for the price slider (highest product price, rounded up). */
  priceCap: number;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
];

const FILTER_KEYS = ['collection', 'brand', 'sort', 'minPrice', 'maxPrice'];

const selectCls =
  'w-full appearance-none rounded-[8px] border border-zinc-200 bg-white py-2.5 pl-3 pr-9 text-sm text-zinc-700 outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10';
const sectionCls = 'border-t border-zinc-100 pt-5 first:border-t-0 first:pt-0';
const labelCls = 'mb-2.5 flex items-center gap-2 text-sm font-semibold text-zinc-800';

export default function ShopFilters({ collections, brands, priceCap }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  const commitPriceRange = (min: number, max: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (min > 0) params.set('minPrice', String(min));
    else params.delete('minPrice');
    if (max < priceCap) params.set('maxPrice', String(max));
    else params.delete('maxPrice');
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    FILTER_KEYS.forEach((k) => params.delete(k));
    router.push(`${pathname}?${params.toString()}`);
  };

  const activeChips = [
    searchParams.get('collection') && {
      key: 'collection',
      label: collections.find((c) => c.slug === searchParams.get('collection'))?.name || searchParams.get('collection')!,
    },
    searchParams.get('brand') && {
      key: 'brand',
      label: brands.find((b) => b.slug === searchParams.get('brand'))?.name || searchParams.get('brand')!,
    },
    searchParams.get('sort') && {
      key: 'sort',
      label: SORT_OPTIONS.find((s) => s.value === searchParams.get('sort'))?.label || searchParams.get('sort')!,
    },
    searchParams.get('minPrice') && { key: 'minPrice', label: `Min ৳${searchParams.get('minPrice')}` },
    searchParams.get('maxPrice') && { key: 'maxPrice', label: `Max ৳${searchParams.get('maxPrice')}` },
  ].filter((c): c is { key: string; label: string } => !!c);

  const filterContent = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-zinc-900">
          <FiSliders size={16} className="text-[var(--primary)]" /> Filters
        </h2>
        {activeChips.length > 0 && (
          <button type="button" onClick={clearAll} className="text-sm font-medium text-[var(--primary)] hover:underline">
            Clear All
          </button>
        )}
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-zinc-100 pb-5">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => update(chip.key, '')}
              className="flex items-center gap-1.5 rounded-[8px] bg-[var(--primary)]/10 px-2.5 py-1.5 text-sm font-medium text-[var(--primary)] transition hover:bg-[var(--primary)]/15"
            >
              {chip.label}
              <FiX size={13} />
            </button>
          ))}
        </div>
      )}

      <div className={sectionCls}>
        <label className={labelCls}>
          <FiGrid size={14} className="text-zinc-400" /> Category
        </label>
        <div className="relative">
          <select value={searchParams.get('collection') || ''} onChange={(e) => update('collection', e.target.value)} className={selectCls}>
            <option value="">All Categories</option>
            {collections.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        </div>
      </div>

      <div className={sectionCls}>
        <label className={labelCls}>
          <FiTag size={14} className="text-zinc-400" /> Brand
        </label>
        <div className="relative">
          <select value={searchParams.get('brand') || ''} onChange={(e) => update('brand', e.target.value)} className={selectCls}>
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b._id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
          <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        </div>
      </div>

      <div className={sectionCls}>
        <label className={labelCls}>
          <FiBarChart2 size={14} className="text-zinc-400" /> Sort By
        </label>
        <div className="relative">
          <select value={searchParams.get('sort') || ''} onChange={(e) => update('sort', e.target.value)} className={selectCls}>
            <option value="">Default</option>
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        </div>
      </div>

      <div className={sectionCls}>
        <label className={labelCls}>৳ Price Range</label>
        <PriceRangeSlider
          max={priceCap}
          valueMin={Number(searchParams.get('minPrice')) || 0}
          valueMax={Number(searchParams.get('maxPrice')) || priceCap}
          onCommit={commitPriceRange}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger Button */}
      <div className="lg:hidden sticky top-[64px] z-30 py-2 mb-6">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-white border border-zinc-200 px-4 py-3 text-sm font-bold text-zinc-800 shadow-sm transition active:bg-zinc-50"
        >
          <FiSliders size={18} /> Show Filters {activeChips.length > 0 && `(${activeChips.length})`}
        </button>
      </div>

      {/* Desktop Inline Filters */}
      <div className="hidden lg:block">
        {filterContent}
      </div>

      {/* Mobile Drawer */}
      <div 
        className={`fixed inset-0 z-[100] flex lg:hidden transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
        
        {/* Drawer Content */}
        <div 
          className={`absolute right-0 h-full w-[85%] max-w-sm bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <h2 className="text-lg font-bold text-zinc-900">Filters</h2>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            >
              <FiX size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5">
            {filterContent}
          </div>
          
          <div className="border-t border-zinc-100 p-5 bg-zinc-50">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full rounded-[8px] bg-[var(--btn-color)] px-4 py-3 text-sm font-bold text-white transition hover:brightness-90"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Fuse from 'fuse.js';
import { FiSearch } from 'react-icons/fi';
import { fetchProducts, type Product } from '@/lib/api';

export default function SearchBar() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Load the catalog once so suggestions can be fuzzy-matched entirely client-side.
  useEffect(() => {
    fetchProducts({ limit: 60 }).then((r) => setProducts(r.products));
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const fuse = useMemo(
    () => new Fuse(products, { keys: ['name'], threshold: 0.35, ignoreLocation: true }),
    [products]
  );

  const results = query.trim() ? fuse.search(query.trim()).slice(0, 6).map((r) => r.item) : [];

  const submit = () => {
    const q = query.trim();
    setOpen(false);
    router.push(q ? `/shop?search=${encodeURIComponent(q)}` : '/shop');
  };

  return (
    <div ref={containerRef} className="relative flex w-full items-center">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') setOpen(false);
        }}
        placeholder="Search in..."
        className="w-full rounded-md bg-zinc-100/80 px-4 py-3 pl-4 pr-12 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-500 focus:bg-white focus:ring-1 focus:ring-zinc-300"
      />
      <button
        type="button"
        onClick={submit}
        aria-label="Search"
        className="absolute right-0 flex h-full items-center justify-center px-4 text-zinc-600 hover:text-[var(--primary)]"
      >
        <FiSearch size={20} />
      </button>

      {open && query.trim() && (
        <div className="absolute left-0 top-full z-[60] mt-2 w-full overflow-hidden rounded-[8px] border border-zinc-200 bg-white">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-zinc-400">No products match &quot;{query.trim()}&quot;</p>
          ) : (
            <>
              {results.map((product) => (
                <Link
                  key={product._id}
                  href={`/products/${product.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-zinc-50"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[8px] bg-zinc-50">
                    {product.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.thumbnail} alt={product.name} className="h-full w-full object-contain" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">{product.name}</p>
                    <p className="text-sm text-[var(--primary)]">৳{product.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
              <button
                type="button"
                onClick={submit}
                className="block w-full border-t border-zinc-100 px-4 py-2.5 text-left text-sm font-medium text-[var(--primary)] transition hover:bg-zinc-50"
              >
                View all results for &quot;{query.trim()}&quot;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

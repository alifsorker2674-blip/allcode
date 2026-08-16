'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from './ProductCard';
import { Product, FetchProductsParams, API_BASE_URL } from '@/lib/api';
import { FiLoader } from 'react-icons/fi';

interface Props {
  initialProducts: Product[];
  initialPages: number;
  queryParams: FetchProductsParams;
}

export default function InfiniteProductGrid({ initialProducts, initialPages, queryParams }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPages > 1);

  const loaderRef = useRef<HTMLDivElement>(null);

  // If queryParams change (e.g. user changes filters on the Shop page), we must reset!
  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    setHasMore(initialPages > 1);
  }, [initialProducts, initialPages]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const nextPage = page + 1;
      const qs = new URLSearchParams();
      if (queryParams.search) qs.set('search', queryParams.search);
      if (queryParams.collection) qs.set('collection', queryParams.collection);
      if (queryParams.brand) qs.set('brand', queryParams.brand);
      if (queryParams.sort) qs.set('sort', queryParams.sort);
      if (queryParams.featured) qs.set('featured', 'true');
      if (queryParams.bestSelling) qs.set('bestSelling', 'true');
      if (queryParams.minPrice) qs.set('minPrice', String(queryParams.minPrice));
      if (queryParams.maxPrice) qs.set('maxPrice', String(queryParams.maxPrice));
      if (queryParams.limit) qs.set('limit', String(queryParams.limit));
      qs.set('page', String(nextPage));

      const res = await fetch(`${API_BASE_URL}/products?${qs.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      setProducts((prev) => {
        // Prevent duplicates in case of strict mode double fetch
        const newItems = data.products.filter((p: Product) => !prev.some(existing => existing._id === p._id));
        return [...prev, ...newItems];
      });
      setPage(nextPage);
      setHasMore(nextPage < data.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading, queryParams]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [loadMore]);

  return (
    <div className="w-full">
      {products.length === 0 ? (
        <p className="mt-12 text-center text-sm text-zinc-400">No products found. Try different filters.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {hasMore && (
        <div ref={loaderRef} className="mt-12 flex items-center justify-center py-6">
          <FiLoader className="animate-spin text-zinc-400" size={24} />
        </div>
      )}
      
      {!hasMore && products.length > 0 && (
        <p className="mt-12 text-center text-sm text-zinc-400 py-6 border-t border-zinc-100">
          You have reached the end of the catalog.
        </p>
      )}
    </div>
  );
}

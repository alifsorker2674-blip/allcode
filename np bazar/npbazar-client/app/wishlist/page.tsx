'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { fetchProducts, type Product } from '@/lib/api';
import { getWishlist, subscribeWishlist } from '@/lib/wishlist';

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const ids = getWishlist();
      if (ids.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const { products: all } = await fetchProducts({ limit: 60 });
      setProducts(all.filter((p) => ids.includes(p._id)));
      setLoading(false);
    };
    load();
    return subscribeWishlist(load);
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1650px] flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-zinc-900">My Wishlist</h1>
      <p className="mt-1 text-sm text-zinc-500">{products.length} product{products.length === 1 ? '' : 's'} saved</p>

      {!loading && products.length === 0 && (
        <p className="mt-12 text-center text-sm text-zinc-400">
          Your wishlist is empty. Tap the heart icon on any product to save it here.
        </p>
      )}

      {products.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

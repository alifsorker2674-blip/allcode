'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiHeart } from 'react-icons/fi';
import { getWishlist, subscribeWishlist } from '@/lib/wishlist';

export default function WishlistNavLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getWishlist().length);
    sync();
    return subscribeWishlist(sync);
  }, []);

  return (
    <Link href="/wishlist" className="group flex flex-col items-center gap-1 text-zinc-700 hover:text-[var(--primary)]">
      <div className="relative">
        <FiHeart size={22} className="transition-transform group-hover:-translate-y-0.5" />
        {count > 0 && (
          <span className="absolute -right-2.5 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
            {count}
          </span>
        )}
      </div>
      <span className="text-sm font-medium">Wishlist</span>
    </Link>
  );
}

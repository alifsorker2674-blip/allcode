'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiShoppingCart } from 'react-icons/fi';
import { getCartCount, subscribeCart } from '@/lib/cart';

export default function CartNavLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getCartCount());
    sync();
    return subscribeCart(sync);
  }, []);

  return (
    <Link href="/cart" className="group relative flex flex-col items-center gap-1 text-zinc-700 hover:text-[var(--primary)]">
      <div className="relative">
        <FiShoppingCart size={22} className="transition-transform group-hover:-translate-y-0.5" />
        {count > 0 && (
          <span className="absolute -right-2.5 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
            {count}
          </span>
        )}
      </div>
      <span className="text-sm font-medium">Cart</span>
    </Link>
  );
}

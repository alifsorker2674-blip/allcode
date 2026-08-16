'use client';

import { useEffect, useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import { isInWishlist, toggleWishlist, subscribeWishlist } from '@/lib/wishlist';

interface Props {
  productId: string;
  className?: string;
}

export default function WishlistButton({ productId, className = '' }: Props) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => setActive(isInWishlist(productId));
    sync();
    return subscribeWishlist(sync);
  }, [productId]);

  return (
    <button
      type="button"
      onClick={() => toggleWishlist(productId)}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={active}
      className={`flex items-center justify-center rounded-[8px] bg-white/90 px-3 py-2.5 text-zinc-600 transition hover:text-[var(--primary)] ${className}`}
    >
      <FiHeart size={16} className={active ? 'fill-[var(--primary)] text-[var(--primary)]' : ''} />
    </button>
  );
}

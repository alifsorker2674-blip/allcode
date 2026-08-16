'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiCheck } from 'react-icons/fi';
import { addToCart } from '@/lib/cart';
import { trackAddToCart } from '@/lib/dataLayer';

interface Props {
  productId: string;
  productName: string;
  price: number;
  quantity?: number;
  /** outline (default) = white bg + colored border; solid = filled. */
  variant?: 'outline' | 'solid';
  /** When true, adds to cart and navigates straight to /cart. */
  buyNow?: boolean;
  label?: string;
  className?: string;
}

export default function AddToCartButton({
  productId,
  productName,
  price,
  quantity = 1,
  variant = 'outline',
  buyNow = false,
  label,
  className = '',
}: Props) {
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addToCart(productId, quantity);
    trackAddToCart({ item_id: productId, item_name: productName, price, quantity });
    if (buyNow) {
      router.push('/cart');
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const base =
    variant === 'solid'
      ? 'bg-[var(--btn-color)] text-white hover:brightness-90'
      : 'border border-[var(--btn-color)] bg-white text-[var(--btn-color)] hover:bg-[var(--btn-color)] hover:text-white';

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center justify-center gap-2 rounded-[8px] px-4 py-2.5 text-sm font-medium transition-colors ${base} ${className}`}
    >
      {added ? (
        <>
          <FiCheck size={16} /> Added!
        </>
      ) : (
        <>
          <FiShoppingCart size={16} /> {label || (buyNow ? 'Buy Now' : 'Add To Cart')}
        </>
      )}
    </button>
  );
}

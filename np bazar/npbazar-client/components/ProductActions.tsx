'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMinus, FiPlus, FiPhone, FiShoppingCart, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { addToCart } from '@/lib/cart';
import { trackViewItem, trackAddToCart } from '@/lib/dataLayer';

interface Props {
  productId: string;
  productName: string;
  price: number;
  stock: number | null;
  phone?: string;
}

export default function ProductActions({ productId, productName, price, stock, phone }: Props) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = stock === 0;
  const maxQty = stock === null ? undefined : stock;

  const digits = phone ? phone.replace(/[^\d]/g, '') : '';
  const waText = encodeURIComponent(`Hello! I want to order: ${productName} (Qty: ${qty})`);
  const whatsappHref = digits ? `https://wa.me/${digits}?text=${waText}` : undefined;
  const callHref = digits ? `tel:+${digits}` : undefined;

  useEffect(() => {
    trackViewItem({ item_id: productId, item_name: productName, price });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleAdd = () => {
    addToCart(productId, qty);
    trackAddToCart({ item_id: productId, item_name: productName, price, quantity: qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleBuyNow = () => {
    addToCart(productId, qty);
    trackAddToCart({ item_id: productId, item_name: productName, price, quantity: qty });
    router.push('/cart');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-zinc-700">Quantity:</span>
        <div className="flex items-center rounded-[8px] border border-zinc-200">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={outOfStock}
            aria-label="Decrease quantity"
            className="flex h-10 w-10 items-center justify-center text-zinc-600 transition hover:text-[var(--primary)] disabled:opacity-40"
          >
            <FiMinus size={14} />
          </button>
          <span className="w-10 text-center text-sm font-semibold text-zinc-900">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => (maxQty ? Math.min(maxQty, q + 1) : q + 1))}
            disabled={outOfStock}
            aria-label="Increase quantity"
            className="flex h-10 w-10 items-center justify-center text-zinc-600 transition hover:text-[var(--primary)] disabled:opacity-40"
          >
            <FiPlus size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          disabled={outOfStock}
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 rounded-[8px] border border-[var(--btn-color)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--btn-color)] transition hover:bg-[var(--btn-color)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {added ? (
            <>
              <FiCheck size={16} /> Added!
            </>
          ) : (
            <>
              <FiShoppingCart size={16} /> {outOfStock ? 'Stock Out' : 'Add To Cart'}
            </>
          )}
        </button>
        <button
          type="button"
          disabled={outOfStock}
          onClick={handleBuyNow}
          className="flex items-center justify-center gap-2 rounded-[8px] bg-[var(--btn-color)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy Now
        </button>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-[8px] border border-emerald-600 px-4 py-2.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
          >
            <FaWhatsapp size={16} /> Order On WhatsApp
          </a>
        )}
        {callHref && (
          <a
            href={callHref}
            className="flex items-center justify-center gap-2 rounded-[8px] border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            <FiPhone size={16} /> Call For Order
          </a>
        )}
      </div>
    </div>
  );
}

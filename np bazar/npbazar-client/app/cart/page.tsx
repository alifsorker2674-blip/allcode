'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { fetchProducts, type Product } from '@/lib/api';
import { getCart, setCartQuantity, removeFromCart, subscribeCart, type CartItem } from '@/lib/cart';
import { getUser, subscribeAuth } from '@/lib/auth';
import { trackRemoveFromCart } from '@/lib/dataLayer';

interface Line {
  product: Product;
  quantity: number;
}

export default function CartPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      const user = getUser();
      setLoggedIn(!!user);
      if (user) {
        // user logged in sync logic if needed later
      }
    };
    syncAuth();
    return subscribeAuth(syncAuth);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const items: CartItem[] = getCart();
      if (items.length === 0) {
        if (!cancelled) {
          setLines([]);
          setLoading(false);
        }
        return;
      }
      const { products } = await fetchProducts({ limit: 60 });
      if (cancelled) return;
      const next: Line[] = items
        .map((i) => ({ product: products.find((p) => p._id === i.productId)!, quantity: i.quantity }))
        .filter((l) => !!l.product);
      setLines(next);
      setLoading(false);
    };
    load();
    const unsub = subscribeCart(load);
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);



  return (
    <div className="mx-auto w-full max-w-[1650px] flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-zinc-900">Shopping Cart</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {lines.length} item{lines.length === 1 ? '' : 's'} in your cart
      </p>

      {!loading && lines.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-sm text-zinc-400">Your cart is empty.</p>
          <Link href="/shop" className="mt-4 inline-block rounded-[8px] bg-[var(--btn-color)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-90">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Cart lines */}
          <div className="space-y-4">
            {lines.map((line) => (
              <div key={line.product._id} className="flex items-center gap-3 rounded-[8px] border border-zinc-200 bg-white p-3 sm:p-4">
                {/* Image */}
                <Link href={`/products/${line.product.slug}`} className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-[8px] bg-zinc-50">
                  {line.product.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={line.product.thumbnail} alt={line.product.name} className="h-full w-full object-contain" />
                  ) : null}
                </Link>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${line.product.slug}`} className="block">
                    <h3 className="line-clamp-2 text-xs sm:text-sm font-semibold text-zinc-900 hover:text-[var(--primary)] text-wrap break-words">{line.product.name}</h3>
                  </Link>
                  <p className="mt-0.5 text-xs sm:text-sm text-zinc-500">৳{line.product.price.toLocaleString()}</p>
                  
                  {/* Quantity Selector (Mobile only, shown below name/price) */}
                  <div className="mt-2 flex items-center rounded-[6px] border border-zinc-200 w-fit sm:hidden">
                    <button
                      type="button"
                      onClick={() => setCartQuantity(line.product._id, line.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center text-zinc-600"
                    >
                      <FiMinus size={11} />
                    </button>
                    <span className="w-7 text-center text-xs font-semibold">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setCartQuantity(line.product._id, line.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center text-zinc-600"
                    >
                      <FiPlus size={11} />
                    </button>
                  </div>
                </div>

                {/* Quantity Selector (Desktop only) */}
                <div className="hidden sm:flex items-center rounded-[8px] border border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setCartQuantity(line.product._id, line.quantity - 1)}
                    className="flex h-9 w-9 items-center justify-center text-zinc-600 transition hover:text-[var(--primary)]"
                  >
                    <FiMinus size={13} />
                  </button>
                  <span className="w-9 text-center text-sm font-semibold">{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setCartQuantity(line.product._id, line.quantity + 1)}
                    className="flex h-9 w-9 items-center justify-center text-zinc-600 transition hover:text-[var(--primary)]"
                  >
                    <FiPlus size={13} />
                  </button>
                </div>

                {/* Right Side (Total Price + Delete Button) */}
                <div className="flex flex-col items-end gap-2 sm:w-32 shrink-0">
                  <p className="text-right text-xs sm:text-sm font-bold text-zinc-900">
                    ৳{(line.product.price * line.quantity).toLocaleString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      removeFromCart(line.product._id);
                      trackRemoveFromCart({
                        item_id: line.product._id,
                        item_name: line.product.name,
                        price: line.product.price,
                        quantity: line.quantity,
                      });
                    }}
                    className="text-zinc-400 transition hover:text-[var(--primary)] p-1"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary + checkout */}
          <div className="h-fit rounded-[8px] border border-zinc-200 bg-white p-6">
            <h2 className="text-base font-bold text-zinc-900">Order Summary</h2>
            <div className="mt-4 space-y-2 border-b border-zinc-100 pb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-semibold text-zinc-900">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Shipping</span>
                <span className="text-zinc-500">Calculated at checkout</span>
              </div>
            </div>

            {!loggedIn && (
              <p className="mt-4 rounded-[8px] bg-zinc-50 px-3 py-2 text-sm text-zinc-500">
                Checking out as guest —{' '}
                <Link href="/account" className="font-medium text-[var(--primary)] hover:underline">
                  sign in
                </Link>{' '}
                to save your order history.
              </p>
            )}

            <Link
              href="/checkout"
              className="mt-6 flex w-full justify-center rounded-[8px] bg-[var(--btn-color)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-90"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

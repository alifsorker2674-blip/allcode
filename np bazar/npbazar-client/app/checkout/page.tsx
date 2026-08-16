'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FiCheckCircle, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import {
  fetchProducts,
  fetchSettings,
  fetchShippingZones,
  fetchActivePaymentGateways,
  validateCoupon,
  type Product,
  type StoreSettings,
  type ShippingZone,
  type PaymentGatewayOption,
  type CouponFreeGift,
  type CouponDiscountedLine,
} from '@/lib/api';
import { API_BASE_URL } from '@/lib/api';
import { getCart, clearCart, subscribeCart, type CartItem } from '@/lib/cart';
import { getUser, subscribeAuth, authFetch } from '@/lib/auth';
import { trackBeginCheckout, trackPurchase } from '@/lib/dataLayer';
import Spinner from '@/components/Spinner';

interface Line {
  product: Product;
  quantity: number;
}

const inputCls =
  'w-full rounded-[4px] border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]';

export default function CheckoutPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<{ orderNumber: string; total: number } | null>(null);

  const [address, setAddress] = useState({ fullName: '', phone: '', addressLine: '', area: '', city: '' });

  // Coupon
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountType: string } | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [freeShipping, setFreeShipping] = useState(false);
  const [freeGift, setFreeGift] = useState<CouponFreeGift | null>(null);
  const [discountedLines, setDiscountedLines] = useState<CouponDiscountedLine[]>([]);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Payment method — 'cod' or a connected gateway's key (e.g. 'sslcommerz').
  const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayOption[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    fetchActivePaymentGateways().then(setPaymentGateways);
  }, []);

  useEffect(() => {
    fetchSettings().then(setSettings);
    fetchShippingZones().then((zones) => {
      setShippingZones(zones);
      setAddress((prev) => {
        if (!prev.city && zones.length > 0) {
          return { ...prev, city: zones[0].city };
        }
        return prev;
      });
    });
  }, []);

  useEffect(() => {
    const syncAuth = () => {
      const user = getUser();
      setLoggedIn(!!user);
      if (user) {
        setAddress((a) => ({
          ...a,
          fullName: a.fullName || user.name,
          phone: a.phone || user.mobile || '',
          addressLine: a.addressLine || user.address || '',
        }));
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

  const beganCheckoutRef = useRef(false);
  useEffect(() => {
    if (beganCheckoutRef.current || loading || lines.length === 0) return;
    beganCheckoutRef.current = true;
    trackBeginCheckout(
      lines.map((l) => ({ item_id: l.product._id, item_name: l.product.name, price: l.product.price, quantity: l.quantity })),
      settings?.currency
    );
  }, [loading, lines, settings]);

  let shipping = 0;
  if (address.city) {
    const selectedZone = shippingZones.find((z) => z.city.toLowerCase() === address.city.toLowerCase());
    if (selectedZone) {
      if (selectedZone.freeShippingThreshold > 0 && subtotal >= selectedZone.freeShippingThreshold) {
        shipping = 0;
      } else {
        shipping = selectedZone.shippingCost;
      }
    } else if (settings) {
      if (settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold) {
        shipping = 0;
      } else {
        shipping = settings.shippingCost || 0;
      }
    }
  }

  const effectiveShipping = freeShipping ? 0 : shipping;
  const total = Math.max(0, subtotal - couponDiscount) + effectiveShipping;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError('');
    setApplyingCoupon(true);
    try {
      const result = await validateCoupon(
        couponInput.trim(),
        lines.map((l) => ({ productId: l.product._id, quantity: l.quantity }))
      );
      setAppliedCoupon(result.coupon);
      setCouponDiscount(result.discount);
      setFreeShipping(result.freeShipping);
      setFreeGift(result.freeGift);
      setDiscountedLines(result.discountedLines);
    } catch (err) {
      setCouponError((err as Error).message);
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setFreeShipping(false);
      setFreeGift(null);
      setDiscountedLines([]);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setFreeShipping(false);
    setFreeGift(null);
    setDiscountedLines([]);
    setCouponInput('');
    setCouponError('');
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!address.fullName || !address.phone || !address.addressLine || !address.area || !address.city) {
      setError('All fields are required. Please fill out your complete shipping information.');
      return;
    }
    setPlacing(true);
    try {
      const isOnline = paymentMethod !== 'cod';
      const paymentFields = isOnline
        ? { paymentMethod: 'online', paymentGateway: paymentMethod }
        : { paymentMethod: 'cod' };

      let order: { orderNumber: string; total: number };
      let paymentRedirectUrl: string | null = null;
      if (loggedIn) {
        // Sync local cart to server cart, then checkout
        await authFetch('/cart', { method: 'DELETE' });
        for (const line of lines) {
          await authFetch('/cart', {
            method: 'POST',
            body: JSON.stringify({ productId: line.product._id, quantity: line.quantity }),
          });
        }
        const data = await authFetch<{ order: { orderNumber: string; total: number }; paymentRedirectUrl: string | null }>(
          '/orders',
          {
            method: 'POST',
            body: JSON.stringify({
              shippingAddress: address,
              ...paymentFields,
              couponCode: appliedCoupon?.code,
            }),
          }
        );
        order = data.order;
        paymentRedirectUrl = data.paymentRedirectUrl;
      } else {
        const res = await fetch(`${API_BASE_URL}/orders/guest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: lines.map((l) => ({ productId: l.product._id, quantity: l.quantity })),
            shippingAddress: address,
            ...paymentFields,
            couponCode: appliedCoupon?.code,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Could not place order');
        order = data.order;
        paymentRedirectUrl = data.paymentRedirectUrl;
      }

      // Online payment: the gateway needs to take over the browser next —
      // don't clear the cart or show the inline "thank you" screen yet, the
      // order-confirmation page (after the gateway redirects back) handles that.
      if (isOnline && paymentRedirectUrl) {
        window.location.href = paymentRedirectUrl;
        return;
      }

      clearCart();
      setPlacedOrder({ orderNumber: order.orderNumber, total: order.total });
      trackPurchase(
        order.orderNumber,
        order.total,
        lines.map((l) => ({ item_id: l.product._id, item_name: l.product.name, price: l.product.price, quantity: l.quantity })),
        { shipping: effectiveShipping, currency: settings?.currency }
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPlacing(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 py-20 text-center font-sans">
        <style>{`header, footer { display: none !important; }`}</style>
        <FiCheckCircle size={64} className="text-emerald-500" />
        <h1 className="mt-6 text-3xl font-bold text-zinc-900">Thank you for your order!</h1>
        <p className="mt-3 text-base text-zinc-600">
          Your order number is <span className="font-bold text-zinc-900">#{placedOrder.orderNumber}</span>
        </p>
        <p className="mt-1 text-base text-zinc-600">
          We have received your order and are getting it ready to be shipped. You will pay ৳{placedOrder.total.toLocaleString()} on delivery.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/shop"
            className="rounded-[8px] bg-[var(--btn-color)] px-6 py-3 text-sm font-bold text-white transition hover:brightness-90"
          >
            Continue Shopping
          </Link>
          <Link
            href="/track"
            className="rounded-[8px] border border-zinc-300 px-6 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
          >
            Track Order
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-10 text-center text-sm text-zinc-500">Loading checkout...</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="p-10 text-center text-sm text-zinc-500">
        Your cart is empty. <Link href="/shop" className="text-[var(--primary)] hover:underline">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col lg:flex-row">
      <style>{`header, footer { display: none !important; }`}</style>

      {/* LEFT COLUMN: Forms */}
      <div className="flex-1 px-4 py-10 lg:pl-10 lg:pr-12 xl:pl-32 xl:pr-16 bg-white border-r border-zinc-200 order-2 lg:order-1">
        
        {/* Header / Logo */}
        <div className="mb-6 hidden lg:block">
          <Link href="/" className="inline-block">
            {settings?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logo} alt={settings.storeName} className="h-10 w-auto object-contain" />
            ) : (
              <span className="text-3xl font-extrabold tracking-tight text-zinc-900">
                {settings?.storeName || 'Ecomus'}
                <span className="text-[var(--primary)]">.</span>
              </span>
            )}
          </Link>
        </div>

        {/* Breadcrumbs */}
        <nav className="mb-8 hidden lg:flex items-center gap-2 text-xs font-medium text-zinc-500">
          <Link href="/cart" className="hover:text-zinc-900 transition">Cart</Link>
          <FiChevronRight size={12} />
          <span className="text-zinc-900 font-bold">Information</span>
          <FiChevronRight size={12} />
          <span>Shipping</span>
          <FiChevronRight size={12} />
          <span>Payment</span>
        </nav>



        <form onSubmit={placeOrder} className="space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-medium text-zinc-900">Shipping address</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">Full Name</label>
                <input 
                  value={address.fullName} 
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })} 
                  placeholder="e.g. John Doe" 
                  className={inputCls} 
                  required 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">Phone Number</label>
                <input
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="e.g. 01XXXXXXXXX"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">Address</label>
                <input 
                  value={address.addressLine} 
                  onChange={(e) => setAddress({ ...address, addressLine: e.target.value })} 
                  placeholder="House, Road, Block etc." 
                  className={inputCls} 
                  required 
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">Area / Thana</label>
                  <input 
                    value={address.area} 
                    onChange={(e) => setAddress({ ...address, area: e.target.value })} 
                    placeholder="e.g. Mirpur, Dhanmondi" 
                    className={inputCls} 
                    required 
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700">City / Shipping Zone</label>
                  {shippingZones.length > 0 ? (
                    <select
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className={inputCls}
                      required
                    >
                      <option value="" disabled>Select Shipping Zone</option>
                      {shippingZones.map((z) => (
                        <option key={z._id} value={z.city}>{z.name} ({z.city})</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      value={address.city} 
                      onChange={(e) => setAddress({ ...address, city: e.target.value })} 
                      placeholder="e.g. Dhaka" 
                      className={inputCls} 
                      required 
                    />
                  )}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-medium text-zinc-900">Payment</h2>
            <div className="space-y-3">
              <label
                htmlFor="pay-cod"
                className={`flex cursor-pointer items-center gap-3 rounded-[4px] border p-4 transition ${
                  paymentMethod === 'cod' ? 'border-[var(--primary)] bg-zinc-50' : 'border-zinc-300'
                }`}
              >
                <input
                  type="radio"
                  id="pay-cod"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <div>
                  <span className="font-medium text-zinc-900">Cash on Delivery (COD)</span>
                  <p className="text-sm text-zinc-600">Pay with cash upon delivery.</p>
                </div>
              </label>

              {paymentGateways.map((gw) => (
                <label
                  key={gw.key}
                  htmlFor={`pay-${gw.key}`}
                  className={`flex cursor-pointer items-center gap-3 rounded-[4px] border p-4 transition ${
                    paymentMethod === gw.key ? 'border-[var(--primary)] bg-zinc-50' : 'border-zinc-300'
                  }`}
                >
                  <input
                    type="radio"
                    id={`pay-${gw.key}`}
                    name="payment"
                    checked={paymentMethod === gw.key}
                    onChange={() => setPaymentMethod(gw.key)}
                    className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <div>
                    <span className="font-medium text-zinc-900">{gw.label}</span>
                    <p className="text-sm text-zinc-600">Pay online — you&apos;ll be redirected to {gw.label} to complete payment.</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {error && <p className="text-sm font-medium text-[var(--primary)]">{error}</p>}

          <div className="flex flex-col-reverse items-center justify-between gap-4 pt-4 sm:flex-row">
            <Link href="/cart" className="flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline">
              <FiChevronLeft size={16} />
              Return to cart
            </Link>
            <button
              type="submit"
              disabled={placing}
              className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-[var(--btn-color)] px-6 py-4 text-sm font-bold text-white transition hover:brightness-90 disabled:opacity-60 sm:w-auto"
            >
              {placing && <Spinner size={16} />}
              {placing ? 'Processing...' : 'Complete order'}
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: Order Summary */}
      <div className="flex-1 bg-[#f5f5f5] px-4 py-10 lg:pr-10 lg:pl-12 xl:pr-32 xl:pl-16 border-b border-zinc-200 lg:border-none order-1 lg:order-2">
        
        {/* Mobile Header (Shows above order summary on mobile) */}
        <div className="mb-6 lg:hidden">
          <Link href="/" className="inline-block">
            {settings?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logo} alt={settings.storeName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-2xl font-extrabold tracking-tight text-zinc-900">
                {settings?.storeName || 'Ecomus'}
                <span className="text-[var(--primary)]">.</span>
              </span>
            )}
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <div className="space-y-4">
            {lines.map((line) => {
              const freeEntry = discountedLines.find((d) => d.productId === line.product._id && d.free);
              const freeQty = Math.min(freeEntry?.quantity || 0, line.quantity);
              const paidQty = line.quantity - freeQty;

              return (
                <div key={line.product._id} className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[8px] border border-zinc-200 bg-white shadow-sm">
                      {line.product.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={line.product.thumbnail} alt={line.product.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-600/90 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
                      {line.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-zinc-900">{line.product.name}</h3>
                    {freeQty > 0 && (
                      <p className="text-xs font-medium text-emerald-600">
                        {freeQty === line.quantity ? 'Free (coupon)' : `${freeQty} free (coupon)`}
                      </p>
                    )}
                  </div>
                  <div className="text-sm font-medium">
                    {freeQty === line.quantity ? (
                      <span className="text-emerald-600">Free</span>
                    ) : freeQty > 0 ? (
                      <span className="text-zinc-900">৳{(line.product.price * paidQty).toLocaleString()}</span>
                    ) : (
                      <span className="text-zinc-900">৳{(line.product.price * line.quantity).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-zinc-300 pt-6">
            {appliedCoupon ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-[4px] border border-emerald-200 bg-emerald-50 px-3 py-2">
                  <span className="text-sm font-medium text-emerald-700">Coupon &quot;{appliedCoupon.code}&quot; applied</span>
                  <button type="button" onClick={handleRemoveCoupon} className="text-xs font-medium text-emerald-700 hover:underline">
                    Remove
                  </button>
                </div>
                {freeGift && (
                  <div className="flex items-center gap-3 rounded-[4px] border border-amber-200 bg-amber-50 px-3 py-2">
                    {freeGift.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={freeGift.thumbnail} alt={freeGift.name} className="h-10 w-10 shrink-0 rounded-[4px] object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900">{freeGift.name}</p>
                      <p className="text-xs text-amber-700">Free gift × {freeGift.quantity} — added to your order automatically</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon code"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponInput.trim()}
                    className="flex shrink-0 items-center justify-center gap-1.5 rounded-[4px] border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
                  >
                    {applyingCoupon && <Spinner size={14} />}
                    {applyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="mt-1 text-xs text-red-600">{couponError}</p>}
              </div>
            )}
          </div>

          <div className="mt-4 space-y-3 border-t border-zinc-300 pt-6 text-sm text-zinc-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-zinc-900">৳{subtotal.toLocaleString()}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="font-medium">-৳{couponDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              {address.city ? (
                <span className="font-medium text-zinc-900">
                  {effectiveShipping === 0 ? 'Free' : `৳${effectiveShipping.toLocaleString()}`}
                </span>
              ) : (
                <span className="text-zinc-500">Calculated at next step</span>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-zinc-300 pt-6">
            <span className="text-base font-medium text-zinc-900">Total</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">BDT</span>
              <span className="text-2xl font-medium text-zinc-900">৳{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

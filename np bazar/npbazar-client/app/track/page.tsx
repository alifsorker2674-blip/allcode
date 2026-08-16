'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiCheckCircle, FiClock } from 'react-icons/fi';
import { API_BASE_URL } from '@/lib/api';
import Spinner from '@/components/Spinner';

interface TrackedOrder {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  statusHistory: { status: string; note?: string; at?: string; createdAt?: string }[];
  items: { name: string; quantity: number; price: number; thumbnail?: string; variant?: Record<string, string> }[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  createdAt: string;
}

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const inputCls =
  'w-full rounded-[8px] border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (order) {
      const timer = setTimeout(() => setShowResult(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShowResult(false);
    }
  }, [order]);

  const track = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setShowResult(false);
    // Add an artificial small delay to make the loading state feel natural
    await new Promise(resolve => setTimeout(resolve, 400));
    try {
      const qs = new URLSearchParams({ orderNumber: orderNumber.trim() });
      const res = await fetch(`${API_BASE_URL}/orders/track?${qs}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Order not found');
      setOrder(data.order);
    } catch (err) {
      setError((err as Error).message);
      setOrder(null);
    } finally {
      setBusy(false);
    }
  };

  const currentStep = order ? STATUS_STEPS.indexOf(order.orderStatus) : -1;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 sm:px-6">
      <h1 className="text-center text-2xl font-bold text-zinc-900">Track Your Order</h1>
      <p className="mt-2 text-center text-sm text-zinc-500">
        Enter your order number to check its current status.
      </p>

      <form onSubmit={track} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
        <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="Order number (e.g. ORD-...)" className={inputCls} required />
        <button
          type="submit"
          disabled={busy}
          className="flex shrink-0 items-center justify-center gap-2 rounded-[8px] bg-[var(--btn-color)] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-90 disabled:opacity-60"
        >
          {busy ? <Spinner size={15} /> : <FiSearch size={15} />}
          {busy ? 'Searching...' : 'Track'}
        </button>
      </form>

      {error && (
        <p className="mt-6 text-center text-sm text-[var(--primary)] transition-opacity duration-300">
          {error}
        </p>
      )}

      {order && (
        <div className={`mt-10 rounded-[8px] border border-zinc-200 bg-white p-6 transition-all duration-700 ease-out transform ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-[var(--primary)]">{order.orderNumber}</h2>
            <span className="text-sm text-zinc-500">{new Date(order.createdAt).toLocaleString()}</span>
          </div>

          {/* Status progress */}
          {order.orderStatus === 'cancelled' ? (
            <p className="mt-4 rounded-[8px] bg-red-50 px-3 py-2 text-sm font-semibold text-[var(--primary)]">
              This order was cancelled.
            </p>
          ) : (
            <div className="mt-6 flex items-center">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${
                        i <= currentStep ? 'bg-[var(--primary)]' : 'bg-zinc-200'
                      }`}
                    >
                      {i < currentStep ? <FiCheckCircle size={15} /> : i === currentStep ? <FiClock size={15} /> : i + 1}
                    </span>
                    <span className={`mt-1.5 text-sm capitalize ${i <= currentStep ? 'font-semibold text-zinc-900' : 'text-zinc-400'}`}>
                      {step}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`mx-2 mb-5 h-1 flex-1 rounded-[8px] ${i < currentStep ? 'bg-[var(--primary)]' : 'bg-zinc-200'}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Items */}
          <div className="mt-6 space-y-2 border-t border-zinc-100 pt-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                {item.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.thumbnail} alt={item.name} className="h-10 w-10 rounded-[8px] bg-zinc-50 object-contain" />
                ) : null}
                <span className="flex-1 text-zinc-700">
                  {item.name} <span className="text-zinc-400">×{item.quantity}</span>
                  {item.variant && Object.keys(item.variant).length > 0 && (
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </p>
                  )}
                </span>
                <span className={`font-semibold ${item.price === 0 ? 'text-emerald-600' : 'text-zinc-900'}`}>
                  {item.price === 0 ? 'FREE' : `৳${(item.price * item.quantity).toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 space-y-1.5 border-t border-zinc-100 pt-4 text-sm">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span>৳{order.subtotal.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-৳{order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-500">
              <span>Shipping</span>
              <span>৳{order.shippingCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-zinc-900">
              <span>Total</span>
              <span>৳{order.total.toLocaleString()}</span>
            </div>
            <p className="pt-1 text-zinc-400">
              Payment: {order.paymentMethod.toUpperCase()} · <span className="capitalize">{order.paymentStatus}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

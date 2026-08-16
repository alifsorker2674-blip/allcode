'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiXCircle, FiClock, FiLoader } from 'react-icons/fi';
import { API_BASE_URL } from '@/lib/api';

interface TrackedOrder {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  createdAt: string;
}

// Where the customer lands after a payment gateway redirects back (see
// server/controllers/paymentController.js `callback`). The gateway's own
// server-to-server IPN is the authoritative status update, but it can arrive
// slightly before or after this redirect — a short poll covers the race
// without needing a websocket for what's normally a 1-2 second gap.
export default function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderNumber) return;
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/orders/track?orderNumber=${encodeURIComponent(orderNumber)}`, { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.success) {
          setError(data.message || 'Order not found');
          setLoading(false);
          return;
        }
        setOrder(data.order);
        setLoading(false);

        // Keep polling briefly while payment is still pending, in case the
        // IPN hasn't landed yet.
        attempts += 1;
        if (data.order.paymentStatus === 'pending' && attempts < 6) {
          setTimeout(poll, 2000);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load your order right now.');
          setLoading(false);
        }
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 py-20 text-center">
        <FiLoader size={40} className="animate-spin text-zinc-400" />
        <p className="mt-4 text-sm text-zinc-500">Loading your order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 py-20 text-center">
        <FiXCircle size={56} className="text-red-400" />
        <h1 className="mt-6 text-2xl font-bold text-zinc-900">We couldn&apos;t find that order</h1>
        <p className="mt-2 text-sm text-zinc-500">{error}</p>
        <Link href="/" className="mt-8 rounded-[8px] bg-[var(--btn-color)] px-6 py-3 text-sm font-bold text-white transition hover:brightness-90">
          Back to Home
        </Link>
      </div>
    );
  }

  const isPaid = order.paymentStatus === 'paid';
  const isFailed = order.paymentStatus === 'failed';
  const isPending = order.paymentStatus === 'pending';

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 py-20 text-center">
      {isPaid && <FiCheckCircle size={64} className="text-emerald-500" />}
      {isFailed && <FiXCircle size={64} className="text-red-500" />}
      {isPending && <FiClock size={64} className="text-amber-500" />}

      <h1 className="mt-6 text-3xl font-bold text-zinc-900">
        {isPaid && 'Payment successful!'}
        {isFailed && 'Payment failed'}
        {isPending && 'Confirming your payment...'}
      </h1>

      <p className="mt-3 text-base text-zinc-600">
        Your order number is <span className="font-bold text-zinc-900">#{order.orderNumber}</span>
      </p>

      {isPaid && (
        <p className="mt-1 text-base text-zinc-600">
          We&apos;ve received your payment of ৳{order.total.toLocaleString()} and are getting your order ready.
        </p>
      )}
      {isFailed && (
        <p className="mt-1 text-base text-zinc-600">
          Your payment didn&apos;t go through. No charge was made — you can try again or choose a different payment method.
        </p>
      )}
      {isPending && (
        <p className="mt-1 text-base text-zinc-600">
          We&apos;re still waiting for confirmation from the payment gateway. This page will update automatically.
        </p>
      )}

      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/shop" className="rounded-[8px] bg-[var(--btn-color)] px-6 py-3 text-sm font-bold text-white transition hover:brightness-90">
          Continue Shopping
        </Link>
        <Link
          href={`/track?orderNumber=${encodeURIComponent(order.orderNumber)}`}
          className="rounded-[8px] border border-zinc-300 px-6 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
        >
          Track Order
        </Link>
      </div>
    </div>
  );
}

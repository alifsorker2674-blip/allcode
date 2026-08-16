'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { authFetch } from '@/lib/auth';

interface OrderDetail {
  _id: string;
  orderNumber: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  createdAt: string;
  items: {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    thumbnail?: string;
    variant?: Record<string, string>;
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine: string;
    area: string;
    city: string;
  };
  statusHistory: {
    status: string;
    note: string;
    date: string;
  }[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusIcons: Record<string, React.ElementType> = {
  pending: FiClock,
  processing: FiPackage,
  shipped: FiTruck,
  delivered: FiCheckCircle,
  cancelled: FiXCircle,
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    authFetch<{ order: OrderDetail }>(`/orders/my/${id}`)
      .then((data) => {
        if (!cancelled) {
          setOrder(data.order);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError((err as Error).message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-10 pb-20 font-sans">
        <div className="mx-auto max-w-4xl px-4 text-center text-sm text-zinc-500">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-10 pb-20 font-sans">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-red-500">{error || 'Order not found'}</p>
          <Link href="/account" className="mt-4 inline-block text-[var(--primary)] hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[order.orderStatus] || FiPackage;

  return (
    <div className="min-h-screen bg-zinc-50 pt-10 pb-20 font-sans">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Link href="/account" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition">
          <FiArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Order #{order.orderNumber}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Placed on {new Date(order.createdAt).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold capitalize ${statusColors[order.orderStatus] || 'bg-zinc-100 text-zinc-700'}`}>
            <StatusIcon size={16} /> {order.orderStatus}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
                <h3 className="font-bold text-zinc-900">Items Ordered</h3>
              </div>
              <div className="divide-y divide-zinc-100 px-6">
                {order.items.map((item, index) => (
                  <div key={item._id || index} className="flex py-6">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                      {item.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.thumbnail} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">No Image</div>
                      )}
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div className="flex justify-between text-base font-medium text-zinc-900">
                        <h3>{item.name}</h3>
                        <p className={`ml-4 ${item.price === 0 ? 'text-emerald-600' : ''}`}>
                          {item.price === 0 ? 'FREE' : `৳${(item.price * item.quantity).toLocaleString()}`}
                        </p>
                      </div>
                      {item.variant && Object.keys(item.variant).length > 0 && (
                        <p className="mt-1 text-sm text-zinc-500">
                          {Object.entries(item.variant)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-zinc-500">Qty {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-6 space-y-3">
                <div className="flex items-center justify-between text-sm text-zinc-600">
                  <p>Subtotal</p>
                  <p className="font-medium">৳{order.subtotal.toLocaleString()}</p>
                </div>
                {order.discount > 0 && (
                  <div className="flex items-center justify-between text-sm text-emerald-600">
                    <p>Discount</p>
                    <p className="font-medium">-৳{order.discount.toLocaleString()}</p>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm text-zinc-600">
                  <p>Shipping</p>
                  <p className="font-medium">{order.shippingCost === 0 ? 'Free' : `৳${order.shippingCost.toLocaleString()}`}</p>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-base font-bold text-zinc-900">
                  <p>Total</p>
                  <p>৳{order.total.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-zinc-900">Shipping Address</h3>
              <address className="not-italic text-sm text-zinc-600 space-y-1">
                <p className="font-medium text-zinc-900">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.addressLine}</p>
                <p>{order.shippingAddress?.area}, {order.shippingAddress?.city}</p>
                <p className="pt-2">Phone: {order.shippingAddress?.phone}</p>
              </address>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-zinc-900">Payment Information</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Method</span>
                  <span className="font-medium uppercase text-zinc-900">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status</span>
                  <span className={`font-medium capitalize ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-orange-600'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

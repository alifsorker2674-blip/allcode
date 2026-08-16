'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiUser, FiLogOut, FiPackage, FiEye, FiEyeOff, FiCalendar, FiPhone, FiMapPin, FiMail } from 'react-icons/fi';
import {
  getUser,
  subscribeAuth,
  logout,
  apiLogin,
  apiRegister,
  authFetch,
  type AuthUser,
} from '@/lib/auth';
import Spinner from '@/components/Spinner';

interface MyOrder {
  _id: string;
  orderNumber: string;
  orderStatus: string;
  total: number;
  createdAt: string;
  items: { name: string; quantity: number }[];
}

const inputCls =
  'w-full rounded-[8px] border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10';
const btnCls =
  'w-full flex items-center justify-center gap-2 rounded-[8px] bg-[var(--btn-color)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-90 disabled:opacity-60';

// BD mobile: 10 digits after +880, starting 1[3-9] (013.../019...).
const BD_LOCAL_PATTERN = /^1[3-9]\d{8}$/;

export default function AccountPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [login, setLogin] = useState({ mobile: '', password: '' });
  const [reg, setReg] = useState({ name: '', mobile: '', email: '', password: '', address: '' });

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [orders, setOrders] = useState<MyOrder[]>([]);

  useEffect(() => {
    const sync = () => setUser(getUser());
    sync();
    return subscribeAuth(sync);
  }, []);

  useEffect(() => {
    if (!user) return;
    authFetch<{ orders: MyOrder[] }>('/orders/my')
      .then((d) => setOrders(d.orders))
      .catch(() => {});
  }, [user]);

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setError('');
    setNotice('');
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      if (!BD_LOCAL_PATTERN.test(login.mobile)) {
        throw new Error('Enter a valid 10-digit Bangladeshi mobile number after +880');
      }
      const fullMobile = `+880${login.mobile}`;
      await apiLogin(fullMobile, login.password);
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      if (!BD_LOCAL_PATTERN.test(reg.mobile)) {
        throw new Error('Enter a valid 10-digit Bangladeshi mobile number after +880');
      }
      if (!reg.email.trim()) {
        throw new Error('Email is required');
      }
      await apiRegister({
        name: reg.name.trim(),
        mobile: `+880${reg.mobile}`,
        email: reg.email.trim(),
        password: reg.password,
        address: reg.address.trim(),
      });
    });
  };

  // ---------- Logged in: profile + orders ----------
  if (user) {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'processing').length;
    const deliveredOrders = orders.filter((o) => o.orderStatus === 'delivered').length;

    return (
      <div className="min-h-screen bg-zinc-50 w-full pt-10 pb-20 font-sans">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
              <p className="mt-1 text-sm text-zinc-500">Manage your account and orders</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 hover:text-[var(--primary)]"
            >
              <FiLogOut size={16} /> Logout
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column */}
            <div className="space-y-6 lg:col-span-1">
              {/* Profile Card */}
              <div className="flex flex-col items-center rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary)]/10 text-2xl font-bold text-[var(--primary)]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-zinc-900">{user.name}</h2>
                <div className="mt-6 w-full space-y-4 text-left text-sm text-zinc-600">
                  {user.email && (
                    <div className="flex items-center gap-3">
                      <FiMail size={16} className="text-zinc-400" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <FiUser size={16} className="text-zinc-400" />
                    <span>Customer</span>
                  </div>
                  {/* Since user.createdAt isn't guaranteed in frontend auth state without fetching, 
                      we display it if we have it, otherwise fallback to "Active Member" */}
                  <div className="flex items-center gap-3">
                    <FiCalendar size={16} className="text-zinc-400" />
                    <span>Active Member</span>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-lg font-bold text-zinc-900">Order Statistics</h3>
                <div className="space-y-4 text-sm font-medium">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600">Total Orders</span>
                    <span className="font-bold text-zinc-900">{totalOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600">Pending</span>
                    <span className="font-bold text-orange-500">{pendingOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600">Delivered</span>
                    <span className="font-bold text-emerald-500">{deliveredOrders}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm min-h-[500px]">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-zinc-900">Your Orders</h3>
                  <span className="rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                    {totalOrders} Orders
                  </span>
                </div>

                {orders.length === 0 ? (
                  <p className="mt-4 text-sm text-zinc-400">
                    No orders yet.{' '}
                    <Link href="/shop" className="text-[var(--primary)] hover:underline">
                      Start shopping →
                    </Link>
                  </p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm ring-1 ring-zinc-200">
                        {/* Top row */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 rounded-full bg-[var(--primary)]/10 px-2.5 py-1 text-xs font-semibold capitalize text-[var(--primary)]">
                              <FiPackage size={12} /> {order.orderStatus}
                            </span>
                            <span className="text-sm font-medium text-zinc-600">Order #{order.orderNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link href={`/account/orders/${order._id}`} className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 hover:text-[var(--primary)]">
                              <FiEye size={14} /> View
                            </Link>
                            {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
                              <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 hover:text-[var(--primary)]">
                                <FiPhone size={14} /> Call to Cancel
                              </button>
                            )}
                          </div>
                        </div>
                        {/* Middle row */}
                        <div className="flex flex-wrap items-center gap-6 py-4 text-sm text-zinc-600 sm:gap-10">
                          <div className="flex items-center gap-2">
                            <FiCalendar size={16} className="text-zinc-400" />
                            <span>{new Date(order.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-2 font-medium">
                            <span className="text-zinc-400">$</span>
                            <span>৳{order.total.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiMapPin size={16} className="text-zinc-400" />
                            <span>dhaka</span>
                          </div>
                        </div>
                        {/* Bottom row */}
                        <div className="pt-2 text-sm text-zinc-600 border-t border-zinc-50 mt-2">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}: {order.items.map((i) => `${i.name}`).join(' — ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Logged out: login / register ----------
  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-14">
      <div className="rounded-[8px] border border-zinc-200 bg-white p-8">
        <div className="mb-6 flex gap-2 rounded-[8px] border border-zinc-200 p-1.5">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 rounded-[8px] px-4 py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-[var(--primary)] text-white' : 'text-zinc-600 hover:bg-zinc-50'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 rounded-[8px] px-4 py-2 text-sm font-semibold transition ${mode === 'register' ? 'bg-[var(--primary)] text-white' : 'text-zinc-600 hover:bg-zinc-50'}`}
          >
            Register
          </button>
        </div>

        {notice && <p className="mb-4 rounded-[8px] bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>}
        {error && <p className="mb-4 rounded-[8px] bg-red-50 px-3 py-2 text-sm text-[var(--primary)]">{error}</p>}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Mobile Number</label>
              <div className="flex">
                <span className="flex shrink-0 items-center rounded-l-[8px] border border-r-0 border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-600">
                  +880
                </span>
                <input
                  value={login.mobile}
                  onChange={(e) => setLogin({ ...login, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="1XXXXXXXXX"
                  inputMode="numeric"
                  maxLength={10}
                  className="w-full rounded-r-[8px] border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                  required
                />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-700">Password</label>
                <Link href="/forgot-password" className="text-sm font-medium text-[var(--primary)] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={login.password}
                  onChange={(e) => setLogin({ ...login, password: e.target.value })}
                  placeholder="Your password"
                  className={inputCls}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showLoginPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={busy} className={btnCls}>
              {busy && <Spinner size={16} />}
              {busy ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Full name *</label>
              <input value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} placeholder="Your name" className={inputCls} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Mobile number *</label>
              <div className="flex">
                <span className="flex shrink-0 items-center rounded-l-[8px] border border-r-0 border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-600">
                  +880
                </span>
                <input
                  value={reg.mobile}
                  onChange={(e) => setReg({ ...reg, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="1XXXXXXXXX"
                  inputMode="numeric"
                  maxLength={10}
                  className="w-full rounded-r-[8px] border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                  required
                />
              </div>
              <p className="mt-1 text-sm text-zinc-400">Bangladesh numbers only — enter the 10 digits after +880.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Email *</label>
              <input
                type="email"
                value={reg.email}
                onChange={(e) => setReg({ ...reg, email: e.target.value })}
                placeholder="you@example.com"
                className={inputCls}
                required
              />
              <p className="mt-1 text-sm text-zinc-400">Used to recover your account if you forget your password.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Address</label>
              <input value={reg.address} onChange={(e) => setReg({ ...reg, address: e.target.value })} placeholder="House, road, area, city" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Password *</label>
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={reg.password}
                  onChange={(e) => setReg({ ...reg, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className={inputCls}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showRegPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={busy} className={btnCls}>
              {busy && <Spinner size={16} />}
              {busy ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

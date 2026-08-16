'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { apiResetPassword } from '@/lib/auth';
import Spinner from '@/components/Spinner';

const inputCls =
  'w-full rounded-[8px] border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10';
const btnCls =
  'w-full flex items-center justify-center gap-2 rounded-[8px] bg-[var(--btn-color)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-90 disabled:opacity-60';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!token || !email) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Invalid reset link</h1>
        <p className="mt-2 text-sm text-zinc-600">This password reset link is missing or malformed.</p>
        <Link
          href="/forgot-password"
          className="mt-6 rounded-[8px] bg-[var(--btn-color)] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-90"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-20 text-center">
        <FiCheckCircle size={56} className="text-emerald-500" />
        <h1 className="mt-4 text-2xl font-bold text-zinc-900">Password Reset!</h1>
        <p className="mt-2 text-sm text-zinc-600">Your password has been changed and you&apos;re signed in.</p>
        <button
          type="button"
          onClick={() => router.push('/account')}
          className="mt-6 rounded-[8px] bg-[var(--btn-color)] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-90"
        >
          Go to My Account
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      await apiResetPassword(email, token, password);
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-14">
      <div className="rounded-[8px] border border-zinc-200 bg-white p-8">
        <h1 className="text-xl font-bold text-zinc-900">Reset Password</h1>
        <p className="mt-1 text-sm text-zinc-500">Choose a new password for {email}.</p>

        {error && <p className="mt-4 rounded-[8px] bg-red-50 px-3 py-2 text-sm text-[var(--primary)]">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">New password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className={inputCls}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Confirm new password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className={inputCls}
              required
              minLength={6}
            />
          </div>
          <button type="submit" disabled={busy} className={btnCls}>
            {busy && <Spinner size={16} />}
            {busy ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-500">
          <Link href="/account" className="font-medium text-[var(--primary)] hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

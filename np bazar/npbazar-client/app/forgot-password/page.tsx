'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiMail } from 'react-icons/fi';
import { apiForgotPassword } from '@/lib/auth';
import Spinner from '@/components/Spinner';

const inputCls =
  'w-full rounded-[8px] border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10';
const btnCls =
  'w-full flex items-center justify-center gap-2 rounded-[8px] bg-[var(--btn-color)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-90 disabled:opacity-60';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'sent'>('request');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await apiForgotPassword(email.trim());
      setStep('sent');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (step === 'sent') {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-20 text-center">
        <FiMail size={56} className="text-[var(--primary)]" />
        <h1 className="mt-4 text-2xl font-bold text-zinc-900">Check your email</h1>
        <p className="mt-2 text-sm text-zinc-600">
          A password reset link has been sent to <span className="font-medium text-zinc-900">{email}</span>. The link is valid for 30 minutes.
        </p>
        <Link
          href="/account"
          className="mt-6 rounded-[8px] bg-[var(--btn-color)] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-90"
        >
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-14">
      <div className="rounded-[8px] border border-zinc-200 bg-white p-8">
        <h1 className="text-xl font-bold text-zinc-900">Forgot Password</h1>
        <p className="mt-1 text-sm text-zinc-500">Enter your account email and we&apos;ll send you a password reset link.</p>

        {error && <p className="mt-4 rounded-[8px] bg-red-50 px-3 py-2 text-sm text-[var(--primary)]">{error}</p>}

        <form onSubmit={handleRequest} className="mt-5 space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputCls}
              required
            />
          </div>
          <button type="submit" disabled={busy} className={btnCls}>
            {busy && <Spinner size={16} />}
            {busy ? 'Sending...' : 'Send Reset Link'}
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

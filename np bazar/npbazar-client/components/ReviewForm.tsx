'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiStar } from 'react-icons/fi';
import { getUser, subscribeAuth, authFetch, type AuthUser } from '@/lib/auth';
import Spinner from '@/components/Spinner';

interface Props {
  productId: string;
}

export default function ReviewForm({ productId }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const sync = () => setUser(getUser());
    sync();
    return subscribeAuth(sync);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!user) {
      setError('Please sign in to submit a review.');
      return;
    }
    if (!rating) {
      setError('Please select a star rating.');
      return;
    }

    setSubmitting(true);
    try {
      await authFetch(`/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      });
      setMessage('Thanks! Your review has been submitted.');
      setRating(0);
      setComment('');
      router.refresh(); // re-fetch the product's reviews/rating shown on this page
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-[8px] border border-zinc-200 bg-white p-6">
      <h3 className="inline-block border-b-2 border-[var(--primary)] pb-2 text-base font-bold text-zinc-900">Submit Your Review</h3>
      <p className="mt-3 text-sm text-zinc-500">Your email address will not be published. Required fields are marked *</p>

      <label className="mb-1.5 mt-4 block text-sm font-medium text-zinc-700">Write your opinion about the product</label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write Your Review Here..."
        rows={4}
        disabled={!user || submitting}
        className="w-full rounded-[8px] border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 disabled:bg-zinc-50"
      />

      <label className="mb-1.5 mt-4 block text-sm font-medium text-zinc-700">Your Rating:</label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!user || submitting}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            className="p-0.5 disabled:cursor-not-allowed"
          >
            <FiStar size={22} className={star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'} />
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-3 text-sm text-[var(--primary)]">
          {error}
          {!user && (
            <>
              {' '}
              <Link href="/account" className="font-semibold underline">Sign in</Link>
            </>
          )}
        </p>
      )}
      {message && <p className="mt-3 text-sm text-emerald-600">{message}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 flex items-center justify-center gap-2 rounded-[8px] bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
      >
        {submitting && <Spinner size={16} />}
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

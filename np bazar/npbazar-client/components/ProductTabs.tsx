'use client';

import { useState } from 'react';
import StarRating from '@/components/StarRating';
import type { Review } from '@/lib/api';

interface Props {
  description: string;
  reviews: Review[];
}

export default function ProductTabs({ description, reviews }: Props) {
  const [tab, setTab] = useState<'description' | 'reviews'>('description');

  const tabCls = (active: boolean) =>
    `rounded-[8px] px-4 py-2.5 text-sm font-semibold transition ${
      active ? 'bg-[var(--primary)] text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'
    }`;

  return (
    <div>
      <div className="flex gap-2 rounded-[8px] border border-zinc-200 bg-white p-1.5">
        <button type="button" onClick={() => setTab('description')} className={tabCls(tab === 'description')}>
          Description
        </button>
        <button type="button" onClick={() => setTab('reviews')} className={tabCls(tab === 'reviews')}>
          Customer Reviews ({reviews.length})
        </button>
      </div>

      <div className="mt-4 rounded-[8px] border border-zinc-200 bg-white p-6">
        {tab === 'description' ? (
          description ? (
            <div>
              <h3 className="mb-4 inline-block border-b-2 border-[var(--primary)] pb-2 text-base font-bold text-zinc-900">
                Product Details
              </h3>
              <div className="prose prose-sm prose-zinc max-w-none" dangerouslySetInnerHTML={{ __html: description }} />
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No description available.</p>
          )
        ) : reviews.length === 0 ? (
          <p className="text-sm text-zinc-400">No reviews yet. Be the first to review this product.</p>
        ) : (
          <div className="space-y-5">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-zinc-100 pb-5 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-900">{review.user?.name || 'Anonymous'}</p>
                  <span className="text-sm text-zinc-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-1.5">
                  <StarRating value={review.rating} size={14} />
                </div>
                {review.comment && <p className="mt-2 text-sm text-zinc-600">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { FiStar } from 'react-icons/fi';
import type { Review } from '@/lib/api';

interface Props {
  rating: number;
  reviews: Review[];
}

export default function RatingBreakdown({ rating, reviews }: Props) {
  const total = reviews.length;
  const recommended = reviews.filter((r) => r.rating >= 4).length;
  const recommendedPct = total > 0 ? Math.round((recommended / total) * 100) : 0;

  const counts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    return { star, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 };
  });

  return (
    <div className="rounded-[8px] border border-zinc-200 bg-white p-6">
      <div className="text-4xl font-bold text-zinc-900">{rating.toFixed(1)}</div>
      <p className="mt-1 text-sm font-medium text-zinc-500">Average Rating</p>
      <div className="mt-2 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <FiStar key={s} size={14} className={s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'} />
        ))}
        <span className="ml-1 text-sm text-zinc-400">({total} Review{total === 1 ? '' : 's'})</span>
      </div>

      {total > 0 && (
        <p className="mt-1 text-sm text-zinc-500">
          {recommendedPct}% Recommended <span className="text-zinc-400">({recommended} of {total})</span>
        </p>
      )}

      <div className="mt-4 space-y-1.5">
        {counts.map(({ star, pct }) => (
          <div key={star} className="flex items-center gap-2 text-sm">
            <span className="flex w-14 shrink-0 items-center gap-1 text-zinc-500">
              {star} <FiStar size={11} className="fill-amber-400 text-amber-400" />
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-[8px] bg-zinc-100">
              <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-9 shrink-0 text-right text-zinc-400">{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

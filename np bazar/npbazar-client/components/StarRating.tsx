import { FiStar } from 'react-icons/fi';

interface Props {
  value: number;
  size?: number;
}

export default function StarRating({ value, size = 16 }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={size}
          className={star <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}
        />
      ))}
    </div>
  );
}

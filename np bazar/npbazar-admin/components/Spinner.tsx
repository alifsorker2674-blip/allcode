interface Props {
  size?: number;
  className?: string;
}

/** Inline spinner that inherits the current text color (border-current) — drop
 * into any button in place of its icon while a submit/save/delete is in flight. */
export default function Spinner({ size = 16, className = '' }: Props) {
  return (
    <span
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

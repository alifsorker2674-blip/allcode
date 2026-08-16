'use client';

import { useEffect, useState } from 'react';

interface Props {
  max: number;
  valueMin: number;
  valueMax: number;
  /** Called when the user releases a thumb (not on every tick). */
  onCommit: (min: number, max: number) => void;
}

// Dual-thumb range slider built from two overlapping native range inputs,
// with the selected span filled in the theme's primary color.
export default function PriceRangeSlider({ max, valueMin, valueMax, onCommit }: Props) {
  const [lo, setLo] = useState(valueMin);
  const [hi, setHi] = useState(valueMax);

  // Keep local thumbs in sync when the URL changes externally (e.g. Clear All).
  useEffect(() => {
    setLo(valueMin);
    setHi(valueMax);
  }, [valueMin, valueMax]);

  const commit = () => onCommit(Math.min(lo, hi), Math.max(lo, hi));

  const loPct = (Math.min(lo, hi) / max) * 100;
  const hiPct = (Math.max(lo, hi) / max) * 100;

  const thumbCls =
    'pointer-events-none absolute inset-x-0 top-1/2 h-0 w-full -translate-y-1/2 appearance-none bg-transparent outline-none ' +
    '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 ' +
    '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full ' +
    '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--primary)] ' +
    '[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer ' +
    '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 ' +
    '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--primary)] ' +
    '[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:cursor-pointer';

  return (
    <div>
      <div className="relative h-5">
        {/* Track */}
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-[8px] bg-zinc-200" />
        {/* Filled span between the two thumbs */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-[8px] bg-[var(--primary)]"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type="range"
          min={0}
          max={max}
          value={lo}
          onChange={(e) => setLo(Number(e.target.value))}
          onMouseUp={commit}
          onTouchEnd={commit}
          onKeyUp={commit}
          aria-label="Minimum price"
          className={thumbCls}
        />
        <input
          type="range"
          min={0}
          max={max}
          value={hi}
          onChange={(e) => setHi(Number(e.target.value))}
          onMouseUp={commit}
          onTouchEnd={commit}
          onKeyUp={commit}
          aria-label="Maximum price"
          className={thumbCls}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-zinc-600">
        <span>৳{Math.min(lo, hi).toLocaleString()}</span>
        <span>৳{Math.max(lo, hi).toLocaleString()}</span>
      </div>
    </div>
  );
}

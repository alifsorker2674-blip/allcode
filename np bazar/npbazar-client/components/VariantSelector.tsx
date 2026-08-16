'use client';

import { useState } from 'react';
import type { Variant } from '@/lib/api';

export default function VariantSelector({ variants }: { variants: Variant[] }) {
  const [selected, setSelected] = useState<Record<string, string>>({});

  return (
    <div className="space-y-4">
      {variants.map((variant) => (
        <div key={variant.name}>
          <p className="mb-2 text-sm font-semibold text-zinc-800">{variant.name}</p>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => {
              const isSelected = selected[variant.name] === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelected((s) => ({ ...s, [variant.name]: option.value }))}
                  className={`rounded-[8px] border px-3 py-2 text-sm font-medium transition ${
                    isSelected
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'border-zinc-200 text-zinc-700 hover:border-zinc-300'
                  }`}
                >
                  {option.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

import type { ReactNode } from 'react';

import { cn } from '@/libs/utils';

/**
 * Card tints: a light gradient from the Zentro palette plus a thin accent bar.
 * Text stays on dark ink / 700-weight tones, so every pairing is >= 4.5:1.
 */
export const accents = {
  teal: { bg: 'linear-gradient(135deg,#E1F0EA 0%,#FFFFFF 85%)', bar: '#428475', border: '#C8E2D8' },
  mint: { bg: 'linear-gradient(135deg,#DDF6EB 0%,#FFFFFF 85%)', bar: '#6CC9A4', border: '#BFEBD7' },
  sand: { bg: 'linear-gradient(135deg,#FFF1DA 0%,#FFFFFF 85%)', bar: '#E0B36A', border: '#F3DFB8' },
  amber: { bg: 'linear-gradient(135deg,#FFEBC8 0%,#FFFFFF 85%)', bar: '#D99A2B', border: '#F2D6A0' },
  rose: { bg: 'linear-gradient(135deg,#FCE4E0 0%,#FFFFFF 85%)', bar: '#C0392B', border: '#F2C4BD' },
  slate: { bg: 'linear-gradient(135deg,#E3EAE7 0%,#FFFFFF 85%)', bar: '#1A312C', border: '#CBD6D1' },
} as const;

export type Accent = keyof typeof accents;

export default function TintedCard({
  accent = 'teal',
  className,
  children,
}: {
  accent?: Accent;
  className?: string;
  children: ReactNode;
}) {
  const a = accents[accent];

  return (
    <div
      className={cn('relative overflow-hidden rounded-xl border p-4 shadow-sm', className)}
      style={{ background: a.bg, borderColor: a.border }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: a.bar }}
      />
      {children}
    </div>
  );
}

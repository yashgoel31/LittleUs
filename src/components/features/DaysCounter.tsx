import React from 'react';
import { getDaysTogether } from '@/lib/utils';

interface DaysCounterProps {
  anniversaryDate: Date | string | null | undefined;
}

export function DaysCounter({ anniversaryDate }: DaysCounterProps) {
  const days = getDaysTogether(anniversaryDate);

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '2rem 1.5rem',
        background: 'radial-gradient(ellipse at center, rgba(253, 241, 239, 0.7) 0%, rgba(250, 247, 242, 0) 70%)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
      }}
    >
      <span
        style={{
          fontSize: '0.8125rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--text-accent)',
          fontWeight: 600,
        }}
      >
        Every Single Day
      </span>
      <div
        className="font-serif"
        style={{
          fontSize: '3.5rem',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          margin: '0.4rem 0',
        }}
      >
        {days > 0 ? days.toLocaleString() : '1'}
      </div>
      <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
        {days > 0 ? 'days of holding hands, growing, and loving' : 'Day one of your shared story'}
      </p>
    </div>
  );
}

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blush' | 'sage' | 'lavender' | 'neutral';
  className?: string;
}

export function Badge({ children, variant = 'blush', className }: BadgeProps) {
  const styles = {
    blush: { bg: 'var(--blush-100)', text: 'var(--blush-600)', border: 'var(--blush-200)' },
    sage: { bg: 'var(--sage-100)', text: 'var(--sage-500)', border: 'var(--sage-200)' },
    lavender: { bg: 'var(--lavender-100)', text: 'var(--lavender-500)', border: 'var(--lavender-200)' },
    neutral: { bg: 'var(--bg-secondary)', text: 'var(--text-secondary)', border: 'var(--border-medium)' },
  };

  const current = styles[variant];

  return (
    <span
      className={cn(className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.65rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        backgroundColor: current.bg,
        color: current.text,
        border: `1px solid ${current.border}`,
      }}
    >
      {children}
    </span>
  );
}

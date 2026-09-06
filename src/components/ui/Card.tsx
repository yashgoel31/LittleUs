import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'parchment' | 'blush';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  const bgStyles = {
    default: 'var(--bg-card)',
    parchment: 'var(--parchment-100)',
    blush: 'var(--blush-100)',
  };

  return (
    <div
      className={cn('surface-card', className)}
      style={{
        background: bgStyles[variant],
        padding: '1.5rem',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

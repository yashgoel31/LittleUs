import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div
      style={{
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        border: '1px dashed var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-bg-subtle)',
      }}
    >
      {icon && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-accent)',
            marginBottom: '1rem',
          }}
        >
          {icon}
        </div>
      )}
      <h3
        className="font-serif"
        style={{
          fontSize: '1.35rem',
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          marginBottom: '0.4rem',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.9375rem',
          color: 'var(--color-text-secondary)',
          maxWidth: '400px',
          margin: '0 auto 1.5rem auto',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

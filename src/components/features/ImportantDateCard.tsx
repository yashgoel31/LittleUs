'use client';

import React from 'react';
import { calculateDateMilestone } from '@/lib/utils';
import { deleteImportantDate } from '@/server/actions/dates';

export interface ImportantDateData {
  id: string;
  title: string;
  date: Date | string;
  description?: string | null;
  category?: string | null;
  isYearly: boolean;
  icon?: string | null;
  daysRemaining?: number;
  isToday?: boolean;
  isPast?: boolean;
  yearsPassed?: number;
  formattedTargetDate?: string;
}

interface ImportantDateCardProps {
  item: ImportantDateData;
  onEdit?: (item: ImportantDateData) => void;
  onRefresh?: () => void;
}

export function ImportantDateCard({ item, onEdit, onRefresh }: ImportantDateCardProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Recalculate milestone if not precalculated
  const milestone = calculateDateMilestone(item.date, item.isYearly);
  const daysRemaining = item.daysRemaining ?? milestone.daysRemaining;
  const isToday = item.isToday ?? milestone.isToday;
  const isPast = item.isPast ?? milestone.isPast;
  const yearsPassed = item.yearsPassed ?? milestone.yearsPassed;
  const formattedDate = item.formattedTargetDate ?? milestone.formattedTargetDate;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Remove milestone "${item.title}"?`)) return;
    setIsDeleting(true);
    await deleteImportantDate(item.id);
    onRefresh?.();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(item);
  };

  // Category Icons & Badges
  const categoryIcons: Record<string, string> = {
    anniversary: '💍',
    birthday: '🎂',
    first_date: '☕',
    custom: '✨',
  };

  const categoryLabels: Record<string, string> = {
    anniversary: 'Anniversary',
    birthday: 'Birthday',
    first_date: 'First Date',
    custom: 'Milestone',
  };

  const emoji = categoryIcons[item.category || 'custom'] || '✨';
  const categoryLabel = categoryLabels[item.category || 'custom'] || 'Milestone';

  return (
    <div
      className="surface-card"
      style={{
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        opacity: isDeleting ? 0.3 : 1,
        transition: 'all var(--duration-fast)',
      }}
    >
      {/* Left: Icon, Title, Description, & Date info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '220px' }}>
        <div
          style={{
            fontSize: '1.5rem',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'var(--color-accent-subtle)',
            border: '1px solid var(--color-accent-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {emoji}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <h3 className="font-serif" style={{ fontSize: '1.15rem', color: 'var(--color-text-primary)' }}>
              {item.title}
            </h3>
            <span
              style={{
                fontSize: '0.6875rem',
                padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-bg-subtle)',
                color: 'var(--color-text-tertiary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {categoryLabel}
            </span>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
            Next: <strong>{formattedDate}</strong>
            {item.isYearly && yearsPassed && yearsPassed > 0 && ` • Celebrating ${yearsPassed} yr${yearsPassed > 1 ? 's' : ''}`}
          </p>

          {item.description && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem', fontStyle: 'italic' }}>
              “{item.description}”
            </p>
          )}
        </div>
      </div>

      {/* Right: Countdown badge & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: isToday ? 'var(--color-accent)' : isPast ? 'var(--color-text-secondary)' : 'var(--color-accent)',
            }}
          >
            {isToday ? 'Today! 🎉' : isPast ? `${daysRemaining}d ago` : `in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`}
          </div>
          <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-tertiary)' }}>
            {isToday ? 'Celebration' : isPast ? 'Milestone passed' : 'Days remaining'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button
            type="button"
            onClick={handleEdit}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              color: 'var(--color-text-tertiary)',
              padding: '0.3rem',
            }}
            title="Edit milestone"
          >
            ✎
          </button>
          <button
            type="button"
            onClick={handleDelete}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              color: 'var(--color-text-tertiary)',
              padding: '0.3rem',
            }}
            title="Delete milestone"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

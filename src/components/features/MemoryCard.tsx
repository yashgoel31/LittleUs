'use client';

import React from 'react';
import { formatIntimateDate } from '@/lib/utils';
import { toggleFavoriteMemory, deleteMemory } from '@/server/actions/memories';
import { checkDeletionLock } from '@/lib/config/plans';

interface MemoryCardProps {
  memory: {
    id: string;
    title: string;
    content: string;
    date: Date | string;
    location?: string | null;
    photoUrls?: string[];
    isFavorite: boolean;
    createdAt?: Date | string;
    author: {
      name: string;
    };
  };
  onRefresh?: () => void;
}

export function MemoryCard({ memory, onRefresh }: MemoryCardProps) {
  const [isFav, setIsFav] = React.useState(memory.isFavorite);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const lock = checkDeletionLock(memory.createdAt);

  const handleToggleFav = async () => {
    setIsFav(!isFav);
    await toggleFavoriteMemory(memory.id);
    onRefresh?.();
  };

  const handleDelete = async () => {
    if (lock.isLocked) {
      alert(lock.formattedLockMessage);
      return;
    }
    if (!confirm('Are you sure you want to let go of this memory?')) return;
    setIsDeleting(true);
    const res = await deleteMemory(memory.id);
    if (!res.success) {
      alert(res.error || 'Unable to delete memory');
      setIsDeleting(false);
      return;
    }
    onRefresh?.();
  };

  return (
    <article
      className="surface-card"
      style={{
        padding: '1.5rem',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        opacity: isDeleting ? 0.4 : 1,
      }}
    >
      {/* Header: Date, Location & Favorite */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
            {formatIntimateDate(memory.date)}
          </span>
          {memory.location && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
              📍 {memory.location}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleToggleFav}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.1rem',
              color: isFav ? 'var(--text-accent)' : 'var(--border-medium)',
              transition: 'transform var(--transition-fast)',
            }}
            title={isFav ? 'Unfavorite' : 'Mark as favorite'}
          >
            {isFav ? '♥' : '♡'}
          </button>
          <button
            onClick={handleDelete}
            style={{
              background: 'none',
              border: 'none',
              cursor: lock.isLocked ? 'default' : 'pointer',
              fontSize: '0.8125rem',
              color: 'var(--text-tertiary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              padding: '0.2rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: lock.isLocked ? 'var(--bg-secondary)' : 'transparent',
            }}
            title={
              lock.isLocked
                ? `Protected: Locked for 21 days from creation (${lock.daysRemaining}d remaining)`
                : 'Delete memory'
            }
          >
            {lock.isLocked ? `🔒 ${lock.daysRemaining}d` : '✕'}
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-serif" style={{ fontSize: '1.35rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
        {memory.title}
      </h3>

      {/* Content */}
      <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
        {memory.content}
      </p>

      {/* Photos if any */}
      {memory.photoUrls && memory.photoUrls.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(memory.photoUrls.length, 3)}, 1fr)`,
            gap: '0.5rem',
            marginTop: '0.5rem',
          }}
        >
          {memory.photoUrls.map((url, i) => (
            <div
              key={i}
              style={{
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                aspectRatio: '4/3',
                background: 'var(--bg-secondary)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={memory.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Footer Author */}
      <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          Penned by {memory.author.name}
        </span>
      </div>
    </article>
  );
}

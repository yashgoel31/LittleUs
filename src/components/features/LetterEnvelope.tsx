'use client';

import React from 'react';
import { formatIntimateDate } from '@/lib/utils';
import { deleteLetter } from '@/server/actions/letters';
import { checkDeletionLock } from '@/lib/config/plans';

export interface OpenWhenLetterData {
  id: string;
  authorId?: string;
  title: string;
  situation: string;
  message?: string;
  content?: string;
  photoUrl?: string | null;
  isOpened: boolean;
  openedAt?: Date | string | null;
  createdAt: Date | string;
  author: {
    name: string;
  };
}

interface LetterEnvelopeProps {
  letter: OpenWhenLetterData;
  onOpen?: (letter: OpenWhenLetterData) => void;
  onEdit?: (letter: OpenWhenLetterData) => void;
  onRefresh?: () => void;
}

export function LetterEnvelope({ letter, onOpen, onEdit, onRefresh }: LetterEnvelopeProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const lock = checkDeletionLock(letter.createdAt);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lock.isLocked) {
      alert(lock.formattedLockMessage);
      return;
    }
    if (!confirm('Let go of this sealed envelope?')) return;
    setIsDeleting(true);
    const res = await deleteLetter(letter.id);
    if (!res.success) {
      alert(res.error || 'Unable to delete letter');
      setIsDeleting(false);
      return;
    }
    onRefresh?.();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(letter);
  };

  const isOpened = letter.isOpened;
  const displayTitle = letter.title || (letter.situation?.toLowerCase().startsWith('open when') ? letter.situation : `Open when ${letter.situation}`);

  return (
    <div
      onClick={() => onOpen?.(letter)}
      style={{
        borderRadius: 'var(--radius-md)',
        background: isOpened
          ? 'var(--color-bg-surface)'
          : 'linear-gradient(160deg, #FBF6F3 0%, #F5EAE4 100%)',
        border: isOpened ? '1px solid var(--color-border-subtle)' : '1px solid #E6D2C8',
        padding: '1.75rem 1.5rem',
        boxShadow: isOpened ? 'var(--shadow-subtle)' : 'var(--shadow-card)',
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '220px',
        transition: 'all var(--duration-normal) var(--ease-soft)',
        opacity: isDeleting ? 0.3 : 1,
      }}
      title="Click to open envelope"
    >
      {/* Top Envelope Flap Silhouette */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(188, 93, 84, 0.25), transparent)',
        }}
      />

      {/* Header: Seal / Status Tag & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {/* Digital Wax Seal Badge */}
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: isOpened ? 'var(--color-bg-subtle)' : 'var(--color-accent)',
              color: isOpened ? 'var(--color-text-tertiary)' : '#FFFFFF',
              border: isOpened ? '1px solid var(--color-border-default)' : '1px solid rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              boxShadow: isOpened ? 'none' : '0 1px 3px rgba(188, 93, 84, 0.3)',
            }}
          >
            {isOpened ? '✓' : '♥'}
          </div>

          <span
            style={{
              fontSize: '0.6875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
              color: isOpened ? 'var(--color-text-tertiary)' : 'var(--color-accent)',
            }}
          >
            {isOpened ? 'Envelope Opened' : 'Sealed with Wax'}
          </span>
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={handleEdit}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              color: 'var(--color-text-tertiary)',
              padding: '0.2rem',
            }}
            title="Edit letter"
          >
            ✎
          </button>
          <button
            type="button"
            onClick={handleDelete}
            style={{
              background: 'none',
              border: 'none',
              cursor: lock.isLocked ? 'default' : 'pointer',
              fontSize: '0.75rem',
              color: 'var(--color-text-tertiary)',
              padding: '0.2rem 0.35rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.15rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: lock.isLocked ? 'rgba(0,0,0,0.04)' : 'transparent',
            }}
            title={
              lock.isLocked
                ? `Protected: Locked for 21 days from creation (${lock.daysRemaining}d remaining)`
                : 'Delete letter'
            }
          >
            {lock.isLocked ? `🔒 ${lock.daysRemaining}d` : '✕'}
          </button>
        </div>
      </div>

      {/* Main Title Prompt */}
      <div style={{ margin: '0.75rem 0' }}>
        <h3
          className="font-serif"
          style={{
            fontSize: '1.4rem',
            lineHeight: 1.35,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {displayTitle}
        </h3>
        {letter.photoUrl && (
          <span style={{ display: 'inline-block', fontSize: '0.75rem', color: 'var(--color-accent)', marginTop: '0.35rem' }}>
            📷 Contains a photo keepsake
          </span>
        )}
      </div>

      {/* Footer Details */}
      <div
        style={{
          borderTop: '1px solid var(--color-border-subtle)',
          paddingTop: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--color-text-tertiary)',
          marginTop: 'auto',
        }}
      >
        <span>From {letter.author.name}</span>
        <span>
          {isOpened && letter.openedAt ? `Opened ${formatIntimateDate(letter.openedAt)}` : 'Tap to break seal →'}
        </span>
      </div>
    </div>
  );
}

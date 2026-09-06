'use client';

import React from 'react';
import { formatIntimateDate, formatRelativeTime } from '@/lib/utils';
import { togglePinLoveNote, deleteLoveNote } from '@/server/actions/loveNotes';
import { IconPin } from '@/components/ui/Icons';

export interface LoveNoteData {
  id: string;
  authorId?: string;
  content: string;
  style?: string | null;
  color?: string | null;
  noteDate?: Date | string | null;
  recipient?: string | null;
  isPinned: boolean;
  readAt?: Date | string | null;
  createdAt: Date | string;
  author: {
    name: string;
  };
}

interface LoveNoteCardProps {
  note: LoveNoteData;
  onRefresh?: () => void;
  onView?: (note: LoveNoteData) => void;
  onEdit?: (note: LoveNoteData) => void;
}

export const NOTE_STYLES = {
  blush: {
    id: 'blush',
    name: 'Rose Blush',
    bg: '#FAF2F0',
    border: '#F4D8D2',
    text: '#4F2925',
    tag: 'var(--color-accent)',
  },
  parchment: {
    id: 'parchment',
    name: 'Warm Parchment',
    bg: '#F9F5EB',
    border: '#EFE4CD',
    text: '#4B3E29',
    tag: '#8C683B',
  },
  sage: {
    id: 'sage',
    name: 'Muted Sage',
    bg: '#F2F6F1',
    border: '#DCE6D9',
    text: '#2F4229',
    tag: '#5B7652',
  },
  lavender: {
    id: 'lavender',
    name: 'Soft Lavender',
    bg: '#F5F3F8',
    border: '#E5E0F0',
    text: '#39324C',
    tag: '#71658E',
  },
  letterpress: {
    id: 'letterpress',
    name: 'Letterpress Minimal',
    bg: '#FFFFFF',
    border: 'var(--color-border-default)',
    text: 'var(--color-text-primary)',
    tag: 'var(--color-text-secondary)',
  },
};

export function LoveNoteCard({ note, onRefresh, onView, onEdit }: LoveNoteCardProps) {
  const [isPinned, setIsPinned] = React.useState(note.isPinned);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const currentStyleKey = (note.style || note.color || 'blush') as keyof typeof NOTE_STYLES;
  const scheme = NOTE_STYLES[currentStyleKey] || NOTE_STYLES.blush;

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinned(!isPinned);
    await togglePinLoveNote(note.id);
    onRefresh?.();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Let go of this note?')) return;
    setIsDeleting(true);
    await deleteLoveNote(note.id);
    onRefresh?.();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(note);
  };

  const displayDateStr = note.noteDate ? formatIntimateDate(note.noteDate) : formatRelativeTime(note.createdAt);

  return (
    <article
      onClick={() => onView?.(note)}
      style={{
        backgroundColor: scheme.bg,
        border: `1px solid ${scheme.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '200px',
        boxShadow: isPinned ? 'var(--shadow-raised)' : 'var(--shadow-card)',
        transform: isPinned ? 'rotate(-0.5deg)' : 'none',
        transition: 'transform var(--duration-fast) var(--ease-soft), box-shadow var(--duration-fast)',
        cursor: 'pointer',
        opacity: isDeleting ? 0.3 : 1,
      }}
      title="Click to view full note"
    >
      {/* Top Header: Recipient, Pin Status, and Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div>
          {note.recipient ? (
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
                color: scheme.tag,
              }}
            >
              For {note.recipient}
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
                color: scheme.tag,
                opacity: 0.8,
              }}
            >
              Personal Note
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={handleTogglePin}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isPinned ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center',
              opacity: isPinned ? 1 : 0.5,
            }}
            title={isPinned ? 'Unpin note' : 'Pin to top'}
          >
            <IconPin size={14} />
          </button>

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
            title="Edit note"
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
              fontSize: '0.75rem',
              color: 'var(--color-text-tertiary)',
              padding: '0.2rem',
            }}
            title="Delete note"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Message Body (Whitespace & Literary Typography) */}
      <div style={{ margin: '0.5rem 0 1.25rem 0' }}>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.2rem',
            lineHeight: 1.55,
            color: scheme.text,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          “{note.content}”
        </p>
      </div>

      {/* Footer Details: Author & Date */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--color-text-tertiary)',
          borderTop: `1px dashed ${scheme.border}`,
          paddingTop: '0.65rem',
          marginTop: 'auto',
        }}
      >
        <span>From {note.author.name}</span>
        <span>{displayDateStr}</span>
      </div>
    </article>
  );
}

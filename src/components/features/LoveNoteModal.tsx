'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconClose, IconPin } from '@/components/ui/Icons';
import { LoveNoteData, NOTE_STYLES } from './LoveNoteCard';
import { createLoveNote, updateLoveNote } from '@/server/actions/loveNotes';
import { formatIntimateDate } from '@/lib/utils';

interface LoveNoteModalProps {
  mode: 'create' | 'edit' | 'view';
  note?: LoveNoteData | null;
  onClose: () => void;
  onSuccess: () => void;
  partnerName?: string;
}

export function LoveNoteModal({ mode, note, onClose, onSuccess, partnerName }: LoveNoteModalProps) {
  const [content, setContent] = useState(note?.content || '');
  const [style, setStyle] = useState<string>(note?.style || note?.color || 'blush');
  const [noteDate, setNoteDate] = useState(
    note?.noteDate ? new Date(note.noteDate).toISOString().split('T')[0] : ''
  );
  const [recipient, setRecipient] = useState(note?.recipient || '');
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (note) {
      setContent(note.content);
      setStyle(note.style || note.color || 'blush');
      setNoteDate(note.noteDate ? new Date(note.noteDate).toISOString().split('T')[0] : '');
      setRecipient(note.recipient || '');
      setIsPinned(note.isPinned);
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setError(null);
    setLoading(true);

    const payload = {
      content: content.trim(),
      style,
      noteDate: noteDate || null,
      recipient: recipient.trim() || null,
      isPinned,
    };

    let res;
    if (mode === 'edit' && note) {
      res = await updateLoveNote(note.id, payload);
    } else {
      res = await createLoveNote(payload);
    }

    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Failed to save note');
    }
  };

  const currentScheme = NOTE_STYLES[style as keyof typeof NOTE_STYLES] || NOTE_STYLES.blush;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(43, 36, 33, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'view' ? 'Love note' : 'Write love note'}
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: mode === 'view' ? currentScheme.bg : 'var(--color-bg-surface)',
          border: `1px solid ${mode === 'view' ? currentScheme.border : 'var(--color-border-default)'}`,
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-raised)',
          padding: '2rem 1.75rem',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close note"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-tertiary)',
            cursor: 'pointer',
            padding: '0.35rem',
          }}
          title="Close"
        >
          <IconClose size={18} />
        </button>

        {/* ===============================================================
            VIEW MODE: Focused physical letter reading experience
            =============================================================== */}
        {mode === 'view' && note ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                  color: currentScheme.tag,
                }}
              >
                {note.recipient ? `For ${note.recipient}` : 'Personal Note'}
              </span>
              {note.isPinned && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-accent)' }}>
                  <IconPin size={13} /> Pinned
                </span>
              )}
            </div>

            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.45rem',
                lineHeight: 1.6,
                color: currentScheme.text,
                margin: '1.5rem 0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              “{note.content}”
            </p>

            <div
              style={{
                borderTop: `1px dashed ${currentScheme.border}`,
                paddingTop: '1rem',
                marginTop: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8125rem',
                color: 'var(--color-text-tertiary)',
              }}
            >
              <span>Penned by {note.author.name}</span>
              <span>{note.noteDate ? formatIntimateDate(note.noteDate) : formatIntimateDate(note.createdAt)}</span>
            </div>
          </div>
        ) : (
          /* ===============================================================
             CREATE / EDIT MODE
             =============================================================== */
          <div>
            <h2 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>
              {mode === 'edit' ? 'Edit Love Note' : 'Write a Love Note'}
            </h2>
            <p style={{ fontSize: '0.84375rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Leave a quiet thought or loving whisper on the desk.
            </p>

            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-tint-rose)',
                  color: 'var(--color-accent-hover)',
                  fontSize: '0.84375rem',
                  marginBottom: '1.25rem',
                  border: '1px solid var(--color-tint-rose-border)',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Message field */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="input-label">Message</label>
                <textarea
                  required
                  rows={4}
                  className="input-field"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="I was just thinking about the way you smiled when we walked through the garden..."
                  style={{
                    resize: 'vertical',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.05rem',
                    lineHeight: 1.5,
                  }}
                  autoFocus
                />
              </div>

              {/* Optional Recipient & Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Input
                  label="Recipient (Optional)"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder={partnerName ? `e.g. ${partnerName}` : 'e.g. My Honey'}
                />

                <Input
                  label="Date on Note (Optional)"
                  type="date"
                  value={noteDate}
                  onChange={(e) => setNoteDate(e.target.value)}
                />
              </div>

              {/* Presentation Style Picker */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="input-label" style={{ marginBottom: '0.5rem' }}>
                  Paper Presentation Style
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.5rem' }}>
                  {Object.values(NOTE_STYLES).map((s) => {
                    const isSelected = style === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStyle(s.id)}
                        style={{
                          padding: '0.5rem 0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: s.bg,
                          border: isSelected ? '2px solid var(--color-accent)' : `1px solid ${s.border}`,
                          color: s.text,
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'center',
                          boxShadow: isSelected ? 'var(--shadow-subtle)' : 'none',
                        }}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pin checkbox & actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8125rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                  />
                  <span>Pin to top of desk</span>
                </label>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <Button type="button" variant="secondary" onClick={onClose} size="sm">
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={loading} size="sm">
                    {mode === 'edit' ? 'Update Note' : 'Pin Note 📌'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

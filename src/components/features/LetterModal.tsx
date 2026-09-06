'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconClose } from '@/components/ui/Icons';
import { OpenWhenLetterData } from './LetterEnvelope';
import { createOpenWhenLetter, updateOpenWhenLetter, openLetter } from '@/server/actions/letters';
import { formatIntimateDate } from '@/lib/utils';

interface LetterModalProps {
  mode: 'open' | 'create' | 'edit';
  letter?: OpenWhenLetterData | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TITLE_SUGGESTIONS = [
  "Open when you're sad",
  'Open when you miss me',
  'Open when you need a smile',
  'Open on our anniversary',
  "Open when you can't sleep",
  'Open when we had a silly fight',
];

export function LetterModal({ mode, letter, onClose, onSuccess }: LetterModalProps) {
  // Form states
  const [title, setTitle] = useState(letter?.title || letter?.situation || '');
  const [message, setMessage] = useState(letter?.message || letter?.content || '');
  const [photoUrl, setPhotoUrl] = useState(letter?.photoUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Opening animation states
  const [isSealed, setIsSealed] = useState(!letter?.isOpened);
  const [isUnsealing, setIsUnsealing] = useState(false);
  const [revealedMessage, setRevealedMessage] = useState(letter?.message || letter?.content || '');

  useEffect(() => {
    if (letter) {
      setTitle(letter.title || letter.situation || '');
      setMessage(letter.message || letter.content || '');
      setPhotoUrl(letter.photoUrl || '');
      setIsSealed(!letter.isOpened);
      setRevealedMessage(letter.message || letter.content || '');
    }
  }, [letter]);

  // Handle Breaking Seal & Opening
  const handleBreakSeal = async () => {
    if (!letter) return;
    setIsUnsealing(true);

    const res = await openLetter(letter.id);
    setIsUnsealing(false);

    if (res.success && res.letter) {
      setIsSealed(false);
      setRevealedMessage(res.letter.content || res.letter.message || '');
      onSuccess();
    } else {
      setError(res.error || 'Failed to open letter');
    }
  };

  // Handle Create or Edit submission
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setError(null);
    setLoading(true);

    const payload = {
      title: title.trim(),
      message: message.trim(),
      photoUrl: photoUrl.trim() || null,
    };

    let res;
    if (mode === 'edit' && letter) {
      res = await updateOpenWhenLetter(letter.id, payload);
    } else {
      res = await createOpenWhenLetter(payload);
    }

    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Failed to save envelope');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(43, 36, 33, 0.45)',
        backdropFilter: 'blur(5px)',
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
        aria-labelledby="letter-modal-title"
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: mode === 'open' ? '#FCF9F6' : 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-raised)',
          padding: '2.25rem 2rem',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close letter"
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
        >
          <IconClose size={18} />
        </button>

        {/* ===============================================================
            OPENING INTERACTION & READER
            =============================================================== */}
        {mode === 'open' && letter ? (
          <div>
            {isSealed ? (
              /* Sealed Envelope State */
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-accent)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                    margin: '0 auto 1.5rem auto',
                    boxShadow: '0 4px 14px rgba(188, 93, 84, 0.35)',
                    transform: isUnsealing ? 'scale(0.95)' : 'none',
                    transition: 'transform var(--duration-fast)',
                  }}
                >
                  ♥
                </div>

                <span
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--color-accent)',
                    fontWeight: 600,
                  }}
                >
                  Wax Sealed Envelope
                </span>

                <h2
                  className="font-serif"
                  style={{
                    fontSize: '2rem',
                    lineHeight: 1.3,
                    color: 'var(--color-text-primary)',
                    marginTop: '0.5rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  {letter.title || `Open when ${letter.situation}`}
                </h2>

                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                  Penned with care by <strong>{letter.author.name}</strong>
                </p>

                <Button
                  onClick={handleBreakSeal}
                  isLoading={isUnsealing}
                  style={{ padding: '0.75rem 2rem', fontSize: '0.9375rem' }}
                >
                  Break the Wax Seal & Read
                </Button>

                <div style={{ marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-ghost"
                    style={{ fontSize: '0.8125rem' }}
                  >
                    Keep sealed for later
                  </button>
                </div>
              </div>
            ) : (
              /* Opened Letter / Stationery View */
              <div
                className="animate-fade-in"
                style={{
                  background: 'var(--color-bg-surface)',
                  padding: '2rem 1.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  boxShadow: 'var(--shadow-subtle)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--color-accent)',
                      fontWeight: 600,
                    }}
                  >
                    ✉️ {letter.title || `Open when ${letter.situation}`}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                    From {letter.author.name}
                  </span>
                </div>

                {/* Letter Content */}
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.35rem',
                    lineHeight: 1.65,
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    marginBottom: '1.5rem',
                  }}
                >
                  {revealedMessage}
                </p>

                {/* Optional Photo Keepsake */}
                {letter.photoUrl && (
                  <div
                    style={{
                      marginTop: '1.5rem',
                      marginBottom: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: '1px solid var(--color-border-default)',
                      background: 'var(--color-bg-subtle)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={letter.photoUrl}
                      alt={letter.title}
                      style={{
                        width: '100%',
                        maxHeight: '340px',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>
                )}

                {/* Footer and Return Action */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '2rem',
                    paddingTop: '1rem',
                    borderTop: '1px dashed var(--color-border-default)',
                    fontSize: '0.8125rem',
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  <span>
                    {letter.openedAt ? `Opened ${formatIntimateDate(letter.openedAt)}` : 'Opened today'}
                  </span>
                  <Button variant="secondary" onClick={onClose} size="sm">
                    Close & return to collection
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ===============================================================
             CREATE / EDIT ENVELOPE FORM
             =============================================================== */
          <div>
            <h2 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>
              {mode === 'edit' ? 'Edit Digital Envelope' : 'Seal an “Open When” Letter'}
            </h2>
            <p style={{ fontSize: '0.84375rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Write a letter for when they miss you, need courage, or on a special milestone.
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

            <form onSubmit={handleSubmitForm}>
              {/* Title input */}
              <Input
                label="Envelope Title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Open when you miss me"
                autoFocus
              />

              {/* Suggestions row */}
              <div style={{ marginTop: '-0.75rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', display: 'block', marginBottom: '0.35rem' }}>
                  Or choose a prompt:
                </span>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {TITLE_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setTitle(suggestion)}
                      style={{
                        padding: '0.25rem 0.6rem',
                        fontSize: '0.75rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-bg-subtle)',
                        border: '1px solid var(--color-border-subtle)',
                        color: 'var(--color-text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message body */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="input-label">Message inside the letter</label>
                <textarea
                  required
                  rows={5}
                  className="input-field"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="My love, take a slow breath. Remember that I am thinking of you right now..."
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.05rem',
                    lineHeight: 1.5,
                  }}
                />
              </div>

              {/* Optional Photo URL */}
              <Input
                label="Optional Photo Keepsake Link"
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... (optional)"
                hint="A photo tucked inside the envelope to surprise them"
              />

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={loading}>
                  {mode === 'edit' ? 'Update Envelope' : 'Apply Wax Seal & Stash'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

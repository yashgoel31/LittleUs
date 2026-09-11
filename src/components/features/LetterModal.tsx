'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconClose } from '@/components/ui/Icons';
import { OpenWhenLetterData } from './LetterEnvelope';
import { PhotoUploader } from '@/components/features/PhotoUploader';
import { createOpenWhenLetter, updateOpenWhenLetter, openLetter } from '@/server/actions/letters';
import { getCoupleOverview } from '@/server/actions/couple';
import { PlanTier } from '@/lib/config/plans';
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
  const [tier, setTier] = useState<PlanTier>('FREE');

  // Animation states
  const [isSealed, setIsSealed] = useState(!letter?.isOpened);
  const [isUnsealing, setIsUnsealing] = useState(false);
  const [unsealStep, setUnsealStep] = useState<'idle' | 'cracking' | 'opening' | 'revealed'>('idle');
  const [isSealing, setIsSealing] = useState(false);
  const [sealSuccess, setSealSuccess] = useState(false);
  const [revealedMessage, setRevealedMessage] = useState(letter?.message || letter?.content || '');

  useEffect(() => {
    getCoupleOverview().then((res) => {
      if (res?.currentAuth?.tier) {
        setTier(res.currentAuth.tier);
      }
    });
  }, []);

  useEffect(() => {
    if (letter) {
      setTitle(letter.title || letter.situation || '');
      setMessage(letter.message || letter.content || '');
      setPhotoUrl(letter.photoUrl || '');
      setIsSealed(!letter.isOpened);
      setRevealedMessage(letter.message || letter.content || '');
    }
  }, [letter]);

  // Handle Breaking Seal & Opening with Cinematic Animation
  const handleBreakSeal = async () => {
    if (!letter) return;
    setIsUnsealing(true);
    setUnsealStep('cracking');

    // Start server request in background
    const openPromise = openLetter(letter.id);

    // Sequence 1: Wax cracks (0 - 500ms)
    setTimeout(() => {
      setUnsealStep('opening');
    }, 550);

    // Sequence 2: Envelope unfolds & letter glides up (550ms - 1100ms)
    setTimeout(async () => {
      const res = await openPromise;
      setIsUnsealing(false);
      setUnsealStep('revealed');

      if (res.success && res.letter) {
        setIsSealed(false);
        setRevealedMessage(res.letter.content || res.letter.message || '');
        onSuccess();
      } else {
        setError(res.error || 'Failed to open letter');
        setUnsealStep('idle');
      }
    }, 1100);
  };

  // Handle Create or Edit submission with Sealing Animation
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

    if (mode === 'create') {
      setIsSealing(true);
    }

    try {
      const res =
        mode === 'edit' && letter
          ? await updateOpenWhenLetter(letter.id, payload)
          : await createOpenWhenLetter(payload);

      if (res.success) {
        if (mode === 'create') {
          setSealSuccess(true);
          setTimeout(() => {
            setLoading(false);
            setIsSealing(false);
            onSuccess();
            onClose();
          }, 1100);
        } else {
          setLoading(false);
          onSuccess();
          onClose();
        }
      } else {
        setLoading(false);
        setIsSealing(false);
        setError(res.error || 'Failed to save envelope');
      }
    } catch {
      setLoading(false);
      setIsSealing(false);
      setError('An error occurred while sealing envelope.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(43, 36, 33, 0.45)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={!isSealing && !isUnsealing ? onClose : undefined}
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
        {/* Close Button (disabled during sealing / unsealing animations) */}
        {!isSealing && !isUnsealing && (
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
        )}

        {/* ===============================================================
            ANIMATION: WAX SEALING ENVELOPE (When creating new letter)
            =============================================================== */}
        {isSealing ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }} className="animate-fade-in">
            {/* Animated Envelope Visual */}
            <div
              style={{
                width: '160px',
                height: '110px',
                margin: '0 auto 1.75rem auto',
                position: 'relative',
                background: 'linear-gradient(145deg, #FBF4EE 0%, #EFE1D6 100%)',
                borderRadius: '8px',
                border: '1px solid #DCC4B6',
                boxShadow: '0 8px 24px rgba(60, 40, 30, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Envelope Flap Silhouette */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '55px',
                  background: 'linear-gradient(180deg, #F2E3D5 0%, #E7D2C0 100%)',
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  borderTop: '1px solid #DCC4B6',
                  transformOrigin: 'top',
                  animation: 'flapClose 0.4s ease-out forwards',
                }}
              />

              {/* Molten Wax Pour & Stamp */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  width: '46px',
                  height: '46px',
                  borderRadius: '48% 52% 51% 49% / 53% 47% 53% 47%',
                  background: 'radial-gradient(circle at 35% 35%, #D46B62 0%, #A9433B 70%, #7E2822 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(169, 67, 59, 0.45)',
                  animation: 'stampDrop 0.6s 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                }}
              >
                ♥
              </div>
            </div>

            <h3 className="font-serif" style={{ fontSize: '1.35rem', color: 'var(--color-text-primary)' }}>
              {sealSuccess ? 'Enveloped & Sealed With Love ✨' : 'Applying Hot Wax Seal...'}
            </h3>
            <p style={{ fontSize: '0.84375rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
              {sealSuccess
                ? 'Your letter is safely tucked into the chest.'
                : 'Folding the stationery and stamping your private envelope.'}
            </p>
          </div>
        ) : mode === 'open' && letter ? (
          <div>
            {isSealed ? (
              /* Sealed Envelope State with Interactive Unsealing Animation */
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                {/* Envelope Container with Wax Seal */}
                <div
                  style={{
                    position: 'relative',
                    width: '180px',
                    height: '120px',
                    margin: '0 auto 1.5rem auto',
                    background: 'linear-gradient(145deg, #FAF4EF 0%, #F0E3D7 100%)',
                    borderRadius: '8px',
                    border: '1px solid #DFCCBF',
                    boxShadow: '0 8px 24px rgba(60, 40, 30, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: unsealStep === 'opening' ? 'visible' : 'hidden',
                  }}
                >
                  {/* Flap that opens */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '60px',
                      background: 'linear-gradient(180deg, #F3E4D6 0%, #E8D4C3 100%)',
                      clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                      transformOrigin: 'top',
                      transition: 'transform 0.5s ease-in-out',
                      transform: unsealStep === 'opening' ? 'rotateX(180deg)' : 'rotateX(0deg)',
                      zIndex: 1,
                    }}
                  />

                  {/* Letter paper sliding up when unsealed */}
                  {unsealStep === 'opening' && (
                    <div
                      style={{
                        position: 'absolute',
                        width: '140px',
                        height: '90px',
                        background: '#FFFFFF',
                        border: '1px solid #EAE0D7',
                        borderRadius: '4px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        zIndex: 2,
                        animation: 'letterSlideUp 0.6s ease-out forwards',
                      }}
                    />
                  )}

                  {/* Organic Wax Seal Badge with Crack & Break Animation */}
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {unsealStep === 'cracking' || unsealStep === 'opening' ? (
                      /* Cracking Wax Seal Split in Two Halves */
                      <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                        {/* Left half */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '28px',
                            height: '56px',
                            overflow: 'hidden',
                            animation: 'waxSplitLeft 0.5s ease-out forwards',
                          }}
                        >
                          <div
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '48% 52% 51% 49% / 53% 47% 53% 47%',
                              background: 'radial-gradient(circle at 35% 35%, #D46B62 0%, #A9433B 70%, #7E2822 100%)',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.5rem',
                              fontWeight: 700,
                            }}
                          >
                            ♥
                          </div>
                        </div>

                        {/* Right half */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '28px',
                            height: '56px',
                            overflow: 'hidden',
                            animation: 'waxSplitRight 0.5s ease-out forwards',
                          }}
                        >
                          <div
                            style={{
                              width: '56px',
                              height: '56px',
                              marginLeft: '-28px',
                              borderRadius: '48% 52% 51% 49% / 53% 47% 53% 47%',
                              background: 'radial-gradient(circle at 35% 35%, #D46B62 0%, #A9433B 70%, #7E2822 100%)',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.5rem',
                              fontWeight: 700,
                            }}
                          >
                            ♥
                          </div>
                        </div>

                        {/* White fracture glow line */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: '27px',
                            width: '2px',
                            height: '56px',
                            background: '#FFFFFF',
                            boxShadow: '0 0 8px #FFF',
                            animation: 'flashLine 0.3s ease-out forwards',
                          }}
                        />
                      </div>
                    ) : (
                      /* Whole Solid Wax Seal */
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '48% 52% 51% 49% / 53% 47% 53% 47%',
                          background: 'radial-gradient(circle at 35% 35%, #D46B62 0%, #A9433B 70%, #7E2822 100%)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          boxShadow: '0 4px 16px rgba(169, 67, 59, 0.45)',
                          transition: 'transform var(--duration-fast)',
                          cursor: 'pointer',
                        }}
                        onClick={handleBreakSeal}
                        title="Click to break wax seal"
                      >
                        ♥
                      </div>
                    )}
                  </div>
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
                  {isUnsealing ? 'Breaking Seal & Unfolding...' : 'Wax Sealed Envelope'}
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    paddingBottom: '0.75rem',
                  }}
                >
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

                {/* Optional Photo Keepsake (From Cloudinary or URL) */}
                {letter.photoUrl && (
                  <div
                    style={{
                      marginTop: '1.5rem',
                      marginBottom: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: '1px solid var(--color-border-default)',
                      background: 'var(--color-bg-subtle)',
                      boxShadow: 'var(--shadow-subtle)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={letter.photoUrl}
                      alt={letter.title || 'Keepsake photo'}
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
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-tertiary)',
                    display: 'block',
                    marginBottom: '0.35rem',
                  }}
                >
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

              {/* Photo Keepsake Uploader with Cloudinary & Package Limits */}
              <PhotoUploader
                photos={photoUrl ? [photoUrl] : []}
                onChange={(urls) => setPhotoUrl(urls[urls.length - 1] || '')}
                tier={tier}
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

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconClose } from '@/components/ui/Icons';
import { getShareSettings, updateShareSettings } from '@/server/actions/share';

interface ShareModalProps {
  onClose: () => void;
}

export function ShareModal({ onClose }: ShareModalProps) {
  const [slug, setSlug] = useState('');
  const [isShareEnabled, setIsShareEnabled] = useState(true);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [shareShowMemories, setShareShowMemories] = useState(true);
  const [shareShowNotes, setShareShowNotes] = useState(true);
  const [shareShowLetters, setShareShowLetters] = useState(true);
  const [shareShowDates, setShareShowDates] = useState(true);

  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Derive full URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${baseUrl}/us/${slug}`;
  const canNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share);

  useEffect(() => {
    async function load() {
      try {
        const settings = await getShareSettings();
        setSlug(settings.slug);
        setIsShareEnabled(settings.isShareEnabled);
        setIsPasswordProtected(settings.isPasswordProtected);
        setShareShowMemories(settings.shareShowMemories);
        setShareShowNotes(settings.shareShowNotes);
        setShareShowLetters(settings.shareShowLetters);
        setShareShowDates(settings.shareShowDates);
      } finally {
        setLoadingSettings(false);
      }
    }
    load();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Our Little Us World',
          text: 'Take a quiet peek into our private little world.',
          url: shareUrl,
        });
      } catch {
        // user cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await updateShareSettings({
      isShareEnabled,
      shareShowMemories,
      shareShowNotes,
      shareShowLetters,
      shareShowDates,
      passcode: isPasswordProtected && passcode.trim() ? passcode.trim() : null,
      removePasscode: !isPasswordProtected,
    });

    setSaving(false);

    if (res.success) {
      setMessage('Sharing preferences saved.');
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage(res.error || 'Failed to save settings');
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
        aria-labelledby="share-modal-title"
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-raised)',
          padding: '2rem 1.75rem',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close share controls"
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

        <h2 id="share-modal-title" className="font-serif" style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>
          Share our little world
        </h2>
        <p style={{ fontSize: '0.84375rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          Give trusted loved ones a quiet window into your story.
        </p>

        {loadingSettings ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            Loading sharing details...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Share Link Tray */}
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Your Unique Share URL
              </span>

              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  wordBreak: 'break-all',
                  marginBottom: '0.75rem',
                }}
              >
                {shareUrl}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleCopy}
                  style={{ flex: 1 }}
                >
                  {copied ? '✓ Copied to clipboard' : 'Copy Link'}
                </Button>

                {canNativeShare && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleNativeShare}
                    style={{ flex: 1 }}
                  >
                    Share link ↗
                  </Button>
                )}
              </div>
            </div>

            {/* Sharing Controls Form */}
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1.25rem' }}>
                <label className="input-label" style={{ marginBottom: '0.65rem' }}>
                  What should visitors see?
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isShareEnabled}
                      onChange={(e) => setIsShareEnabled(e.target.checked)}
                    />
                    <span>Allow public page sharing (/us/{slug})</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={shareShowMemories}
                      disabled={!isShareEnabled}
                      onChange={(e) => setShareShowMemories(e.target.checked)}
                    />
                    <span>Show selected memories & photos</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={shareShowNotes}
                      disabled={!isShareEnabled}
                      onChange={(e) => setShareShowNotes(e.target.checked)}
                    />
                    <span>Show love notes</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={shareShowLetters}
                      disabled={!isShareEnabled}
                      onChange={(e) => setShareShowLetters(e.target.checked)}
                    />
                    <span>Show “Open When” letter envelopes</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={shareShowDates}
                      disabled={!isShareEnabled}
                      onChange={(e) => setShareShowDates(e.target.checked)}
                    />
                    <span>Show upcoming milestone countdowns</span>
                  </label>
                </div>
              </div>

              {/* Password Protection Option */}
              <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
                  <input
                    type="checkbox"
                    checked={isPasswordProtected}
                    onChange={(e) => {
                      setIsPasswordProtected(e.target.checked);
                      if (!e.target.checked) setPasscode('');
                    }}
                  />
                  <span>Require a visitor password</span>
                </label>

                {isPasswordProtected && (
                  <Input
                    label="Visitor Passcode"
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="e.g. moonlight2024"
                    hint="Visitors must enter this passcode before reading your shared sanctuary."
                  />
                )}
              </div>

              {message && (
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-tint-sage)',
                    color: '#2E4426',
                    fontSize: '0.8125rem',
                  }}
                >
                  {message}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button type="button" variant="secondary" onClick={onClose} size="sm">
                  Close
                </Button>
                <Button type="submit" isLoading={saving} size="sm">
                  Save Preferences
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

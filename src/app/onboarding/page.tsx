'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createCoupleSpace, joinCoupleSpace, previewCoupleByInviteCode } from '@/server/actions/couple';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  IconHeart,
  IconDove,
  IconCalendar,
  IconSparkles,
  IconKey,
  IconCheck,
  IconClipboard,
} from '@/components/ui/Icons';
import { getDaysTogether } from '@/lib/utils';

type ThemeChoice = 'Soft Rose' | 'Midnight' | 'Warm Paper';

const AVATAR_PRESETS = ['🕊️', '🌿', '🌸', '☕', '🌙', '🌊', '🕯️', '🪐', '💌', '🧸', '🍓', '☁️'];

interface CouplePreview {
  id: string;
  name: string;
  creatorName: string;
  creatorAvatar: string;
  theme: string;
  createdAt: Date;
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode: creating or joining
  const [isJoining, setIsJoining] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Names
  const [myName, setMyName] = useState('');
  const [partnerName, setPartnerName] = useState('');

  // Step 2: Optional Avatars
  const [myAvatar, setMyAvatar] = useState('🕊️');
  const [partnerAvatar, setPartnerAvatar] = useState('🌿');

  // Step 3: Date
  const [storyDate, setStoryDate] = useState('');

  // Step 4: Theme
  const [theme, setTheme] = useState<ThemeChoice>('Soft Rose');

  // Join Mode State
  const [inviteCode, setInviteCode] = useState('');
  const [joinNickname, setJoinNickname] = useState('');
  const [joinAvatar, setJoinAvatar] = useState('🌿');
  const [previewCouple, setPreviewCouple] = useState<CouplePreview | null>(null);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);

  // Check URL query parameters on mount
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    const codeParam = searchParams.get('code');

    if (codeParam) {
      const cleanCode = codeParam.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      setInviteCode(cleanCode);
      setIsJoining(true);
      verifyCode(cleanCode);
    } else if (modeParam === 'join') {
      setIsJoining(true);
    }
  }, [searchParams]);

  // Verify partner's invite code
  const verifyCode = useCallback(async (codeToVerify: string) => {
    const clean = codeToVerify.trim().toUpperCase();
    if (clean.length < 4) {
      setPreviewCouple(null);
      setVerifyError(null);
      return;
    }

    setVerifyingCode(true);
    setVerifyError(null);

    const res = await previewCoupleByInviteCode(clean);
    setVerifyingCode(false);

    if (res.success && res.couple) {
      setPreviewCouple(res.couple);
      setVerifyError(null);
    } else {
      setPreviewCouple(null);
      setVerifyError(res.error || 'Sanctuary not found for this code');
    }
  }, []);

  // Handle Code Change with auto-verification on 8 characters
  const handleCodeChange = (val: string) => {
    const cleaned = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12);
    setInviteCode(cleaned);
    setError(null);

    if (cleaned.length >= 8) {
      verifyCode(cleaned);
    } else {
      setPreviewCouple(null);
      setVerifyError(null);
    }
  };

  // Clipboard Paste Helper for Mobile
  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const cleaned = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12);
        setInviteCode(cleaned);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
        verifyCode(cleaned);
      }
    } catch {
      // If clipboard permissions are blocked, user can still type
    }
  };

  // Handle Complete Creation (Step 5)
  const handleCreateWorld = async () => {
    setError(null);
    setLoading(true);

    const coupleName = `${myName.trim()} & ${partnerName.trim()}'s World`;

    const res = await createCoupleSpace({
      name: coupleName,
      myNickname: myName.trim(),
      partnerNickname: partnerName.trim(),
      myAvatar,
      partnerAvatar,
      anniversaryDate: storyDate || null,
      theme,
    });

    setLoading(false);

    if (res.success) {
      router.push('/home');
      router.refresh();
    } else {
      setError(res.error || 'Failed to create your Little Us world');
    }
  };

  // Handle Join Existing World
  const handleJoinWorld = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await joinCoupleSpace({
      inviteCode: inviteCode.trim(),
      myNickname: joinNickname.trim(),
      myAvatar: joinAvatar,
    });

    setLoading(false);

    if (res.success) {
      router.push('/home');
      router.refresh();
    } else {
      setError(res.error || 'Failed to join space');
    }
  };

  const daysCount = storyDate ? getDaysTogether(storyDate) : 0;

  // Render Step 1: Names
  const renderStep1 = () => (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{ color: 'var(--color-accent)', display: 'inline-flex', marginBottom: '0.5rem' }}>
          <IconHeart size={28} />
        </div>
        <h1 className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--color-text-primary)' }}>
          Let&apos;s make a little place for you two.
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
          What should we call each of you in this private sanctuary?
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <Input
          label="Your Name or Nickname"
          required
          value={myName}
          onChange={(e) => setMyName(e.target.value)}
          placeholder="e.g. Maya"
          autoFocus
        />

        <Input
          label="Your Partner's Name or Nickname"
          required
          value={partnerName}
          onChange={(e) => setPartnerName(e.target.value)}
          placeholder="e.g. Julian"
        />

        <Button
          type="button"
          disabled={!myName.trim() || !partnerName.trim()}
          onClick={() => {
            setError(null);
            setStep(2);
          }}
          style={{ width: '100%', marginTop: '0.5rem', minHeight: '46px' }}
        >
          Next: Choose Avatars →
        </Button>
      </div>

      {/* Elegant Quick-Switch Banner for Mobile Users */}
      <div
        style={{
          marginTop: '1.75rem',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-bg-subtle)',
          border: '1px dashed var(--color-border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>🗝️</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Partner already created your world?
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setIsJoining(true);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-accent)',
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            padding: '0.2rem 0.4rem',
            textDecoration: 'underline',
          }}
        >
          Enter invite code →
        </button>
      </div>
    </div>
  );

  // Render Step 2: Avatars
  const renderStep2 = () => (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{ color: 'var(--color-accent)', display: 'inline-flex', marginBottom: '0.5rem' }}>
          <IconDove size={28} />
        </div>
        <h1 className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--color-text-primary)' }}>
          Choose your avatars.
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
          Optional little tokens to represent you both across love notes and keepsakes.
        </p>
      </div>

      {/* Your Avatar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="input-label" style={{ marginBottom: '0.5rem' }}>
          {myName}&apos;s Avatar ({myAvatar})
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.4rem' }}>
          {AVATAR_PRESETS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setMyAvatar(emoji)}
              style={{
                height: '44px',
                fontSize: '1.3rem',
                borderRadius: 'var(--radius-sm)',
                border: myAvatar === emoji ? '2px solid var(--color-accent)' : '1px solid var(--color-border-default)',
                background: myAvatar === emoji ? 'var(--color-accent-subtle)' : 'var(--color-bg-surface)',
                cursor: 'pointer',
                transition: 'all var(--duration-fast)',
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Partner Avatar */}
      <div style={{ marginBottom: '1.75rem' }}>
        <label className="input-label" style={{ marginBottom: '0.5rem' }}>
          {partnerName}&apos;s Avatar ({partnerAvatar})
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.4rem' }}>
          {AVATAR_PRESETS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setPartnerAvatar(emoji)}
              style={{
                height: '44px',
                fontSize: '1.3rem',
                borderRadius: 'var(--radius-sm)',
                border: partnerAvatar === emoji ? '2px solid var(--color-accent)' : '1px solid var(--color-border-default)',
                background: partnerAvatar === emoji ? 'var(--color-accent-subtle)' : 'var(--color-bg-surface)',
                cursor: 'pointer',
                transition: 'all var(--duration-fast)',
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button variant="secondary" onClick={() => setStep(1)} style={{ flex: 1, minHeight: '46px' }}>
          ← Back
        </Button>
        <Button onClick={() => setStep(3)} style={{ flex: 2, minHeight: '46px' }}>
          Next: Story Date →
        </Button>
      </div>
    </div>
  );

  // Render Step 3: Story Date
  const renderStep3 = () => (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{ color: 'var(--color-accent)', display: 'inline-flex', marginBottom: '0.5rem' }}>
          <IconCalendar size={28} />
        </div>
        <h1 className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--color-text-primary)' }}>
          When did your story begin?
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
          The day you met, had your first date, or made it official.
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <Input
          label="Anniversary / Starting Date"
          type="date"
          value={storyDate}
          onChange={(e) => setStoryDate(e.target.value)}
          hint="Powers your intimate 'days together' counter. You can change this anytime."
        />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button variant="secondary" onClick={() => setStep(2)} style={{ flex: 1, minHeight: '46px' }}>
          ← Back
        </Button>
        <Button onClick={() => setStep(4)} style={{ flex: 2, minHeight: '46px' }}>
          Next: Choose Theme →
        </Button>
      </div>
    </div>
  );

  // Render Step 4: Themes
  const renderStep4 = () => {
    const themes: Array<{ id: ThemeChoice; name: string; desc: string; bg: string; accent: string }> = [
      {
        id: 'Soft Rose',
        name: 'Soft Rose',
        desc: 'Delicate blush tones, warm terracotta rose, and gentle candlelight.',
        bg: '#FAF1EF',
        accent: '#BC5D54',
      },
      {
        id: 'Midnight',
        name: 'Midnight',
        desc: 'Deep quiet twilight, moody espresso warmth, and moonlit text.',
        bg: '#241E1C',
        accent: '#D4B2A7',
      },
      {
        id: 'Warm Paper',
        name: 'Warm Paper',
        desc: 'Natural uncoated parchment, amber warmth, and timeless editorial serenity.',
        bg: '#F8F4EB',
        accent: '#8C683B',
      },
    ];

    return (
      <div className="animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ color: 'var(--color-accent)', display: 'inline-flex', marginBottom: '0.5rem' }}>
            <IconSparkles size={28} />
          </div>
          <h1 className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--color-text-primary)' }}>
            Choose a starting theme.
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
            Select the mood that feels most like home for you both.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.75rem' }}>
          {themes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  padding: '0.9rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border-default)',
                  background: isSelected ? 'var(--color-bg-surface)' : 'var(--color-bg-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  transition: 'all var(--duration-fast)',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: t.bg,
                    border: `2px solid ${t.accent}`,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '0.1rem' }}>
                    {t.desc}
                  </div>
                </div>
                {isSelected && (
                  <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.9rem' }}>
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setStep(3)} style={{ flex: 1, minHeight: '46px' }}>
            ← Back
          </Button>
          <Button onClick={() => setStep(5)} style={{ flex: 2, minHeight: '46px' }}>
            Next: Preview Sanctuary →
          </Button>
        </div>
      </div>
    );
  };

  // Render Step 5: Preview & Finalize
  const renderStep5 = () => {
    const themeStyles = {
      'Soft Rose': { bg: '#FDF7F5', border: '#F2DDD8', text: '#2B2421', accent: '#BC5D54' },
      Midnight: { bg: '#231E1C', border: '#38302D', text: '#F5EFEB', accent: '#D4B2A7' },
      'Warm Paper': { bg: '#FAF5ED', border: '#EAE1CE', text: '#2E2721', accent: '#8C683B' },
    };

    const currentStyle = themeStyles[theme];

    return (
      <div className="animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2rem' }}>✨</span>
          <h1 className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--color-text-primary)', marginTop: '0.35rem' }}>
            Your Little Us world is ready.
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
            Here is a first glimpse of your private sanctuary.
          </p>
        </div>

        {/* Live Preview Card */}
        <div
          style={{
            padding: '1.75rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: currentStyle.bg,
            border: `1px solid ${currentStyle.border}`,
            color: currentStyle.text,
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center',
            marginBottom: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                border: '1px solid rgba(0, 0, 0, 0.05)',
              }}
            >
              {myAvatar}
            </div>
            <span style={{ color: currentStyle.accent, fontSize: '1.2rem' }}>♥</span>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                border: '1px solid rgba(0, 0, 0, 0.05)',
              }}
            >
              {partnerAvatar}
            </div>
          </div>

          <h3 className="font-serif" style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>
            {myName} & {partnerName}&apos;s Sanctuary
          </h3>

          <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.85rem' }}>
            Theme: <strong>{theme}</strong>
          </p>

          <div
            style={{
              display: 'inline-block',
              padding: '0.45rem 1.15rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.5)',
              border: `1px solid ${currentStyle.border}`,
              fontSize: '0.84rem',
              fontWeight: 600,
              color: currentStyle.accent,
            }}
          >
            {daysCount > 0 ? `${daysCount.toLocaleString()} days together` : 'Day 1 of your shared story'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setStep(4)} style={{ flex: 1, minHeight: '46px' }}>
            ← Back
          </Button>
          <Button isLoading={loading} onClick={handleCreateWorld} style={{ flex: 2, minHeight: '46px' }}>
            Create our little world
          </Button>
        </div>
      </div>
    );
  };

  // Render Join Partner's World View (Mobile-First Enhanced)
  const renderJoinMode = () => (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--color-accent-subtle)',
            color: 'var(--color-accent)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.65rem',
            border: '1px solid var(--color-accent-border)',
          }}
        >
          <IconKey size={24} />
        </div>
        <h1 className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--color-text-primary)' }}>
          Join Your Partner&apos;s World
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem', maxWidth: '340px', margin: '0.35rem auto 0' }}>
          Enter the secret invite code your partner sent you to step inside your shared sanctuary.
        </p>
      </div>

      <form onSubmit={handleJoinWorld}>
        {/* Mobile-Friendly Code Input with Quick-Paste */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label className="input-label" style={{ marginBottom: 0 }}>
              Partner&apos;s Invite Code
            </label>
            <button
              type="button"
              onClick={handlePasteCode}
              style={{
                background: 'none',
                border: 'none',
                color: pasteSuccess ? '#2E7D32' : 'var(--color-accent)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.2rem 0.4rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {pasteSuccess ? (
                <>
                  <IconCheck size={14} /> Pasted!
                </>
              ) : (
                <>
                  <IconClipboard size={14} /> Paste from Clipboard
                </>
              )}
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              required
              value={inviteCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="e.g. A9B2C4D1"
              maxLength={12}
              autoFocus
              className="input-field"
              style={{
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.14em',
                fontSize: '1.15rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                textAlign: 'center',
                height: '50px',
                borderColor: previewCouple
                  ? 'var(--color-accent)'
                  : verifyError
                  ? 'var(--blush-500)'
                  : undefined,
              }}
            />
            {verifyingCode && (
              <span
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                Checking...
              </span>
            )}
          </div>

          {verifyError && (
            <p style={{ marginTop: '0.4rem', fontSize: '0.8125rem', color: 'var(--color-accent-hover)' }}>
              {verifyError}
            </p>
          )}
        </div>

        {/* Live Partner Sanctuary Preview Card */}
        {previewCouple && (
          <div
            className="animate-fade-in"
            style={{
              padding: '1.25rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-accent-subtle)',
              border: '1px solid var(--color-accent-border)',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--color-bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  boxShadow: 'var(--shadow-subtle)',
                }}
              >
                {previewCouple.creatorAvatar}
              </div>
              <span style={{ color: 'var(--color-accent)', fontSize: '1rem' }}>♥</span>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--color-bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  boxShadow: 'var(--shadow-subtle)',
                  border: '1.5px dashed var(--color-accent)',
                }}
              >
                {joinAvatar}
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent)', fontWeight: 600 }}>
              Sanctuary Found ✨
            </div>
            <div className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', marginTop: '0.15rem' }}>
              {previewCouple.name}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              <strong>{previewCouple.creatorName}</strong> is waiting for you to step inside.
            </p>
          </div>
        )}

        {/* Nickname Input */}
        <Input
          label={previewCouple ? `What should ${previewCouple.creatorName} call you?` : 'Your Name or Nickname'}
          required
          value={joinNickname}
          onChange={(e) => setJoinNickname(e.target.value)}
          placeholder="e.g. Julian / Sweetheart"
          hint="This is how you will appear inside your shared memories and love notes."
        />

        {/* Avatar Selection for Partner */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="input-label" style={{ marginBottom: '0.5rem' }}>
            Choose your sanctuary avatar token ({joinAvatar})
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.4rem' }}>
            {AVATAR_PRESETS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setJoinAvatar(emoji)}
                style={{
                  height: '42px',
                  fontSize: '1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: joinAvatar === emoji ? '2px solid var(--color-accent)' : '1px solid var(--color-border-default)',
                  background: joinAvatar === emoji ? 'var(--color-accent-subtle)' : 'var(--color-bg-surface)',
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast)',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          isLoading={loading}
          disabled={!inviteCode.trim() || !joinNickname.trim()}
          style={{ width: '100%', minHeight: '48px', fontSize: '0.95rem' }}
        >
          {previewCouple ? `Step Inside with ${previewCouple.creatorName} →` : 'Step Inside Our World →'}
        </Button>
      </form>

      {/* Alternative back link */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setIsJoining(false);
          }}
          className="btn-ghost"
          style={{ fontSize: '0.8125rem' }}
        >
          ← Or create a brand new world together
        </button>
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(253, 243, 241, 0.7) 0%, rgba(250, 248, 245, 0) 70%)',
      }}
    >
      <div
        className="surface-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-raised)',
        }}
      >
        {/* MOBILE-FIRST TOP SEGMENTED SWITCHER */}
        <div
          style={{
            display: 'flex',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-bg-subtle)',
            padding: '0.3rem',
            marginBottom: '1.75rem',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setError(null);
              setIsJoining(false);
            }}
            style={{
              flex: 1,
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: !isJoining ? 600 : 500,
              color: !isJoining ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              background: !isJoining ? 'var(--color-bg-surface)' : 'transparent',
              boxShadow: !isJoining ? 'var(--shadow-subtle)' : 'none',
              cursor: 'pointer',
              transition: 'all var(--duration-fast)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <span>✨</span>
            <span>Create Sanctuary</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setIsJoining(true);
            }}
            style={{
              flex: 1,
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: isJoining ? 600 : 500,
              color: isJoining ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              background: isJoining ? 'var(--color-bg-surface)' : 'transparent',
              boxShadow: isJoining ? 'var(--shadow-subtle)' : 'none',
              cursor: 'pointer',
              transition: 'all var(--duration-fast)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <span>🗝️</span>
            <span>Join With Code</span>
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-tint-rose)',
              color: 'var(--color-accent-hover)',
              fontSize: '0.84375rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--color-tint-rose-border)',
            }}
          >
            {error}
          </div>
        )}

        {isJoining ? (
          renderJoinMode()
        ) : (
          <div>
            {/* 5-Step Progress Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  style={{
                    height: '4px',
                    width: i === step ? '28px' : '14px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: i === step ? 'var(--color-accent)' : i < step ? 'var(--color-border-default)' : 'var(--color-border-subtle)',
                    transition: 'all var(--duration-normal) var(--ease-soft)',
                  }}
                />
              ))}
            </div>

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}

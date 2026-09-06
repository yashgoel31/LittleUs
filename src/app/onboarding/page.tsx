'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCoupleSpace, joinCoupleSpace } from '@/server/actions/couple';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconHeart, IconDove, IconCalendar, IconSparkles } from '@/components/ui/Icons';
import { getDaysTogether } from '@/lib/utils';

type ThemeChoice = 'Soft Rose' | 'Midnight' | 'Warm Paper';

const AVATAR_PRESETS = ['🕊️', '🌿', '🌸', '☕', '🌙', '🌊', '🕯️', '🪐'];

export default function OnboardingPage() {
  const router = useRouter();

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

  // Join Mode Form
  const [inviteCode, setInviteCode] = useState('');
  const [joinNickname, setJoinNickname] = useState('');

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

  const handleJoinWorld = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await joinCoupleSpace({
      inviteCode,
      myNickname: joinNickname,
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

  // Render Step 1
  const renderStep1 = () => (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ color: 'var(--color-accent)', display: 'inline-flex', marginBottom: '0.5rem' }}>
          <IconHeart size={28} />
        </div>
        <h1 className="font-serif" style={{ fontSize: '1.85rem', color: 'var(--color-text-primary)' }}>
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
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          Next: Choose Avatars →
        </Button>
      </div>
    </div>
  );

  // Render Step 2: Avatars
  const renderStep2 = () => (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ color: 'var(--color-accent)', display: 'inline-flex', marginBottom: '0.5rem' }}>
          <IconDove size={28} />
        </div>
        <h1 className="font-serif" style={{ fontSize: '1.85rem', color: 'var(--color-text-primary)' }}>
          Choose your avatars.
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
          Optional little tokens to represent you both across love notes and keepsakes.
        </p>
      </div>

      {/* Your Avatar */}
      <div style={{ marginBottom: '1.75rem' }}>
        <label className="input-label" style={{ marginBottom: '0.5rem' }}>
          {myName}&apos;s Avatar ({myAvatar})
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {AVATAR_PRESETS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setMyAvatar(emoji)}
              style={{
                width: '42px',
                height: '42px',
                fontSize: '1.25rem',
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
      <div style={{ marginBottom: '2rem' }}>
        <label className="input-label" style={{ marginBottom: '0.5rem' }}>
          {partnerName}&apos;s Avatar ({partnerAvatar})
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {AVATAR_PRESETS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setPartnerAvatar(emoji)}
              style={{
                width: '42px',
                height: '42px',
                fontSize: '1.25rem',
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
        <Button variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>
          ← Back
        </Button>
        <Button onClick={() => setStep(3)} style={{ flex: 2 }}>
          Next: Story Date →
        </Button>
      </div>
    </div>
  );

  // Render Step 3: Story Date
  const renderStep3 = () => (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ color: 'var(--color-accent)', display: 'inline-flex', marginBottom: '0.5rem' }}>
          <IconCalendar size={28} />
        </div>
        <h1 className="font-serif" style={{ fontSize: '1.85rem', color: 'var(--color-text-primary)' }}>
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
        <Button variant="secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>
          ← Back
        </Button>
        <Button onClick={() => setStep(4)} style={{ flex: 2 }}>
          Next: Choose Theme →
        </Button>
      </div>
    </div>
  );

  // Render Step 4: 3 Themes
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
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ color: 'var(--color-accent)', display: 'inline-flex', marginBottom: '0.5rem' }}>
            <IconSparkles size={28} />
          </div>
          <h1 className="font-serif" style={{ fontSize: '1.85rem', color: 'var(--color-text-primary)' }}>
            Choose a starting theme.
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
            Select the mood that feels most like home for you both.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {themes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  padding: '1.1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border-default)',
                  background: isSelected ? 'var(--color-bg-surface)' : 'var(--color-bg-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all var(--duration-fast)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: t.bg,
                    border: `2px solid ${t.accent}`,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                    {t.desc}
                  </div>
                </div>
                {isSelected && (
                  <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.875rem' }}>
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setStep(3)} style={{ flex: 1 }}>
            ← Back
          </Button>
          <Button onClick={() => setStep(5)} style={{ flex: 2 }}>
            Next: Preview Sanctuary →
          </Button>
        </div>
      </div>
    );
  };

  // Render Step 5: Preview
  const renderStep5 = () => {
    const themeStyles = {
      'Soft Rose': { bg: '#FDF7F5', border: '#F2DDD8', text: '#2B2421', accent: '#BC5D54' },
      Midnight: { bg: '#231E1C', border: '#38302D', text: '#F5EFEB', accent: '#D4B2A7' },
      'Warm Paper': { bg: '#FAF5ED', border: '#EAE1CE', text: '#2E2721', accent: '#8C683B' },
    };

    const currentStyle = themeStyles[theme];

    return (
      <div className="animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '2rem' }}>✨</span>
          <h1 className="font-serif" style={{ fontSize: '1.85rem', color: 'var(--color-text-primary)', marginTop: '0.4rem' }}>
            Your Little Us world is ready.
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
            Here is a first glimpse of your private sanctuary.
          </p>
        </div>

        {/* Live Preview Card */}
        <div
          style={{
            padding: '2rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: currentStyle.bg,
            border: `1px solid ${currentStyle.border}`,
            color: currentStyle.text,
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          {/* Avatar pairing */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                border: '1px solid rgba(0, 0, 0, 0.05)',
              }}
            >
              {myAvatar}
            </div>
            <span style={{ color: currentStyle.accent, fontSize: '1.2rem' }}>♥</span>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                border: '1px solid rgba(0, 0, 0, 0.05)',
              }}
            >
              {partnerAvatar}
            </div>
          </div>

          <h3 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
            {myName} & {partnerName}&apos;s Sanctuary
          </h3>

          <p style={{ fontSize: '0.8125rem', opacity: 0.8, marginBottom: '1rem' }}>
            Theme: <strong>{theme}</strong>
          </p>

          <div
            style={{
              display: 'inline-block',
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.4)',
              border: `1px solid ${currentStyle.border}`,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: currentStyle.accent,
            }}
          >
            {daysCount > 0 ? `${daysCount.toLocaleString()} days together` : 'Day 1 of your shared story'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setStep(4)} style={{ flex: 1 }}>
            ← Back
          </Button>
          <Button isLoading={loading} onClick={handleCreateWorld} style={{ flex: 2 }}>
            Create our little world
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(253, 243, 241, 0.7) 0%, rgba(250, 248, 245, 0) 70%)',
      }}
    >
      <div
        className="surface-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-raised)',
        }}
      >
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
          /* Join Existing World with Invite Code */
          <div className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '2rem' }}>🗝️</span>
              <h1 className="font-serif" style={{ fontSize: '1.85rem', color: 'var(--color-text-primary)', marginTop: '0.5rem' }}>
                Join Your Partner&apos;s World
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
                Enter the secret 8-character invite code they sent you.
              </p>
            </div>

            <form onSubmit={handleJoinWorld}>
              <Input
                label="Partner's Invite Code"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. A9B2C4D1"
                autoFocus
              />

              <Input
                label="Your Nickname"
                required
                value={joinNickname}
                onChange={(e) => setJoinNickname(e.target.value)}
                placeholder="e.g. Julian / Sweetheart"
              />

              <Button type="submit" isLoading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                Step Inside Our World →
              </Button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setIsJoining(false)}
                className="btn-ghost"
                style={{ fontSize: '0.8125rem' }}
              >
                ← Or create a brand new world
              </button>
            </div>
          </div>
        ) : (
          /* 5-Step Creation Flow */
          <div>
            {/* Elegant 5-Step Progress Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
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

            {/* Bottom link to switch to join mode */}
            <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsJoining(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Joining your partner&apos;s existing world instead? Enter invite code →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

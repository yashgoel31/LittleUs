'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCoupleOverview, updateCoupleSettings } from '@/server/actions/couple';
import { revertToFreeSanctuary } from '@/server/actions/subscription';
import { logoutUser } from '@/server/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShareModal } from '@/components/features/ShareModal';
import { UpgradeModal } from '@/components/features/UpgradeModal';
import { PLAN_CONFIG, isThemePremium, getPlanConfig } from '@/lib/config/plans';
import {
  getSubscriptionTier,
  isPremiumSubscriber,
  getSubscriptionDisplayInfo,
} from '@/lib/payments/subscriptionStatus';
import { IconSparkles, IconShare, IconCopy, IconCheck } from '@/components/ui/Icons';

interface CoupleData {
  id: string;
  name: string;
  slug?: string;
  theme: string;
  inviteCode: string;
  anniversaryDate: Date | string | null;
  members: Array<{
    id: string;
    nickname: string;
    role: string;
    user: {
      name: string;
      email: string;
    };
  }>;
  subscription?: {
    tier: string;
    status: string;
    planType?: string | null;
    amount?: number | null;
    currency?: string | null;
    razorpayOrderId?: string | null;
    razorpayPaymentId?: string | null;
    currentPeriodEnd?: Date | string | null;
  } | null;
  _count: {
    memories: number;
    loveNotes: number;
    openWhenLetters: number;
    importantDates: number;
  };
}

export default function SpaceSettingsPage() {
  const [couple, setCouple] = useState<CoupleData | null>(null);
  const [name, setName] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [theme, setTheme] = useState<'candlelight' | 'rose' | 'sage' | 'midnight'>('candlelight');
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeHighlight, setUpgradeHighlight] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | null>(null);


  const fetchOverview = async () => {
    const data = await getCoupleOverview();
    if (data.couple) {
      setCouple(data.couple as unknown as CoupleData);
      setName(data.couple.name);
      setTheme(data.couple.theme as typeof theme);
      if (data.couple.anniversaryDate) {
        setAnniversaryDate(new Date(data.couple.anniversaryDate).toISOString().split('T')[0]);
      }
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await updateCoupleSettings({
      name,
      theme,
      anniversaryDate: anniversaryDate || null,
    });

    setSaving(false);

    if (res.success) {
      setMessage('Space settings saved softly.');
      fetchOverview();
    } else {
      setMessage(res.error || 'Failed to update settings');
    }
  };

  const handleCopyInvite = () => {
    if (!couple?.inviteCode) return;
    navigator.clipboard.writeText(couple.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareInvite = async () => {
    if (!couple?.inviteCode) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/onboarding?code=${couple.inviteCode}`;
    const shareData = {
      title: `${couple.name} on Little Us`,
      text: `Join me in our private sanctuary on Little Us with code: ${couple.inviteCode}`,
      url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // dismissed
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };



  const handleRevertFree = async () => {
    if (!confirm('Switch space to Free Sanctuary tier? (All existing memories remain completely safe).')) {
      return;
    }
    setSaving(true);
    const res = await revertToFreeSanctuary();
    setSaving(false);
    setMessage(res.message);
    fetchOverview();
  };

  if (!couple) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your sanctuary settings...</div>;
  }

  const isPremium = isPremiumSubscriber(couple.subscription);
  const currentTier = getSubscriptionTier(couple.subscription);
  const currentPlan = getPlanConfig(currentTier);
  const displayInfo = getSubscriptionDisplayInfo(couple.subscription);

  const handleSelectTheme = (tId: 'candlelight' | 'rose' | 'sage' | 'midnight', tName: string) => {
    if (isThemePremium(tId) && !isPremium) {
      setUpgradeHighlight(`The ${tName} atmosphere requires Sweetheart or Forever Club.`);
      setShowUpgradeModal(true);
      return;
    }
    setTheme(tId);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 className="font-serif" style={{ fontSize: '2rem' }}>
          Personalization & Sanctuary
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Manage your shared names, partner connection, and keepsake subscription
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--sage-100)',
            color: 'var(--sage-500)',
            fontSize: '0.875rem',
            border: '1px solid var(--sage-200)',
          }}
        >
          {message}
        </div>
      )}

      {/* Partner Link / Invite Code */}
      <div className="surface-card" style={{ borderRadius: 'var(--radius-md)' }}>
        <h3 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          Partner Connection
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Little Us connects strictly two partners. Here is your unique invite code:
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.85rem',
            background: 'var(--bg-secondary)',
            padding: '0.9rem 1.15rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-medium)',
            marginBottom: '0.85rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Your Couple Invite Code:
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-primary)', fontFamily: 'monospace, sans-serif' }}>
              {couple.inviteCode}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={handleShareInvite} className="btn-primary" style={{ fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              {copiedLink ? <><IconCheck size={15} /> Link Copied</> : <><IconShare size={15} /> Share Link</>}
            </button>
            <button onClick={handleCopyInvite} className="btn-secondary" style={{ fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              {copied ? <><IconCheck size={15} /> Copied</> : <><IconCopy size={15} /> Copy Code</>}
            </button>
          </div>
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
          Direct join link: <code style={{ background: 'var(--bg-secondary)', padding: '0.2rem 0.4rem', borderRadius: '4px', wordBreak: 'break-all' }}>/onboarding?code={couple.inviteCode}</code>
        </div>

        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Members in this space ({couple.members.length}/2):
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {couple.members.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.9375rem',
                }}
              >
                <span>
                  <strong>{m.nickname}</strong> ({m.user.name})
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {m.role === 'CREATOR' ? 'Created Space' : 'Partner Linked'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shareable Page Settings */}
      <div className="surface-card" style={{ borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.25rem' }}>
              Share Our Little World
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Invite trusted friends or view your public story together on mobile
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowShareModal(true)}
            style={{ fontSize: '0.8125rem' }}
          >
            Share Controls
          </Button>
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', wordBreak: 'break-all' }}>
          Public link: <code style={{ background: 'var(--bg-secondary)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>/us/{couple.slug || '...'}</code>
        </div>
      </div>

      {/* General Settings */}
      <div className="surface-card" style={{ borderRadius: 'var(--radius-md)' }}>
        <h3 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
          Space Details & Atmosphere
        </h3>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="Couple Space Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            hint="The title shown on your home sanctuary and shared story"
          />

          <Input
            label="Story Beginning (Anniversary Date)"
            type="date"
            value={anniversaryDate}
            onChange={(e) => setAnniversaryDate(e.target.value)}
            hint="Used to calculate your 'days together' milestone"
          />

          {/* Theme Palette */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
              <label className="input-label" style={{ margin: 0 }}>Sanctuary Atmosphere</label>
              {!isPremium && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)' }}>
                  ✨ Club members unlock all themes
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.75rem' }}>
              {[
                { id: 'candlelight' as const, name: 'Candlelight Cream', desc: 'Warm paper and amber' },
                { id: 'rose' as const, name: 'Blush Rose', desc: 'Intimate soft pink and rose gold' },
                { id: 'sage' as const, name: 'Muted Forest Sage', desc: 'Serene olive and eucalyptus' },
                { id: 'midnight' as const, name: 'Midnight Velvet', desc: 'Deep quiet twilight' },
              ].map((t) => {
                const isPremiumTheme = isThemePremium(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTheme(t.id, t.name)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: theme === t.id ? '2px solid var(--text-accent)' : '1px solid var(--border-medium)',
                      background: theme === t.id ? 'var(--blush-100)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {t.name}
                      </span>
                      {isPremiumTheme && !isPremium && (
                        <span
                          style={{
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            padding: '0.1rem 0.4rem',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--color-tint-rose)',
                            color: 'var(--color-accent)',
                            textTransform: 'uppercase',
                          }}
                        >
                          Club
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                      {t.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button type="submit" isLoading={saving}>
            Save Changes
          </Button>
        </form>
      </div>

      {/* Subscription & Account Management */}
      <div className="surface-card" style={{ borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
              Sanctuary Space & Membership
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Current Plan: <strong>{currentPlan.name}</strong> ({currentPlan.priceFormatted})
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
              {displayInfo.note}
            </p>
          </div>
          <span
            style={{
              padding: '0.3rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              background: displayInfo.badgeBg,
              color: displayInfo.badgeColor,
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            {displayInfo.badgeText}
          </span>
        </div>

        {/* Limits breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', fontSize: '0.875rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.75rem' }}>MEMORIES</span>
            <strong>{couple._count.memories}</strong> / {currentPlan.maxMemories}
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.75rem' }}>LOVE NOTES</span>
            <strong>{couple._count.loveNotes}</strong> / {currentPlan.maxLoveNotes}
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.75rem' }}>OPEN WHEN LETTERS</span>
            <strong>{couple._count.openWhenLetters}</strong> / {currentPlan.maxLetters}
          </div>
          <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.75rem' }}>MILESTONE DATES</span>
            <strong>{couple._count.importantDates}</strong> / {currentPlan.maxImportantDates}
          </div>
        </div>

        {/* Account & Billing Management Actions */}
        <div
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            borderTop: '1px solid var(--border-light)',
            paddingTop: '1.25rem',
          }}
        >
          {currentTier === 'FREE' ? (
            <>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                  More room for our story.
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Unlock 10 memories & 15 notes with Sweetheart (₹69 / yr) or 25/35/30/30 with Forever (₹119 / yr).
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Button
                  variant="primary"
                  onClick={() => {
                    setUpgradeHighlight(undefined);
                    setShowUpgradeModal(true);
                  }}
                  style={{ fontSize: '0.8125rem' }}
                >
                  Explore Annual Plans (from ₹69 / yr)
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <IconSparkles size={14} /> You're in the {currentPlan.name}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Annual membership in Indian Rupees (₹). Both of you share this expanded room for 1 full year.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {currentTier === 'SWEETHEART' && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setUpgradeHighlight('Upgrade from Sweetheart to Forever Club');
                      setShowUpgradeModal(true);
                    }}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    Upgrade to Forever (₹119 / yr)
                  </Button>
                )}

                <button
                  onClick={handleRevertFree}
                  className="btn-ghost"
                  style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}
                  title="Switch to Free Sanctuary"
                >
                  Switch to Free
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Account & Session */}
      <div className="surface-card" style={{ borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
              Account & Session
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Sign out of this sanctuary on this device
            </p>
          </div>
          <button
            onClick={() => logoutUser().then(() => (window.location.href = '/login'))}
            className="btn-secondary"
            style={{ fontSize: '0.8125rem', color: 'var(--color-accent)' }}
          >
            Sign out
          </button>
        </div>
      </div>

      {showShareModal && (
        <ShareModal onClose={() => setShowShareModal(false)} />
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={currentTier}
        isAlreadyPremium={isPremium}
        highlightFeature={upgradeHighlight}
        onSuccess={() => fetchOverview()}
      />
    </div>
  );
}

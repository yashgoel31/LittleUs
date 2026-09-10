'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { IconShare, IconCopy, IconCheck } from '@/components/ui/Icons';

interface PartnerInviteBannerProps {
  inviteCode: string;
  coupleName: string;
}

export function PartnerInviteBanner({ inviteCode, coupleName }: PartnerInviteBannerProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const getJoinUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/onboarding?code=${inviteCode}`;
    }
    return `/onboarding?code=${inviteCode}`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    const joinUrl = getJoinUrl();
    const shareData = {
      title: `${coupleName} on Little Us`,
      text: `I made a private sanctuary for us on Little Us! Join me with my invite code: ${inviteCode}`,
      url: joinUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // user dismissed or cancelled share
      }
    } else {
      // Fallback to copying direct join link
      try {
        await navigator.clipboard.writeText(joinUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2200);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div
      style={{
        padding: '1.25rem 1.4rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-tint-rose)',
        border: '1px solid var(--color-tint-rose-border)',
        boxShadow: 'var(--shadow-subtle)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🗝️</span>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-accent-hover)' }}>
              Waiting for your partner to step inside...
            </h3>
          </div>
          <p style={{ fontSize: '0.84375rem', color: 'var(--color-text-secondary)', marginTop: '0.3rem' }}>
            Share your secret invite code or send them a direct link to connect together.
          </p>
          <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Your Code:
            </span>
            <strong
              style={{
                fontSize: '1.1rem',
                letterSpacing: '0.12em',
                color: 'var(--color-text-primary)',
                background: 'var(--color-bg-surface)',
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border-subtle)',
                fontFamily: 'monospace, sans-serif',
              }}
            >
              {inviteCode}
            </strong>
          </div>
        </div>

        {/* Action buttons (Mobile-first friendly) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', width: '100%', maxWidth: '300px' }}>
          <button
            type="button"
            onClick={handleShare}
            className="btn-primary"
            style={{
              flex: 1,
              padding: '0.55rem 0.9rem',
              fontSize: '0.8125rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              minHeight: '40px',
            }}
          >
            {copiedLink ? (
              <>
                <IconCheck size={16} /> Link Copied!
              </>
            ) : (
              <>
                <IconShare size={16} /> Share Invite Link
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyCode}
            className="btn-secondary"
            style={{
              padding: '0.55rem 0.85rem',
              fontSize: '0.8125rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              minHeight: '40px',
            }}
          >
            {copiedCode ? (
              <>
                <IconCheck size={15} /> Copied
              </>
            ) : (
              <>
                <IconCopy size={15} /> Copy Code
              </>
            )}
          </button>

          <Link
            href="/settings"
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
              textDecoration: 'underline',
              padding: '0.2rem 0.4rem',
              width: '100%',
              textAlign: 'center',
              marginTop: '0.15rem',
            }}
          >
            Manage connection in settings →
          </Link>
        </div>
      </div>
    </div>
  );
}

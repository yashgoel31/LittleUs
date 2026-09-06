'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PLAN_CONFIG } from '@/lib/config/plans';
import {
  getSubscriptionDetails,
  startCheckout,
  revertToFreeSanctuary,
  openBillingPortal,
} from '@/server/actions/subscription';
import { Button } from '@/components/ui/Button';
import { IconDove, IconHeart, IconSparkles, IconCalendar } from '@/components/ui/Icons';

export default function UpgradePage() {
  const searchParams = useSearchParams();
  const isCheckoutSuccess = searchParams.get('success') === 'true';
  const isCheckoutCanceled = searchParams.get('canceled') === 'true';

  const [selectedPlan, setSelectedPlan] = useState<'lifetime' | 'annual'>('lifetime');
  const [subData, setSubData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    isCheckoutSuccess
      ? 'Payment received! Welcome to the Little Us Keepsake Club ❤️ Boundless room is unlocked.'
      : null
  );
  const [error, setError] = useState<string | null>(
    isCheckoutCanceled
      ? 'Checkout was cancelled. Your Free Sanctuary remains active and ready.'
      : null
  );

  const fetchDetails = async () => {
    try {
      const data = await getSubscriptionDetails();
      setSubData(data);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await startCheckout(selectedPlan);
      if (res.success) {
        if (res.url) {
          window.location.href = res.url;
          return;
        }
        setSuccessMessage(res.message || 'Welcome to the Keepsake Club!');
        setTimeout(() => {
          fetchDetails();
        }, 1200);
      } else {
        setError(res.error || 'Unable to initiate checkout. Please try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await revertToFreeSanctuary();
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          fetchDetails();
        }, 1000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isPremium = subData?.isPremium ?? false;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Breadcrumb & Tag */}
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'var(--color-tint-rose)',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-tint-rose-border)',
          }}
        >
          <IconSparkles size={13} /> Little Us Keepsake Club
        </span>
      </div>

      {/* Main Emotional Headline */}
      <h1
        className="font-serif"
        style={{
          fontSize: '2.5rem',
          textAlign: 'center',
          letterSpacing: '-0.02em',
          color: 'var(--color-text-primary)',
          lineHeight: 1.15,
          marginBottom: '0.85rem',
        }}
      >
        More room for our story.
      </h1>

      {/* Warm Subtitle */}
      <p
        style={{
          fontSize: '1.0625rem',
          lineHeight: 1.6,
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          maxWidth: '540px',
          margin: '0 auto 2.5rem auto',
        }}
      >
        Little Us is built to be a genuine sanctuary for two. The free plan is completely useful forever.
        When your memories outgrow the initial room, the Keepsake Club unlocks boundless space without subscriptions or stress.
      </p>

      {/* Status Messages */}
      {successMessage && (
        <div
          style={{
            background: 'var(--sage-100)',
            color: 'var(--sage-500)',
            border: '1px solid var(--sage-200)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center',
            fontSize: '1rem',
            marginBottom: '2rem',
          }}
        >
          {successMessage}
        </div>
      )}

      {error && (
        <div
          style={{
            background: 'var(--color-tint-rose)',
            color: 'var(--color-accent)',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center',
            fontSize: '0.9375rem',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Space Usage Quota (if free) */}
      {subData?.usage && !isPremium && (
        <div
          className="surface-card"
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Your Sanctuary Space Usage
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>
              Free Sanctuary Tier
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: 'var(--color-bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Memories</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {subData.usage.memories.count} <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>/ {subData.usage.memories.limit}</span>
              </div>
            </div>

            <div style={{ background: 'var(--color-bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Love Notes</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {subData.usage.loveNotes.count} <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>/ {subData.usage.loveNotes.limit}</span>
              </div>
            </div>

            <div style={{ background: 'var(--color-bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Open When Letters</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {subData.usage.letters.count} <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>/ {subData.usage.letters.limit}</span>
              </div>
            </div>

            <div style={{ background: 'var(--color-bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Milestone Dates</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {subData.usage.importantDates.count} <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>/ {subData.usage.importantDates.limit}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Pillars: Free vs Keepsake */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Free Sanctuary Card */}
        <div
          className="surface-card"
          style={{
            padding: '1.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
              Free Sanctuary
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
              $0 <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--color-text-tertiary)' }}>forever</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              A genuinely useful, quiet place for two. Keep what matters without ever seeing ads or paywalls for everyday actions.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              {PLAN_CONFIG.FREE.features.map((feat, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-tertiary)' }}>✓</span> {feat}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
              Always yours, never expires
            </div>
          </div>
        </div>

        {/* Keepsake Club Card */}
        <div
          className="surface-card"
          style={{
            padding: '1.75rem',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--color-accent)',
            background: 'var(--color-surface)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-12px',
              right: '20px',
              background: 'var(--color-accent)',
              color: '#FFFFFF',
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            Recommended
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '0.25rem' }}>
              Little Us Keepsake Club
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
              {selectedPlan === 'lifetime' ? '$49' : '$29'}
              <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--color-text-tertiary)' }}>
                {selectedPlan === 'lifetime' ? ' one-time forever' : ' / year'}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Boundless room for both of you. Never worry about running out of space for anniversaries, photos, or letters.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
              {PLAN_CONFIG.PREMIUM.features.map((feat, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--color-accent)' }}>❤️</span> {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* Plan Choice Selector */}
          {!isPremium ? (
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  padding: '0.25rem',
                  background: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedPlan('lifetime')}
                  style={{
                    padding: '0.5rem 0.25rem',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontWeight: selectedPlan === 'lifetime' ? 600 : 500,
                    background: selectedPlan === 'lifetime' ? 'var(--color-surface)' : 'transparent',
                    color: selectedPlan === 'lifetime' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    boxShadow: selectedPlan === 'lifetime' ? 'var(--shadow-xs)' : 'none',
                  }}
                >
                  Lifetime ($49)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlan('annual')}
                  style={{
                    padding: '0.5rem 0.25rem',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontWeight: selectedPlan === 'annual' ? 600 : 500,
                    background: selectedPlan === 'annual' ? 'var(--color-surface)' : 'transparent',
                    color: selectedPlan === 'annual' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    boxShadow: selectedPlan === 'annual' ? 'var(--shadow-xs)' : 'none',
                  }}
                >
                  Annual ($29/yr)
                </button>
              </div>

              <Button
                variant="primary"
                onClick={handleUpgrade}
                isLoading={loading}
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.9375rem' }}
              >
                Unlock More Room for Us
              </Button>
            </div>
          ) : (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-tint-rose)',
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  marginBottom: '0.75rem',
                }}
              >
                ✓ Active Keepsake Club Space
              </div>
              <Button variant="ghost" onClick={handleRevert} isLoading={loading} style={{ fontSize: '0.8125rem' }}>
                Revert to Free Sanctuary
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Gentle Reassurance Note */}
      <div
        style={{
          textAlign: 'center',
          padding: '1.5rem',
          background: 'var(--color-bg-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <h4 className="font-serif" style={{ fontSize: '1.15rem', marginBottom: '0.35rem', color: 'var(--color-text-primary)' }}>
          Our Promise to Both of You
        </h4>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto' }}>
          We never place ads in your world. We never sell your personal notes. And we will never hold your memories hostage.
          Everything you create belongs exclusively to the two of you.
        </p>
      </div>
    </div>
  );
}

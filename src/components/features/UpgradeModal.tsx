'use client';

import React, { useState } from 'react';
import { PLAN_CONFIG } from '@/lib/config/plans';
import { startCheckout, revertToFreeSanctuary } from '@/server/actions/subscription';
import { Button } from '@/components/ui/Button';
import { IconHeart, IconSparkles } from '@/components/ui/Icons';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAlreadyPremium?: boolean;
  onSuccess?: () => void;
  highlightFeature?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  isAlreadyPremium = false,
  onSuccess,
  highlightFeature,
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'lifetime' | 'annual'>('lifetime');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await startCheckout(selectedPlan);
      if (res.success) {
        if (res.url) {
          // Redirect to Stripe Checkout
          window.location.href = res.url;
          return;
        }
        setSuccessMessage(res.message || 'Welcome to the Little Us Keepsake Club!');
        setTimeout(() => {
          onSuccess?.();
          window.location.reload();
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
          onSuccess?.();
          window.location.reload();
        }, 1200);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-heading"
        className="surface-card"
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: '2.25rem 2rem',
          position: 'relative',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            color: 'var(--color-text-tertiary)',
            cursor: 'pointer',
            padding: '0.25rem',
            lineHeight: 1,
          }}
          aria-label="Close dialog"
        >
          ×
        </button>

        {/* Soft Eyebrow */}
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
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
            }}
          >
            <IconSparkles size={14} /> LITTLE US KEEPSAKE CLUB
          </span>
        </div>

        {/* Emotional Heading */}
        <h2
          id="upgrade-modal-heading"
          className="font-serif"
          style={{
            fontSize: '1.875rem',
            textAlign: 'center',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
            marginBottom: '0.65rem',
          }}
        >
          More room for our story.
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
            marginBottom: '1.75rem',
            padding: '0 0.5rem',
          }}
        >
          Your daily sanctuary is always genuine, private, and free. Upgrade only when you want boundless room to keep
          every photograph, anniversary, and letter without ever deleting a memory.
        </p>

        {highlightFeature && (
          <div
            style={{
              background: 'var(--color-tint-rose)',
              border: '1px solid var(--color-tint-rose-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 1rem',
              marginBottom: '1.5rem',
              fontSize: '0.84375rem',
              color: 'var(--color-accent)',
              textAlign: 'center',
            }}
          >
            ✨ {highlightFeature}
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div
            style={{
              background: 'var(--sage-100)',
              color: 'var(--sage-500)',
              border: '1px solid var(--sage-200)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
              fontSize: '0.9375rem',
              marginBottom: '1.5rem',
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div
            style={{
              background: 'var(--color-tint-rose)',
              color: 'var(--color-accent)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Feature Comparison Pillars */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.75rem',
          }}
        >
          {/* Free Tier */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              background: 'var(--color-bg-subtle)',
            }}
          >
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
              Free Sanctuary
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: '0.75rem' }}>
              Always genuine & ad-free
            </div>
            <ul style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>✓ 1 shared world</li>
              <li>✓ 25 memories</li>
              <li>✓ 15 love notes</li>
              <li>✓ 5 Open When letters</li>
              <li>✓ Basic warm themes</li>
            </ul>
          </div>

          {/* Premium Keepsake */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-tint-rose-border)',
              background: 'var(--color-tint-rose)',
            }}
          >
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '0.35rem' }}>
              Keepsake Club
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
              Boundless room for both of you
            </div>
            <ul style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>❤️ <strong>Unlimited</strong> memories</li>
              <li>❤️ <strong>Unlimited</strong> love notes</li>
              <li>❤️ <strong>Unlimited</strong> Open When</li>
              <li>❤️ All handcrafted themes</li>
              <li>❤️ High-res media & export</li>
            </ul>
          </div>
        </div>

        {/* Pricing Options (Simple & Transparent) */}
        {!isAlreadyPremium && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {/* Lifetime Option */}
            <div
              onClick={() => setSelectedPlan('lifetime')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: selectedPlan === 'lifetime' ? '2px solid var(--color-accent)' : '1px solid var(--color-border-subtle)',
                background: selectedPlan === 'lifetime' ? 'var(--color-surface)' : 'var(--color-bg-subtle)',
                cursor: 'pointer',
                transition: 'all var(--duration-fast)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                    Lifetime Keepsake
                  </span>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-tint-rose)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    Loved Choice
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                  {PLAN_CONFIG.PREMIUM.pricing.lifetime.note}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {PLAN_CONFIG.PREMIUM.pricing.lifetime.price}
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>one-time</div>
              </div>
            </div>

            {/* Annual Option */}
            <div
              onClick={() => setSelectedPlan('annual')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: selectedPlan === 'annual' ? '2px solid var(--color-accent)' : '1px solid var(--color-border-subtle)',
                background: selectedPlan === 'annual' ? 'var(--color-surface)' : 'var(--color-bg-subtle)',
                cursor: 'pointer',
                transition: 'all var(--duration-fast)',
              }}
            >
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                  Annual Keepsake
                </span>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                  {PLAN_CONFIG.PREMIUM.pricing.annual.note}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {PLAN_CONFIG.PREMIUM.pricing.annual.price}
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>/ year</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          {!isAlreadyPremium ? (
            <>
              <Button
                variant="primary"
                onClick={handleUpgrade}
                isLoading={loading}
                style={{ width: '100%', padding: '0.85rem 1.5rem', fontSize: '0.9375rem' }}
              >
                Unlock More Room for Us
              </Button>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                One membership covers both of you forever. No recurring stress.
              </span>
            </>
          ) : (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-tint-rose)',
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                }}
              >
                ✓ Both of you are members of the Keepsake Club
              </div>
              <Button variant="ghost" onClick={handleRevert} isLoading={loading} style={{ fontSize: '0.8125rem' }}>
                Switch back to Free Sanctuary
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

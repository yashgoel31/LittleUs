'use client';

import React, { useState } from 'react';
import { PLAN_CONFIG, PlanTier } from '@/lib/config/plans';
import {
  createRazorpayOrderAction,
  verifyAndActivateSubscription,
  revertToFreeSanctuary,
} from '@/server/actions/subscription';
import { Button } from '@/components/ui/Button';
import { IconSparkles } from '@/components/ui/Icons';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: PlanTier;
  isAlreadyPremium?: boolean;
  onSuccess?: () => void;
  highlightFeature?: string;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentTier = 'FREE',
  isAlreadyPremium = false,
  onSuccess,
  highlightFeature,
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'sweetheart_69' | 'forever_119'>('sweetheart_69');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await createRazorpayOrderAction(selectedPlan);
      if (!res.success || !res.order) {
        setError(res.error || 'Unable to initiate order. Please try again.');
        setLoading(false);
        return;
      }

      // Load Razorpay Checkout SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setError('Unable to reach Razorpay gateway. Please check your network connection.');
        setLoading(false);
        return;
      }

      const options = {
        key: res.order.keyId,
        amount: res.order.amount,
        currency: 'INR',
        name: 'Little Us',
        description: res.order.planName,
        order_id: res.order.orderId,
        handler: async function (response: any) {
          setLoading(true);
          try {
            const verifyRes = await verifyAndActivateSubscription({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planId: selectedPlan,
            });

            if (verifyRes.success) {
              setSuccessMessage(verifyRes.message || 'Welcome to your upgraded space!');
              setTimeout(() => {
                onSuccess?.();
                window.location.reload();
              }, 1200);
            } else {
              setError(verifyRes.error || 'Payment signature verification failed');
            }
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error verifying payment');
          } finally {
            setLoading(false);
          }
        },
        theme: {
          color: '#D4736A',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
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

  const activePlanDetails =
    selectedPlan === 'sweetheart_69' ? PLAN_CONFIG.SWEETHEART : PLAN_CONFIG.FOREVER;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(43, 36, 33, 0.55)',
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
          maxWidth: '580px',
          width: '100%',
          maxHeight: '92vh',
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
            fontSize: '1.35rem',
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
            <IconSparkles size={14} /> LITTLE US SANCTUARY UPGRADE
          </span>
        </div>

        {/* Headline */}
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
            marginBottom: '1.5rem',
            padding: '0 0.5rem',
          }}
        >
          Free Sanctuary gives you 5 memories, 5 love notes, 2 letters, and 4 dates. Unlock gentle,
          spacious room in Indian Rupees without recurring subscriptions.
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

        {/* 3 Tier Overview Comparison */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.15fr 1.15fr',
            gap: '0.5rem',
            marginBottom: '1.75rem',
            fontSize: '0.75rem',
          }}
        >
          {/* Free Sanctuary */}
          <div
            style={{
              padding: '0.75rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-subtle)',
              background: 'var(--color-bg-subtle)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.2rem' }}>
              Free
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>₹0</div>
            <div style={{ color: 'var(--color-text-tertiary)', margin: '0.4rem 0' }}>5 Memories</div>
            <div style={{ color: 'var(--color-text-tertiary)' }}>5 Notes</div>
            <div style={{ color: 'var(--color-text-tertiary)', margin: '0.25rem 0' }}>2 Letters</div>
            <div style={{ color: 'var(--color-text-tertiary)' }}>4 Dates</div>
          </div>

          {/* Sweetheart Club */}
          <div
            onClick={() => setSelectedPlan('sweetheart_69')}
            style={{
              padding: '0.75rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border:
                selectedPlan === 'sweetheart_69'
                  ? '2px solid var(--color-accent)'
                  : '1px solid var(--color-tint-rose-border)',
              background: selectedPlan === 'sweetheart_69' ? 'var(--color-surface)' : 'var(--color-tint-rose)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--color-accent)', marginBottom: '0.2rem' }}>
              Sweetheart
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>₹69</div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', margin: '0.4rem 0' }}>
              10 Memories
            </div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>15 Notes</div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', margin: '0.25rem 0' }}>
              15 Letters
            </div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>20 Dates</div>
          </div>

          {/* Forever Club */}
          <div
            onClick={() => setSelectedPlan('forever_119')}
            style={{
              padding: '0.75rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border:
                selectedPlan === 'forever_119'
                  ? '2px solid var(--color-accent)'
                  : '1px solid var(--color-tint-rose-border)',
              background: selectedPlan === 'forever_119' ? 'var(--color-surface)' : 'var(--color-tint-rose)',
              cursor: 'pointer',
              textAlign: 'center',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-8px',
                right: '6px',
                background: 'var(--color-accent)',
                color: '#fff',
                fontSize: '0.55rem',
                fontWeight: 700,
                padding: '0.1rem 0.35rem',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
              }}
            >
              Popular
            </div>
            <div style={{ fontWeight: 600, color: 'var(--color-accent)', marginBottom: '0.2rem' }}>Forever</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>₹119</div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', margin: '0.4rem 0' }}>
              25 Memories
            </div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>35 Notes</div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', margin: '0.25rem 0' }}>
              30 Letters
            </div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>30 Dates</div>
          </div>
        </div>

        {/* Pricing Selection Cards */}
        {!isAlreadyPremium && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {/* Sweetheart Pack Card */}
            <div
              onClick={() => setSelectedPlan('sweetheart_69')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                border:
                  selectedPlan === 'sweetheart_69'
                    ? '2px solid var(--color-accent)'
                    : '1px solid var(--color-border-subtle)',
                background:
                  selectedPlan === 'sweetheart_69' ? 'var(--color-surface)' : 'var(--color-bg-subtle)',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                    Sweetheart Club
                  </span>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-tint-rose)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    1 Year
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                  10 memories, 15 notes, 15 letters, 20 dates & 15 MB media
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  ₹69
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>/ year</div>
              </div>
            </div>

            {/* Forever Pack Card */}
            <div
              onClick={() => setSelectedPlan('forever_119')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                border:
                  selectedPlan === 'forever_119'
                    ? '2px solid var(--color-accent)'
                    : '1px solid var(--color-border-subtle)',
                background:
                  selectedPlan === 'forever_119' ? 'var(--color-surface)' : 'var(--color-bg-subtle)',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                    Forever Club
                  </span>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-tint-rose)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    1 Year
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                  25 memories, 35 notes, 30 letters, 30 dates & 25 MB media
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  ₹119
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
                Pay {activePlanDetails.priceFormatted} / year with Razorpay
              </Button>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                Annual membership in Indian Rupees (₹). Valid for 365 days for both partners.
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
                ✓ Both of you are upgraded to the {currentTier === 'FOREVER' ? 'Forever Club' : 'Sweetheart Club'}
              </div>
              {currentTier === 'SWEETHEART' && (
                <div style={{ marginBottom: '1rem' }}>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelectedPlan('forever_119');
                      handleUpgrade();
                    }}
                    isLoading={loading}
                    style={{ width: '100%', marginBottom: '0.5rem', fontSize: '0.875rem' }}
                  >
                    Upgrade to Forever Club (₹119)
                  </Button>
                </div>
              )}
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


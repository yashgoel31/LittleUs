'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PLAN_CONFIG, PlanTier } from '@/lib/config/plans';
import {
  getSubscriptionDetails,
  createRazorpayOrderAction,
  verifyAndActivateSubscription,
  revertToFreeSanctuary,
} from '@/server/actions/subscription';
import { Button } from '@/components/ui/Button';
import { IconSparkles, IconHeart } from '@/components/ui/Icons';

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

export default function UpgradePage() {
  const searchParams = useSearchParams();
  const isCheckoutSuccess = searchParams.get('success') === 'true';

  const [selectedPlan, setSelectedPlan] = useState<'sweetheart_69' | 'forever_119'>('sweetheart_69');
  const [subData, setSubData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    isCheckoutSuccess
      ? 'Payment received! Welcome to your upgraded sanctuary ❤️ More room has been unlocked.'
      : null
  );
  const [error, setError] = useState<string | null>(null);

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

  const handleUpgrade = async (planToUpgrade = selectedPlan) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createRazorpayOrderAction(planToUpgrade);
      if (!res.success || !res.order) {
        setError(res.error || 'Unable to create order. Please try again.');
        setLoading(false);
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setError('Unable to load Razorpay payment gateway. Check your internet connection.');
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
              planId: planToUpgrade,
            });

            if (verifyRes.success) {
              setSuccessMessage(verifyRes.message || 'Payment confirmed!');
              setTimeout(() => {
                fetchDetails();
              }, 1000);
            } else {
              setError(verifyRes.error || 'Payment signature verification failed');
            }
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error confirming payment');
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
      setError(err instanceof Error ? err.message : 'An error occurred during upgrade');
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

  const currentTier: PlanTier = subData?.tier || 'FREE';

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '3rem' }}>
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
          <IconSparkles size={13} /> Little Us Sanctuary Packs
        </span>
      </div>

      {/* Main Emotional Headline */}
      <h1
        className="font-serif"
        style={{
          fontSize: 'clamp(1.85rem, 5vw, 2.5rem)',
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
          maxWidth: '580px',
          margin: '0 auto 2.5rem auto',
        }}
      >
        Little Us provides a private, ad-free sanctuary for two. Your free plan is genuine with essential room.
        When your memories grow, unlock thoughtful annual plans in Indian Rupees with 1 full year of room for both of you.
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

      {/* Space Usage Quota */}
      {subData?.usage && (
        <div
          className="surface-card"
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2.5rem',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Your Sanctuary Space Usage
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: subData.displayInfo?.badgeBg,
                color: subData.displayInfo?.badgeColor,
              }}
            >
              {subData.displayInfo?.badgeText}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: 'var(--color-bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
                Memories
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {subData.usage.memories.count}{' '}
                <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>
                  / {subData.usage.memories.limit}
                </span>
              </div>
            </div>

            <div style={{ background: 'var(--color-bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
                Love Notes
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {subData.usage.loveNotes.count}{' '}
                <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>
                  / {subData.usage.loveNotes.limit}
                </span>
              </div>
            </div>

            <div style={{ background: 'var(--color-bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
                Open When Letters
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {subData.usage.letters.count}{' '}
                <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>
                  / {subData.usage.letters.limit}
                </span>
              </div>
            </div>

            <div style={{ background: 'var(--color-bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
                Milestone Dates
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {subData.usage.importantDates.count}{' '}
                <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>
                  / {subData.usage.importantDates.limit}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3 Pillars: Free vs Sweetheart vs Forever */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Tier 1: Free Sanctuary Card */}
        <div
          className="surface-card"
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            border: currentTier === 'FREE' ? '2px solid var(--color-border-subtle)' : '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'var(--color-bg-subtle)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
              Free Sanctuary
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
              ₹0 <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--color-text-tertiary)' }}>forever</span>
            </div>
            <p style={{ fontSize: '0.84375rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              A quiet, essential space for your daily moments. Completely free with basic limits.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.84375rem', color: 'var(--color-text-secondary)' }}>
              {PLAN_CONFIG.FREE.features.map((feat, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-tertiary)' }}>✓</span> {feat}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)', textAlign: 'center' }}>
            {currentTier === 'FREE' ? (
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                ✓ Current Active Plan
              </span>
            ) : (
              <Button variant="ghost" onClick={handleRevert} isLoading={loading} style={{ fontSize: '0.8125rem', width: '100%' }}>
                Revert to Free
              </Button>
            )}
          </div>
        </div>

        {/* Tier 2: Sweetheart Club Card */}
        <div
          className="surface-card"
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            border: currentTier === 'SWEETHEART' ? '2px solid var(--color-accent)' : '1px solid var(--color-tint-rose-border)',
            background: 'var(--color-surface)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '0.25rem' }}>
              Sweetheart Club
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
              ₹69 <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--color-text-tertiary)' }}>/ year</span>
            </div>
            <p style={{ fontSize: '0.84375rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Gentle room for blossoming love. Room for 10 memories, 15 notes, 15 letters, and 20 dates for 1 year.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.84375rem', color: 'var(--color-text-primary)' }}>
              {PLAN_CONFIG.SWEETHEART.features.map((feat, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--color-accent)' }}>❤️</span> {feat}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)', textAlign: 'center' }}>
            {currentTier === 'SWEETHEART' ? (
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-accent)' }}>
                ✓ Current Active Club
              </span>
            ) : (
              <Button
                variant={currentTier === 'FREE' ? 'primary' : 'secondary'}
                onClick={() => handleUpgrade('sweetheart_69')}
                isLoading={loading}
                style={{ width: '100%', fontSize: '0.875rem' }}
              >
                Get Sweetheart (₹69 / yr)
              </Button>
            )}
          </div>
        </div>

        {/* Tier 3: Forever Club Card */}
        <div
          className="surface-card"
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            border: currentTier === 'FOREVER' ? '2px solid var(--color-accent)' : '2px solid var(--color-tint-rose-border)',
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
              right: '18px',
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
            Most Cherished
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '0.25rem' }}>
              Forever Club
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
              ₹119 <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--color-text-tertiary)' }}>/ year</span>
            </div>
            <p style={{ fontSize: '0.84375rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Endless spacious sanctuary for your whole journey. Generous room for memories, notes, letters, and custom themes.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.84375rem', color: 'var(--color-text-primary)' }}>
              {PLAN_CONFIG.FOREVER.features.map((feat, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--color-accent)' }}>✨</span> {feat}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)', textAlign: 'center' }}>
            {currentTier === 'FOREVER' ? (
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-accent)' }}>
                ✓ Current Active Club
              </span>
            ) : (
              <Button
                variant="primary"
                onClick={() => handleUpgrade('forever_119')}
                isLoading={loading}
                style={{ width: '100%', fontSize: '0.875rem' }}
              >
                Get Forever (₹119 / yr)
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Intimate Sanctuary Reassurance Quote */}
      <div
        style={{
          textAlign: 'center',
          padding: '2rem 1.5rem',
          background: 'var(--color-tint-rose)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-tint-rose-border)',
        }}
      >
        <div style={{ color: 'var(--color-accent)', marginBottom: '0.65rem', display: 'flex', justifyContent: 'center' }}>
          <IconHeart size={24} />
        </div>
        <h4 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '0.65rem', color: 'var(--color-text-primary)' }}>
          Our Promise to Both of You
        </h4>
        <p
          className="font-serif"
          style={{
            fontSize: '1.1rem',
            fontStyle: 'italic',
            color: 'var(--color-text-primary)',
            lineHeight: 1.6,
            maxWidth: '520px',
            margin: '0 auto 0.75rem auto',
          }}
        >
          “In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.”
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, maxWidth: '500px', margin: '0 auto' }}>
          Little Us was crafted to be a quiet, tender sanctuary for two. No public feeds, no ads, and no noise.
          Every whisper, note, and memory you share here remains forever safe, belonging exclusively to the two of you.
        </p>
      </div>
    </div>
  );
}

/**
 * Subscription State Model and Server-side Verification
 *
 * Strict security requirement:
 * "Never trust the frontend to determine whether a user is upgraded.
 *  Access and limits must be verified from server-side subscription state."
 */

import { PlanTier, PLAN_CONFIG, normalizeTier } from '@/lib/config/plans';

export type SubscriptionStatus = 'FREE' | 'ACTIVE' | 'CANCELED' | 'EXPIRED';

export interface SubscriptionRecord {
  id?: string;
  tier: string;
  status: string;
  planType?: string | null;
  amount?: number | null;
  currency?: string | null;
  currentPeriodEnd?: Date | string | null;
  cancelAtPeriodEnd?: boolean | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
}

/**
 * Returns the verified active PlanTier ('FREE' | 'SWEETHEART' | 'FOREVER')
 */
export function getSubscriptionTier(subscription: SubscriptionRecord | null | undefined): PlanTier {
  if (!subscription) return 'FREE';

  const normalizedStatus = (subscription.status || 'FREE').toUpperCase();
  if (normalizedStatus !== 'ACTIVE') {
    return 'FREE';
  }

  // 1-Year Expiration Check
  if (subscription.currentPeriodEnd) {
    const periodEnd = new Date(subscription.currentPeriodEnd);
    if (!isNaN(periodEnd.getTime()) && periodEnd.getTime() < Date.now()) {
      return 'FREE';
    }
  }

  return normalizeTier(subscription.tier);
}

/**
 * Verified check: returns true if the couple has either Sweetheart or Forever active plan.
 */
export function isPremiumSubscriber(subscription: SubscriptionRecord | null | undefined): boolean {
  const tier = getSubscriptionTier(subscription);
  return tier === 'SWEETHEART' || tier === 'FOREVER';
}

/**
 * Returns user-friendly status badge metadata and notes for UI display.
 */
export function getSubscriptionDisplayInfo(subscription: SubscriptionRecord | null | undefined) {
  const tier = getSubscriptionTier(subscription);
  const rawStatus = (subscription?.status || 'FREE').toUpperCase();
  const config = PLAN_CONFIG[tier];

  // Check if expired
  const isExpired =
    rawStatus === 'ACTIVE' &&
    subscription?.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd).getTime() < Date.now();

  let validUntilFormatted: string | null = null;
  if (subscription?.currentPeriodEnd) {
    const periodEnd = new Date(subscription.currentPeriodEnd);
    if (!isNaN(periodEnd.getTime())) {
      validUntilFormatted = periodEnd.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  }

  let badgeText: string = config.badge;
  let badgeColor = 'var(--color-text-secondary)';
  let badgeBg = 'var(--color-bg-subtle)';
  let note = 'Essential quiet room (5 memories, 5 notes, 2 letters, 4 dates)';

  if (isExpired) {
    badgeText = 'Expired (Free)';
    badgeColor = 'var(--color-text-secondary)';
    badgeBg = 'var(--color-bg-subtle)';
    note = `Your 1-year club access expired on ${validUntilFormatted || 'recently'}. Your space has reverted to Free Sanctuary. All existing memories remain safe.`;
  } else if (tier === 'SWEETHEART') {
    badgeText = 'Sweetheart Club (₹69 / yr)';
    badgeColor = 'var(--color-accent)';
    badgeBg = 'var(--color-tint-rose)';
    note = validUntilFormatted
      ? `Sweetheart Room: 10 memories, 15 notes, 15 letters, 20 dates • Valid until ${validUntilFormatted}`
      : 'Sweetheart Room: 10 memories, 15 notes, 15 letters, 20 dates (₹69 / year)';
  } else if (tier === 'FOREVER') {
    badgeText = 'Forever Club (₹119 / yr)';
    badgeColor = 'var(--color-accent)';
    badgeBg = 'var(--color-tint-rose)';
    note = validUntilFormatted
      ? `Forever Room: 25 memories, 35 notes, 30 letters, 30 dates • Valid until ${validUntilFormatted}`
      : 'Forever Room: 25 memories, 35 notes, 30 letters, 30 dates (₹119 / year)';
  } else if (rawStatus === 'CANCELED') {
    badgeText = 'Plan Reset';
    badgeColor = 'var(--color-text-secondary)';
    badgeBg = 'var(--color-bg-subtle)';
    note = 'Your space is on the Free Sanctuary tier. All existing memories remain safe.';
  }

  return {
    tier,
    isPremium: tier !== 'FREE',
    status: isExpired ? 'EXPIRED' : rawStatus,
    badgeText,
    badgeColor,
    badgeBg,
    note,
    validUntil: validUntilFormatted,
    planName: config.name,
    priceFormatted: config.priceFormatted,
  };
}


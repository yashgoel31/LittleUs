/**
 * Subscription State Model and Server-side Verification
 *
 * Strict security requirement:
 * "Never trust the frontend to determine whether a user is premium.
 *  Premium access must be determined from verified server-side subscription state."
 */

export type SubscriptionStatus =
  | 'FREE'
  | 'ACTIVE'
  | 'TRIALING'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'INACTIVE';

export type SubscriptionTier = 'FREE' | 'PREMIUM';

export interface SubscriptionRecord {
  id?: string;
  tier: string;
  status: string;
  planType?: string | null;
  currentPeriodEnd?: Date | string | null;
  cancelAtPeriodEnd?: boolean | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
}

/**
 * Verified Server-Side Premium Check.
 * Handles:
 * - active: Full access
 * - trialing: Full access
 * - past_due: Locked out of premium creation until payment is fixed
 * - canceled: Access granted only if within remaining paid period (currentPeriodEnd > now)
 * - expired/inactive: Locked out
 */
export function isPremiumSubscriber(subscription: SubscriptionRecord | null | undefined): boolean {
  if (!subscription) return false;
  if (subscription.tier !== 'PREMIUM') return false;

  const now = new Date();
  const normalizedStatus = (subscription.status || 'FREE').toUpperCase();

  switch (normalizedStatus) {
    case 'ACTIVE':
    case 'TRIALING':
      return true;

    case 'CANCELED':
    case 'CANCELLED':
      // If canceled, couple retains access until their paid billing period expires
      if (subscription.currentPeriodEnd) {
        const periodEnd = new Date(subscription.currentPeriodEnd);
        return periodEnd > now;
      }
      return false;

    case 'PAST_DUE':
    case 'INCOMPLETE_EXPIRED':
    case 'UNPAID':
    case 'INACTIVE':
    case 'FREE':
    default:
      return false;
  }
}

/**
 * Returns user-friendly status badge metadata for UI display.
 */
export function getSubscriptionDisplayInfo(subscription: SubscriptionRecord | null | undefined) {
  const isPremium = isPremiumSubscriber(subscription);
  const status = (subscription?.status || 'FREE').toUpperCase();
  const planType = subscription?.planType === 'annual' ? 'Annual Keepsake' : 'Lifetime Keepsake';
  const periodEnd = subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
  const isCancelScheduled = Boolean(subscription?.cancelAtPeriodEnd && periodEnd && periodEnd > new Date());

  let badgeText = 'Free Sanctuary';
  let badgeColor = 'var(--text-secondary)';
  let badgeBg = 'var(--bg-secondary)';
  let note = 'Genuinely free for your daily story';

  if (isPremium) {
    if (isCancelScheduled) {
      badgeText = 'Canceling Soon';
      badgeColor = '#B45309'; // Amber
      badgeBg = '#FEF3C7';
      note = `Access remains active until ${periodEnd?.toLocaleDateString()}`;
    } else if (status === 'TRIALING') {
      badgeText = 'Trialing Keepsake';
      badgeColor = 'var(--color-accent)';
      badgeBg = 'var(--color-tint-rose)';
      note = `Trial active until ${periodEnd?.toLocaleDateString() || 'period end'}`;
    } else {
      badgeText = subscription?.planType === 'annual' ? 'Active Annual' : 'Lifetime Keepsake';
      badgeColor = 'var(--color-accent)';
      badgeBg = 'var(--color-tint-rose)';
      note =
        subscription?.planType === 'annual'
          ? `Renews on ${periodEnd?.toLocaleDateString()}`
          : 'One quiet gift for your whole story';
    }
  } else if (status === 'PAST_DUE') {
    badgeText = 'Payment Past Due';
    badgeColor = '#DC2626'; // Red
    badgeBg = '#FEE2E2';
    note = 'Your latest payment did not go through. Please update payment method.';
  } else if (status === 'CANCELED') {
    badgeText = 'Membership Expired';
    badgeColor = 'var(--text-secondary)';
    badgeBg = 'var(--bg-secondary)';
    note = 'Your keepsake membership has ended. All memories remain safe.';
  }

  return {
    isPremium,
    status,
    planType,
    periodEnd,
    isCancelScheduled,
    badgeText,
    badgeColor,
    badgeBg,
    note,
  };
}

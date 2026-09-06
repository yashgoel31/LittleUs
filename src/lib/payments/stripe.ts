import Stripe from 'stripe';
import { PLAN_CONFIG } from '@/lib/config/plans';

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  : null;

export const TIER_LIMITS = {
  FREE: {
    maxMemories: PLAN_CONFIG.FREE.maxMemories,
    maxLoveNotes: PLAN_CONFIG.FREE.maxLoveNotes,
    maxLetters: PLAN_CONFIG.FREE.maxLetters,
    maxImportantDates: PLAN_CONFIG.FREE.maxImportantDates,
    maxMediaSizeMb: PLAN_CONFIG.FREE.maxMediaSizeMb,
    canUseCustomThemes: false,
    canExportArchive: false,
  },
  PREMIUM: {
    maxMemories: PLAN_CONFIG.PREMIUM.maxMemories,
    maxLoveNotes: PLAN_CONFIG.PREMIUM.maxLoveNotes,
    maxLetters: PLAN_CONFIG.PREMIUM.maxLetters,
    maxImportantDates: PLAN_CONFIG.PREMIUM.maxImportantDates,
    maxMediaSizeMb: PLAN_CONFIG.PREMIUM.maxMediaSizeMb,
    canUseCustomThemes: true,
    canExportArchive: true,
  },
} as const;

export type PlanTier = keyof typeof TIER_LIMITS;

export function getTierLimits(isPremium: boolean) {
  return isPremium ? TIER_LIMITS.PREMIUM : TIER_LIMITS.FREE;
}

/**
 * Checks whether an action exceeds the couple's plan limits.
 * Single unified helper for memories, love notes, letters, and important dates.
 */
export function checkPlanLimit(
  isPremium: boolean,
  resourceType: 'memories' | 'loveNotes' | 'letters' | 'importantDates',
  currentCount: number
): { allowed: boolean; limit: number; remaining: number } {
  const limits = getTierLimits(isPremium);
  let limit: number = Infinity;

  switch (resourceType) {
    case 'memories':
      limit = limits.maxMemories;
      break;
    case 'loveNotes':
      limit = limits.maxLoveNotes;
      break;
    case 'letters':
      limit = limits.maxLetters;
      break;
    case 'importantDates':
      limit = limits.maxImportantDates;
      break;
  }

  const allowed = currentCount < limit;
  const remaining = Math.max(0, limit - currentCount);

  return { allowed, limit, remaining };
}

/**
 * Ensures or retrieves a Stripe Customer for the given couple.
 */
export async function getOrCreateStripeCustomer(params: {
  coupleId: string;
  coupleName: string;
  email: string;
  currentStripeCustomerId?: string | null;
}): Promise<string | null> {
  if (!stripe) return null;

  if (params.currentStripeCustomerId) {
    try {
      const existing = await stripe.customers.retrieve(params.currentStripeCustomerId);
      if (!('deleted' in existing) || !existing.deleted) {
        return existing.id;
      }
    } catch {
      // Customer may have been deleted in Stripe test mode, create a new one below
    }
  }

  const customer = await stripe.customers.create({
    email: params.email,
    name: params.coupleName,
    metadata: {
      coupleId: params.coupleId,
    },
  });

  return customer.id;
}

/**
 * Creates a Stripe Checkout Session for Annual Subscription or Lifetime Payment.
 */
export async function createCheckoutSession(params: {
  coupleId: string;
  coupleName: string;
  email: string;
  plan: 'annual' | 'lifetime';
  currentStripeCustomerId?: string | null;
}): Promise<{ url: string | null; sessionId?: string; isSimulated?: boolean }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!stripe) {
    return {
      url: null,
      isSimulated: true,
    };
  }

  const customerId = await getOrCreateStripeCustomer({
    coupleId: params.coupleId,
    coupleName: params.coupleName,
    email: params.email,
    currentStripeCustomerId: params.currentStripeCustomerId,
  });

  if (params.plan === 'annual') {
    const lineItem = process.env.STRIPE_PRICE_ID_ANNUAL
      ? { price: process.env.STRIPE_PRICE_ID_ANNUAL, quantity: 1 }
      : {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Little Us Keepsake Club (Annual)',
              description: 'Boundless memories, letters, and custom themes for both of you.',
            },
            unit_amount: 2900, // $29.00 / year
            recurring: {
              interval: 'year' as const,
            },
          },
          quantity: 1,
        };

    const session = await stripe.checkout.sessions.create({
      customer: customerId || undefined,
      customer_email: customerId ? undefined : params.email,
      client_reference_id: params.coupleId,
      mode: 'subscription',
      line_items: [lineItem],
      subscription_data: {
        metadata: {
          coupleId: params.coupleId,
          planType: 'annual',
        },
      },
      metadata: {
        coupleId: params.coupleId,
        planType: 'annual',
      },
      success_url: `${appUrl}/upgrade?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${appUrl}/upgrade?canceled=true`,
    });

    return { url: session.url, sessionId: session.id };
  } else {
    // Lifetime Keepsake (One-time payment)
    const lineItem = process.env.STRIPE_PRICE_ID_LIFETIME
      ? { price: process.env.STRIPE_PRICE_ID_LIFETIME, quantity: 1 }
      : {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Little Us Keepsake Club (Lifetime)',
              description: 'One quiet gift for your entire story. Infinite room forever.',
            },
            unit_amount: 4900, // $49.00 one-time
          },
          quantity: 1,
        };

    const session = await stripe.checkout.sessions.create({
      customer: customerId || undefined,
      customer_email: customerId ? undefined : params.email,
      client_reference_id: params.coupleId,
      mode: 'payment',
      line_items: [lineItem],
      metadata: {
        coupleId: params.coupleId,
        planType: 'lifetime',
      },
      success_url: `${appUrl}/upgrade?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${appUrl}/upgrade?canceled=true`,
    });

    return { url: session.url, sessionId: session.id };
  }
}

/**
 * Creates a Stripe Customer Billing Portal Session for managing cards, invoices, or cancellations.
 */
export async function createBillingPortalSession(params: {
  stripeCustomerId: string;
}): Promise<string | null> {
  if (!stripe) return null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: params.stripeCustomerId,
    return_url: `${appUrl}/settings`,
  });

  return portalSession.url;
}

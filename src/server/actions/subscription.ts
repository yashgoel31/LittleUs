'use server';

import { db } from '@/lib/db';
import { requireCoupleAuth } from '@/lib/auth/guard';
import { PLAN_CONFIG, getPlanConfig } from '@/lib/config/plans';
import {
  stripe,
  createCheckoutSession,
  createBillingPortalSession,
} from '@/lib/payments/stripe';
import {
  isPremiumSubscriber,
  getSubscriptionDisplayInfo,
} from '@/lib/payments/subscriptionStatus';

export async function getSubscriptionDetails() {
  const auth = await requireCoupleAuth();

  const couple = await db.couple.findUnique({
    where: { id: auth.coupleId },
    select: {
      id: true,
      name: true,
      theme: true,
      subscription: {
        select: {
          id: true,
          status: true,
          tier: true,
          planType: true,
          stripePriceId: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          cancelAtPeriodEnd: true,
          currentPeriodEnd: true,
        },
      },
      _count: {
        select: {
          memories: true,
          loveNotes: true,
          openWhenLetters: true,
          importantDates: true,
        },
      },
    },
  });

  if (!couple) {
    throw new Error('Couple space not found');
  }

  const isPremium = isPremiumSubscriber(couple.subscription);
  const currentPlan = getPlanConfig(isPremium);
  const displayInfo = getSubscriptionDisplayInfo(couple.subscription);

  const usage = {
    memories: {
      count: couple._count.memories,
      limit: currentPlan.maxMemories,
      isUnlimited: currentPlan.maxMemories === Infinity,
      percent:
        currentPlan.maxMemories === Infinity
          ? 0
          : Math.min(100, Math.round((couple._count.memories / currentPlan.maxMemories) * 100)),
    },
    loveNotes: {
      count: couple._count.loveNotes,
      limit: currentPlan.maxLoveNotes,
      isUnlimited: currentPlan.maxLoveNotes === Infinity,
      percent:
        currentPlan.maxLoveNotes === Infinity
          ? 0
          : Math.min(100, Math.round((couple._count.loveNotes / currentPlan.maxLoveNotes) * 100)),
    },
    letters: {
      count: couple._count.openWhenLetters,
      limit: currentPlan.maxLetters,
      isUnlimited: currentPlan.maxLetters === Infinity,
      percent:
        currentPlan.maxLetters === Infinity
          ? 0
          : Math.min(100, Math.round((couple._count.openWhenLetters / currentPlan.maxLetters) * 100)),
    },
    importantDates: {
      count: couple._count.importantDates,
      limit: currentPlan.maxImportantDates,
      isUnlimited: currentPlan.maxImportantDates === Infinity,
      percent:
        currentPlan.maxImportantDates === Infinity
          ? 0
          : Math.min(100, Math.round((couple._count.importantDates / currentPlan.maxImportantDates) * 100)),
    },
  };

  return {
    isPremium,
    plan: currentPlan,
    subscription: couple.subscription,
    displayInfo,
    usage,
    theme: couple.theme,
    hasStripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
  };
}

/**
 * Initiates Checkout for the Little Us Keepsake Club.
 * Redirects to real Stripe Checkout if configured, or gracefully activates in dev mode.
 */
export async function startCheckout(planOption: 'annual' | 'lifetime' = 'lifetime') {
  const auth = await requireCoupleAuth();

  const couple = await db.couple.findUnique({
    where: { id: auth.coupleId },
    include: { subscription: true },
  });

  if (!couple) {
    return { success: false, error: 'Sanctuary space not found' };
  }

  // If Stripe is configured with a valid secret key, create a real Stripe Checkout Session
  if (process.env.STRIPE_SECRET_KEY && stripe) {
    try {
      const checkout = await createCheckoutSession({
        coupleId: auth.coupleId,
        coupleName: auth.coupleName,
        email: auth.userEmail,
        plan: planOption,
        currentStripeCustomerId: couple.subscription?.stripeCustomerId,
      });

      if (checkout.url) {
        return {
          success: true,
          url: checkout.url,
          sessionId: checkout.sessionId,
        };
      }
    } catch (err: unknown) {
      console.error('[Stripe Checkout Creation Error]:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unable to initiate checkout with payment provider.',
      };
    }
  }

  // Dev fallback / Simulated activation when running in local dev without live Stripe keys
  await db.subscription.upsert({
    where: { coupleId: auth.coupleId },
    update: {
      tier: 'PREMIUM',
      status: 'ACTIVE',
      planType: planOption,
      stripePriceId: planOption,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: planOption === 'annual' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
    },
    create: {
      coupleId: auth.coupleId,
      tier: 'PREMIUM',
      status: 'ACTIVE',
      planType: planOption,
      stripePriceId: planOption,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: planOption === 'annual' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
    },
  });

  return {
    success: true,
    simulated: true,
    message: 'Welcome to the Little Us Keepsake Club. More room has been unlocked for your story.',
  };
}

/**
 * Creates a Stripe Billing Portal session for the couple to update card or manage invoices.
 */
export async function openBillingPortal() {
  const auth = await requireCoupleAuth();

  const subscription = await db.subscription.findUnique({
    where: { coupleId: auth.coupleId },
  });

  if (!subscription?.stripeCustomerId) {
    return {
      success: false,
      error: 'No payment record found with payment provider. If this was a simulated upgrade, manage it directly here.',
    };
  }

  try {
    const portalUrl = await createBillingPortalSession({
      stripeCustomerId: subscription.stripeCustomerId,
    });

    if (portalUrl) {
      return { success: true, url: portalUrl };
    }
    return { success: false, error: 'Could not generate billing portal session' };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to reach customer billing portal',
    };
  }
}

/**
 * Cancels the annual membership.
 * Follows Stripe best practices: cancels at period end so the couple keeps what they paid for.
 */
export async function cancelSubscription() {
  const auth = await requireCoupleAuth();

  const subscription = await db.subscription.findUnique({
    where: { coupleId: auth.coupleId },
  });

  if (!subscription) {
    return { success: false, error: 'No subscription record found' };
  }

  // If connected to Stripe subscription
  if (stripe && subscription.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          cancelAtPeriodEnd: true,
        },
      });

      return {
        success: true,
        message: 'Your membership is scheduled to cancel. You will have full access until your billing period ends.',
      };
    } catch (err: unknown) {
      console.error('[Stripe Cancel Error]:', err);
    }
  }

  // Local/simulated cancellation
  await db.subscription.update({
    where: { id: subscription.id },
    data: {
      cancelAtPeriodEnd: true,
      status: 'CANCELED',
    },
  });

  return {
    success: true,
    message: 'Your membership has been set to cancel. All existing memories remain completely safe.',
  };
}

/**
 * Resumes an annual subscription that was scheduled to cancel at period end.
 */
export async function resumeSubscription() {
  const auth = await requireCoupleAuth();

  const subscription = await db.subscription.findUnique({
    where: { coupleId: auth.coupleId },
  });

  if (!subscription) {
    return { success: false, error: 'No subscription record found' };
  }

  if (stripe && subscription.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });
    } catch (err: unknown) {
      console.error('[Stripe Resume Error]:', err);
    }
  }

  await db.subscription.update({
    where: { id: subscription.id },
    data: {
      cancelAtPeriodEnd: false,
      status: 'ACTIVE',
      tier: 'PREMIUM',
    },
  });

  return {
    success: true,
    message: 'Your Keepsake Club membership has been resumed seamlessly.',
  };
}

/**
 * Reverts to Free Sanctuary (test helper & instant downgrade).
 */
export async function revertToFreeSanctuary() {
  const auth = await requireCoupleAuth();

  const subscription = await db.subscription.findUnique({
    where: { coupleId: auth.coupleId },
  });

  if (stripe && subscription?.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    } catch (err: unknown) {
      console.error('[Stripe Cancel Error]:', err);
    }
  }

  await db.subscription.upsert({
    where: { coupleId: auth.coupleId },
    update: {
      tier: 'FREE',
      status: 'FREE',
      stripePriceId: null,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
    },
    create: {
      coupleId: auth.coupleId,
      tier: 'FREE',
      status: 'FREE',
    },
  });

  return {
    success: true,
    message: 'Your sanctuary is now on the Free plan. All memories and letters remain safe.',
  };
}

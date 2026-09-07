'use server';

import { db } from '@/lib/db';
import { requireCoupleAuth } from '@/lib/auth/guard';
import { PLAN_CONFIG, PlanTier, getPlanConfig } from '@/lib/config/plans';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  RazorpayOrderResult,
} from '@/lib/payments/razorpay';
import {
  getSubscriptionTier,
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
          amount: true,
          currency: true,
          razorpayOrderId: true,
          razorpayPaymentId: true,
          currentPeriodEnd: true,
          createdAt: true,
          updatedAt: true,
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

  const activeTier = getSubscriptionTier(couple.subscription);
  const currentPlan = getPlanConfig(activeTier);
  const displayInfo = getSubscriptionDisplayInfo(couple.subscription);

  const usage = {
    memories: {
      count: couple._count.memories,
      limit: currentPlan.maxMemories,
      isUnlimited: false,
      percent: Math.min(100, Math.round((couple._count.memories / currentPlan.maxMemories) * 100)),
    },
    loveNotes: {
      count: couple._count.loveNotes,
      limit: currentPlan.maxLoveNotes,
      isUnlimited: false,
      percent: Math.min(100, Math.round((couple._count.loveNotes / currentPlan.maxLoveNotes) * 100)),
    },
    letters: {
      count: couple._count.openWhenLetters,
      limit: currentPlan.maxLetters,
      isUnlimited: false,
      percent: Math.min(100, Math.round((couple._count.openWhenLetters / currentPlan.maxLetters) * 100)),
    },
    importantDates: {
      count: couple._count.importantDates,
      limit: currentPlan.maxImportantDates,
      isUnlimited: false,
      percent: Math.min(100, Math.round((couple._count.importantDates / currentPlan.maxImportantDates) * 100)),
    },
  };

  return {
    tier: activeTier,
    isPremium: isPremiumSubscriber(couple.subscription),
    plan: currentPlan,
    subscription: couple.subscription,
    displayInfo,
    usage,
    theme: couple.theme,
    plans: PLAN_CONFIG,
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_simulated',
    hasRazorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
  };
}

/**
 * Creates a Razorpay Order for Sweetheart Club (₹69) or Forever Club (₹119)
 */
export async function createRazorpayOrderAction(planId: 'sweetheart_69' | 'forever_119') {
  const auth = await requireCoupleAuth();

  const couple = await db.couple.findUnique({
    where: { id: auth.coupleId },
  });

  if (!couple) {
    return { success: false, error: 'Couple space not found' };
  }

  try {
    const order = await createRazorpayOrder({
      coupleId: auth.coupleId,
      coupleName: auth.coupleName,
      email: auth.userEmail,
      planId,
    });

    return {
      success: true,
      order,
    };
  } catch (err: unknown) {
    console.error('[Razorpay Order Creation Error]:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unable to create payment order',
    };
  }
}

/**
 * Verifies Razorpay payment signature and upgrades couple space to SWEETHEART or FOREVER for 1 year (365 days).
 */
export async function verifyAndActivateSubscription(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  planId: 'sweetheart_69' | 'forever_119';
}) {
  const auth = await requireCoupleAuth();

  const isValid = verifyRazorpaySignature({
    orderId: params.orderId,
    paymentId: params.paymentId,
    signature: params.signature,
  });

  if (!isValid) {
    return {
      success: false,
      error: 'Payment verification failed. Invalid digital signature from payment provider.',
    };
  }

  const targetTier: PlanTier = params.planId === 'sweetheart_69' ? 'SWEETHEART' : 'FOREVER';
  const plan = PLAN_CONFIG[targetTier];
  const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  await db.subscription.upsert({
    where: { coupleId: auth.coupleId },
    update: {
      tier: targetTier,
      status: 'ACTIVE',
      planType: params.planId,
      amount: plan.priceInPaise,
      currency: 'INR',
      currentPeriodEnd: oneYearFromNow,
      razorpayOrderId: params.orderId,
      razorpayPaymentId: params.paymentId,
      razorpaySignature: params.signature,
    },
    create: {
      coupleId: auth.coupleId,
      tier: targetTier,
      status: 'ACTIVE',
      planType: params.planId,
      amount: plan.priceInPaise,
      currency: 'INR',
      currentPeriodEnd: oneYearFromNow,
      razorpayOrderId: params.orderId,
      razorpayPaymentId: params.paymentId,
      razorpaySignature: params.signature,
    },
  });

  return {
    success: true,
    tier: targetTier,
    planName: plan.name,
    message: `Welcome to the ${plan.name}! 1-year access has been unlocked for your sanctuary story.`,
  };
}

/**
 * Initiates Checkout / Direct activation for simulated dev or callers
 */
export async function startCheckout(planOption: 'sweetheart_69' | 'forever_119' | 'annual' | 'lifetime' = 'sweetheart_69') {
  const normalizedPlanId =
    planOption === 'lifetime' || planOption === 'forever_119' ? 'forever_119' : 'sweetheart_69';

  return createRazorpayOrderAction(normalizedPlanId);
}

/**
 * Cancels or resets membership to Free Sanctuary.
 */
export async function cancelSubscription() {
  return revertToFreeSanctuary();
}

/**
 * Resumes membership
 */
export async function resumeSubscription() {
  return {
    success: true,
    message: 'Your membership is active.',
  };
}

/**
 * Billing portal placeholder for Razorpay
 */
export async function openBillingPortal() {
  return {
    success: false,
    error: 'Your pack is a one-time payment in INR. No recurring invoices need management.',
  };
}

/**
 * Reverts couple space to Free Sanctuary.
 */
export async function revertToFreeSanctuary() {
  const auth = await requireCoupleAuth();

  await db.subscription.upsert({
    where: { coupleId: auth.coupleId },
    update: {
      tier: 'FREE',
      status: 'FREE',
      planType: 'free',
      amount: 0,
      currency: 'INR',
      razorpayOrderId: null,
      razorpayPaymentId: null,
      razorpaySignature: null,
    },
    create: {
      coupleId: auth.coupleId,
      tier: 'FREE',
      status: 'FREE',
      planType: 'free',
      amount: 0,
      currency: 'INR',
    },
  });

  return {
    success: true,
    message: 'Your sanctuary is now on the Free Sanctuary tier. All existing memories remain safe.',
  };
}


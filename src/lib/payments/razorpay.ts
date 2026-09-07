import Razorpay from 'razorpay';
import crypto from 'crypto';
import { PLAN_CONFIG, PlanTier, checkPlanLimit, getPlanConfig } from '@/lib/config/plans';

/**
 * Gets or initializes the Razorpay Server Instance with latest credentials
 */
export function getRazorpayClient(): Razorpay | null {
  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export { checkPlanLimit, getPlanConfig };

export interface RazorpayOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId?: string;
  simulated?: boolean;
  planId: 'sweetheart_69' | 'forever_119';
  planName: string;
}

/**
 * Creates a Razorpay Order for Sweetheart Club (₹69) or Forever Club (₹119)
 */
export async function createRazorpayOrder(params: {
  coupleId: string;
  coupleName: string;
  email: string;
  planId: 'sweetheart_69' | 'forever_119';
}): Promise<RazorpayOrderResult> {
  const planTier: PlanTier = params.planId === 'sweetheart_69' ? 'SWEETHEART' : 'FOREVER';
  const plan = PLAN_CONFIG[planTier];
  const client = getRazorpayClient();
  const keyId = (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '').trim();

  // Require Razorpay credentials from .env
  if (!client || !keyId) {
    throw new Error(
      'Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file to initiate payment.'
    );
  }

  // Generate a unique receipt string (max 40 chars for Razorpay)
  const receipt = `rcpt_${params.coupleId.substring(0, 10)}_${Date.now()}`.substring(0, 40);
  const amountInPaise = plan.priceInPaise;

  const order = await client.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt,
    notes: {
      coupleId: params.coupleId,
      coupleName: params.coupleName,
      userEmail: params.email,
      planId: params.planId,
      tier: planTier,
    },
  });

  return {
    orderId: order.id,
    amount: typeof order.amount === 'number' ? order.amount : Number(order.amount),
    currency: order.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    planId: params.planId,
    planName: plan.name,
  };
}

/**
 * Verifies Razorpay checkout signature HMAC-SHA256
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return false;
  }

  const body = `${params.orderId}|${params.paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === params.signature;
}

/**
 * Verifies Webhook signature
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
}

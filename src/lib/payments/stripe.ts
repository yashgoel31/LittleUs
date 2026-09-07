/**
 * Backwards compatibility re-exports.
 * Payments have been transitioned from Stripe to Razorpay (INR only).
 */
export * from '@/lib/payments/razorpay';
export { checkPlanLimit, getPlanConfig } from '@/lib/config/plans';


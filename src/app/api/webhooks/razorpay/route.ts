import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyRazorpayWebhookSignature } from '@/lib/payments/razorpay';
import { db } from '@/lib/db';
import { PLAN_CONFIG, PlanTier } from '@/lib/config/plans';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const headerList = await headers();
  const signature = headerList.get('x-razorpay-signature');

  const rawBody = await req.text();

  // If webhook secret is configured, verify signature strictly
  if (webhookSecret) {
    if (!signature) {
      return NextResponse.json({ error: 'Missing x-razorpay-signature' }, { status: 400 });
    }

    const isValid = verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.error('[Razorpay Webhook Signature Verification Failed]');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const eventId = event?.event_id || event?.id || `evt_${Date.now()}`;
  const eventType = event?.event;

  // Idempotency check: Ensure the event hasn't already been processed
  const existingEvent = await db.processedWebhook.findUnique({
    where: { id: eventId },
  });

  if (existingEvent) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (eventType === 'order.paid' || eventType === 'payment.captured') {
      const paymentEntity = event?.payload?.payment?.entity;
      const orderEntity = event?.payload?.order?.entity;

      const coupleId =
        orderEntity?.notes?.coupleId ||
        paymentEntity?.notes?.coupleId;

      const planId =
        orderEntity?.notes?.planId ||
        paymentEntity?.notes?.planId ||
        'sweetheart_69';

      const targetTier: PlanTier = planId === 'forever_119' ? 'FOREVER' : 'SWEETHEART';
      const plan = PLAN_CONFIG[targetTier];

      if (coupleId) {
        const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

        await db.subscription.upsert({
          where: { coupleId },
          update: {
            status: 'ACTIVE',
            tier: targetTier,
            planType: planId,
            amount: plan.priceInPaise,
            currency: 'INR',
            currentPeriodEnd: oneYearFromNow,
            razorpayOrderId: orderEntity?.id || paymentEntity?.order_id,
            razorpayPaymentId: paymentEntity?.id,
          },
          create: {
            coupleId,
            status: 'ACTIVE',
            tier: targetTier,
            planType: planId,
            amount: plan.priceInPaise,
            currency: 'INR',
            currentPeriodEnd: oneYearFromNow,
            razorpayOrderId: orderEntity?.id || paymentEntity?.order_id,
            razorpayPaymentId: paymentEntity?.id,
          },
        });

        console.log(`[Razorpay Webhook] Activated ${targetTier} for 1 year for couple ${coupleId}`);
      }
    }

    // Record processed webhook for idempotency
    await db.processedWebhook.create({
      data: {
        id: eventId,
        type: eventType || 'unknown',
      },
    });

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error('[Razorpay Webhook Processing Error]:', err);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}

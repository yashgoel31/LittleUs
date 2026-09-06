import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/payments/stripe';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });
  }

  const headerList = await headers();
  const signature = headerList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown webhook signature error';
    console.error(`[Stripe Webhook Signature Verification Failed]: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Idempotency check: Ensure the event hasn't already been processed
  const existingEvent = await db.processedWebhook.findUnique({
    where: { id: event.id },
  });

  if (existingEvent) {
    console.log(`[Stripe Webhook] Duplicate event ${event.id} (${event.type}) skipped.`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      // 1. Checkout completed (Lifetime payment or Subscription kickoff)
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const coupleId = session.client_reference_id || (session.metadata?.coupleId as string | undefined);

        if (coupleId) {
          const isLifetime = session.mode === 'payment';
          const planType = isLifetime ? 'lifetime' : 'annual';

          await db.subscription.upsert({
            where: { coupleId },
            update: {
              status: 'ACTIVE',
              tier: 'PREMIUM',
              planType,
              stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
              stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : null,
              cancelAtPeriodEnd: false,
              currentPeriodEnd: isLifetime ? null : undefined,
            },
            create: {
              coupleId,
              status: 'ACTIVE',
              tier: 'PREMIUM',
              planType,
              stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
              stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : null,
              cancelAtPeriodEnd: false,
              currentPeriodEnd: null,
            },
          });

          console.log(`[Stripe Webhook] Activated Keepsake Club for couple ${coupleId} (${planType})`);
        }
        break;
      }

      // 2. Invoice payment succeeded (Initial payment + Annual renewal)
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : null;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : null;

        if (subscriptionId) {
          // Fetch the Stripe subscription to get updated period end
          const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
          const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);

          // Find subscription by stripeSubscriptionId or customerId
          const existing = await db.subscription.findFirst({
            where: {
              OR: [
                { stripeSubscriptionId: subscriptionId },
                ...(customerId ? [{ stripeCustomerId: customerId }] : []),
              ],
            },
          });

          if (existing) {
            await db.subscription.update({
              where: { id: existing.id },
              data: {
                status: 'ACTIVE',
                tier: 'PREMIUM',
                stripeSubscriptionId: subscriptionId,
                stripeCustomerId: customerId || existing.stripeCustomerId,
                currentPeriodEnd,
                cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
              },
            });
            console.log(`[Stripe Webhook] Invoice succeeded. Subscription renewed for couple ${existing.coupleId}`);
          }
        }
        break;
      }

      // 3. Invoice payment failed (Graceful handling of failed card / past_due)
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : null;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : null;

        const existing = await db.subscription.findFirst({
          where: {
            OR: [
              ...(subscriptionId ? [{ stripeSubscriptionId: subscriptionId }] : []),
              ...(customerId ? [{ stripeCustomerId: customerId }] : []),
            ],
          },
        });

        if (existing) {
          await db.subscription.update({
            where: { id: existing.id },
            data: {
              status: 'PAST_DUE',
            },
          });
          console.warn(`[Stripe Webhook] Invoice payment failed. Couple ${existing.coupleId} marked PAST_DUE.`);
        }
        break;
      }

      // 4. Customer subscription updated (Status changes, scheduled cancellation)
      case 'customer.subscription.updated': {
        const stripeSubscription = event.data.object as Stripe.Subscription;
        const subscriptionId = stripeSubscription.id;
        const customerId = typeof stripeSubscription.customer === 'string' ? stripeSubscription.customer : null;

        const existing = await db.subscription.findFirst({
          where: {
            OR: [
              { stripeSubscriptionId: subscriptionId },
              ...(customerId ? [{ stripeCustomerId: customerId }] : []),
            ],
          },
        });

        if (existing) {
          // Map Stripe status to our internal subscription state model
          let internalStatus = 'ACTIVE';
          const stripeStatus = stripeSubscription.status;

          if (stripeStatus === 'active') internalStatus = 'ACTIVE';
          else if (stripeStatus === 'trialing') internalStatus = 'TRIALING';
          else if (stripeStatus === 'past_due') internalStatus = 'PAST_DUE';
          else if (stripeStatus === 'canceled') internalStatus = 'CANCELED';
          else internalStatus = 'INACTIVE';

          await db.subscription.update({
            where: { id: existing.id },
            data: {
              status: internalStatus,
              tier: internalStatus === 'ACTIVE' || internalStatus === 'TRIALING' ? 'PREMIUM' : existing.tier,
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            },
          });
          console.log(`[Stripe Webhook] Subscription updated for couple ${existing.coupleId}: ${internalStatus}`);
        }
        break;
      }

      // 5. Subscription canceled or deleted
      case 'customer.subscription.deleted': {
        const stripeSubscription = event.data.object as Stripe.Subscription;
        const subscriptionId = stripeSubscription.id;
        const customerId = typeof stripeSubscription.customer === 'string' ? stripeSubscription.customer : null;

        const existing = await db.subscription.findFirst({
          where: {
            OR: [
              { stripeSubscriptionId: subscriptionId },
              ...(customerId ? [{ stripeCustomerId: customerId }] : []),
            ],
          },
        });

        if (existing) {
          await db.subscription.update({
            where: { id: existing.id },
            data: {
              status: 'CANCELED',
              tier: 'FREE',
              cancelAtPeriodEnd: false,
            },
          });
          console.log(`[Stripe Webhook] Subscription deleted. Couple ${existing.coupleId} returned to FREE.`);
        }
        break;
      }

      default:
        // Other events acknowledged without action
        break;
    }

    // Record processed webhook for strict idempotency
    await db.processedWebhook.create({
      data: {
        id: event.id,
        type: event.type,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error(`[Stripe Webhook Processing Error]:`, error);
    return NextResponse.json({ error: 'Webhook handler encountered an error' }, { status: 500 });
  }
}

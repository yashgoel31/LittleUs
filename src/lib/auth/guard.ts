import { getSession } from './session';
import { db } from '../db';
import { isPremiumSubscriber } from '@/lib/payments/subscriptionStatus';

export interface CoupleAuthSession {
  userId: string;
  userName: string;
  userEmail: string;
  coupleId: string;
  coupleName: string;
  coupleSlug: string;
  myNickname: string;
  role: string;
  isPremium: boolean;
}

/**
 * Ensures user is authenticated AND belongs to an active couple space.
 * Prevents unauthorized access or orphan accounts.
 */
export async function requireCoupleAuth(): Promise<CoupleAuthSession> {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error('UNAUTHORIZED');
  }

  // Verify membership in database - NEVER trust client assertions
  const membership = await db.coupleMember.findFirst({
    where: { userId: session.userId },
    include: {
      couple: {
        include: {
          subscription: true,
        },
      },
    },
  });

  if (!membership || !membership.couple) {
    throw new Error('NO_COUPLE_MEMBERSHIP');
  }

  const isPremium = isPremiumSubscriber(membership.couple.subscription);

  return {
    userId: session.userId,
    userName: session.name,
    userEmail: session.email,
    coupleId: membership.coupleId,
    coupleName: membership.couple.name,
    coupleSlug: membership.couple.slug,
    myNickname: membership.nickname,
    role: membership.role,
    isPremium,
  };
}

/**
 * Validates that a requested resource belongs strictly to the user's couple space.
 * Prevents IDOR (Insecure Direct Object Reference).
 */
export function assertCoupleOwnership(resourceCoupleId: string, userCoupleId: string) {
  if (!resourceCoupleId || resourceCoupleId !== userCoupleId) {
    throw new Error('FORBIDDEN_RESOURCE_ACCESS');
  }
}

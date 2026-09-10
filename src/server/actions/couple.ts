'use server';

import crypto from 'crypto';
import { db } from '@/lib/db';
import { CreateCoupleSchema, JoinCoupleSchema, UpdateCoupleSchema } from '@/lib/validation';
import { requireCoupleAuth } from '@/lib/auth/guard';
import { getSession } from '@/lib/auth/session';
import { isThemeAvailable } from '@/lib/config/plans';

export async function createCoupleSpace(input: unknown) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: 'Authentication required' };
  }

  const parsed = CreateCoupleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  // Check if user is already part of a couple space
  const existingMembership = await db.coupleMember.findFirst({
    where: { userId: session.userId },
  });

  if (existingMembership) {
    return { success: false, error: 'You are already a member of a couple space' };
  }

  const { name, myNickname, myAvatar, anniversaryDate, theme } = parsed.data;

  // Generate unique slug and invite code
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${crypto.randomBytes(3).toString('hex')}`;
  const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

  const couple = await db.couple.create({
    data: {
      name,
      slug,
      inviteCode,
      theme,
      anniversaryDate: anniversaryDate ? new Date(anniversaryDate) : null,
      members: {
        create: {
          userId: session.userId,
          nickname: myNickname,
          avatarUrl: myAvatar || null,
          role: 'CREATOR',
        },
      },
      subscription: {
        create: {
          tier: 'FREE',
          status: 'FREE',
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      inviteCode: true,
    },
  });

  return { success: true, couple };
}

export async function previewCoupleByInviteCode(inviteCode: string) {
  const code = (inviteCode || '').trim().toUpperCase();
  if (!code || code.length < 4) {
    return { success: false, error: 'Please enter a valid invite code' };
  }

  const couple = await db.couple.findUnique({
    where: { inviteCode: code },
    include: {
      members: {
        include: {
          user: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!couple) {
    return { success: false, error: 'No sanctuary found with this invite code. Check with your partner.' };
  }

  if (couple.members.length >= 2) {
    return { success: false, error: 'This sanctuary already has its two partners linked.' };
  }

  const creator = couple.members[0];

  return {
    success: true,
    couple: {
      id: couple.id,
      name: couple.name,
      creatorName: creator?.nickname || creator?.user?.name || 'Your partner',
      creatorAvatar: creator?.avatarUrl || '🕊️',
      theme: couple.theme,
      createdAt: couple.createdAt,
    },
  };
}

export async function joinCoupleSpace(input: unknown) {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: 'Authentication required' };
  }

  const parsed = JoinCoupleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const { inviteCode, myNickname, myAvatar } = parsed.data;

  // Find couple by invite code
  const couple = await db.couple.findUnique({
    where: { inviteCode: inviteCode.toUpperCase() },
    include: {
      members: true,
    },
  });

  if (!couple) {
    return { success: false, error: 'Invalid invite code. Please check with your partner.' };
  }

  // Strict constraint: max 2 members per couple
  if (couple.members.length >= 2) {
    return { success: false, error: 'This couple space already has two members.' };
  }

  // Check if user is already in this or another space
  const existingMembership = await db.coupleMember.findFirst({
    where: { userId: session.userId },
  });

  if (existingMembership) {
    return { success: false, error: 'You are already in a couple space.' };
  }

  // Join the couple as PARTNER
  await db.coupleMember.create({
    data: {
      coupleId: couple.id,
      userId: session.userId,
      nickname: myNickname,
      avatarUrl: myAvatar || '🌿',
      role: 'PARTNER',
    },
  });

  return { success: true, coupleId: couple.id, slug: couple.slug };
}

export async function updateCoupleSettings(input: unknown) {
  const auth = await requireCoupleAuth();
  const parsed = UpdateCoupleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const dataToUpdate: Record<string, unknown> = {};
  if (parsed.data.name) dataToUpdate.name = parsed.data.name;
  if (parsed.data.theme) {
    if (!isThemeAvailable(parsed.data.theme, auth.tier)) {
      return {
        success: false,
        error: 'This theme requires an upgrade to Sweetheart Club or Forever Club.',
      };
    }
    dataToUpdate.theme = parsed.data.theme;
  }
  if (parsed.data.anniversaryDate !== undefined) {
    dataToUpdate.anniversaryDate = parsed.data.anniversaryDate ? new Date(parsed.data.anniversaryDate) : null;
  }

  const updated = await db.couple.update({
    where: { id: auth.coupleId },
    data: dataToUpdate,
    select: {
      id: true,
      name: true,
      theme: true,
      anniversaryDate: true,
      inviteCode: true,
    },
  });

  return { success: true, couple: updated };
}

export async function getCoupleOverview() {
  const auth = await requireCoupleAuth();

  const couple = await db.couple.findUnique({
    where: { id: auth.coupleId },
    select: {
      id: true,
      name: true,
      slug: true,
      theme: true,
      inviteCode: true,
      anniversaryDate: true,
      createdAt: true,
      members: {
        select: {
          id: true,
          nickname: true,
          avatarUrl: true,
          role: true,
          userId: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      subscription: {
        select: {
          tier: true,
          status: true,
          planType: true,
          amount: true,
          currency: true,
          razorpayOrderId: true,
          razorpayPaymentId: true,
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

  return { couple, currentAuth: auth };
}

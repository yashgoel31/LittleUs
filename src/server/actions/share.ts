'use server';

import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { requireCoupleAuth } from '@/lib/auth/guard';
import { getDaysTogether, calculateDateMilestone } from '@/lib/utils';
import { z } from 'zod';

const UpdateShareSettingsSchema = z.object({
  isShareEnabled: z.boolean(),
  shareShowMemories: z.boolean(),
  shareShowNotes: z.boolean(),
  shareShowLetters: z.boolean(),
  shareShowDates: z.boolean(),
  passcode: z.string().trim().max(30).optional().nullable(),
  removePasscode: z.boolean().optional(),
});

/**
 * Retrieves the current couple's sharing preferences.
 */
export async function getShareSettings() {
  const auth = await requireCoupleAuth();

  const couple = await db.couple.findUnique({
    where: { id: auth.coupleId },
    select: {
      slug: true,
      isShareEnabled: true,
      sharePasscodeHash: true,
      shareShowMemories: true,
      shareShowNotes: true,
      shareShowLetters: true,
      shareShowDates: true,
    },
  });

  if (!couple) throw new Error('Couple not found');

  return {
    slug: couple.slug,
    isShareEnabled: couple.isShareEnabled,
    isPasswordProtected: Boolean(couple.sharePasscodeHash),
    shareShowMemories: couple.shareShowMemories,
    shareShowNotes: couple.shareShowNotes,
    shareShowLetters: couple.shareShowLetters,
    shareShowDates: couple.shareShowDates,
  };
}

/**
 * Updates sharing settings and optional password protection.
 */
export async function updateShareSettings(input: unknown) {
  const auth = await requireCoupleAuth();

  const parsed = UpdateShareSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const {
    isShareEnabled,
    shareShowMemories,
    shareShowNotes,
    shareShowLetters,
    shareShowDates,
    passcode,
    removePasscode,
  } = parsed.data;

  const dataToUpdate: Record<string, unknown> = {
    isShareEnabled,
    shareShowMemories,
    shareShowNotes,
    shareShowLetters,
    shareShowDates,
  };

  if (removePasscode) {
    dataToUpdate.sharePasscodeHash = null;
  } else if (passcode && passcode.length > 0) {
    // Hash passcode securely
    dataToUpdate.sharePasscodeHash = await bcrypt.hash(passcode, 10);
  }

  await db.couple.update({
    where: { id: auth.coupleId },
    data: dataToUpdate,
  });

  return { success: true };
}

export type PublicSharePageResult = {
  notFound?: boolean;
  isLocked?: boolean;
  coupleName?: string;
  data?: {
    coupleName: string;
    theme: string;
    partner1: { name: string; avatar: string };
    partner2: { name: string; avatar: string };
    daysTogether: number;
    daysTogetherString: string;
    memories?: Array<{
      title: string;
      content: string;
      date: string;
      location?: string | null;
      photoUrls: string[];
      authorName: string;
    }>;
    notes?: Array<{
      content: string;
      style: string;
      recipient?: string | null;
      date?: string | null;
      authorName: string;
    }>;
    letters?: Array<{
      title: string;
      isOpened: boolean;
      message?: string;
      photoUrl?: string | null;
      authorName: string;
    }>;
    dates?: Array<{
      title: string;
      formattedDate: string;
      daysRemaining: number;
      isToday: boolean;
      category?: string | null;
      description?: string | null;
    }>;
  };
};

/**
 * Securely loads public shared data for /us/[slug].
 * Sanitizes all output to ensure no internal IDs, emails, or hashes are exposed.
 */
export async function getPublicSharedPage(
  slug: string,
  passcode?: string
): Promise<PublicSharePageResult> {
  const couple = await db.couple.findUnique({
    where: { slug },
    include: {
      members: {
        select: {
          nickname: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
  });

  if (!couple || !couple.isShareEnabled) {
    return { notFound: true };
  }

  // Handle password-protected world
  if (couple.sharePasscodeHash) {
    if (!passcode) {
      return { isLocked: true, coupleName: couple.name };
    }

    const isValid = await bcrypt.compare(passcode, couple.sharePasscodeHash);
    if (!isValid) {
      return { isLocked: true, coupleName: couple.name };
    }
  }

  // Load only allowed data
  const member1 = couple.members[0];
  const member2 = couple.members[1];

  const daysCount = couple.anniversaryDate ? getDaysTogether(couple.anniversaryDate) : 0;
  const daysString = daysCount > 0 ? `Together for ${daysCount.toLocaleString()} days ❤️` : 'Day 1 of their story ❤️';

  const resultData: NonNullable<PublicSharePageResult['data']> = {
    coupleName: couple.name,
    theme: couple.theme,
    partner1: {
      name: member1?.nickname || 'Partner 1',
      avatar: member1?.avatarUrl || '🕊️',
    },
    partner2: {
      name: member2?.nickname || 'Partner 2',
      avatar: member2?.avatarUrl || '🌿',
    },
    daysTogether: daysCount,
    daysTogetherString: daysString,
  };

  // 1. Memories if enabled
  if (couple.shareShowMemories) {
    const rawMemories = await db.memory.findMany({
      where: { coupleId: couple.id },
      orderBy: [{ isFavorite: 'desc' }, { date: 'desc' }],
      take: 12,
      select: {
        title: true,
        content: true,
        date: true,
        location: true,
        photoUrls: true,
        author: { select: { name: true } },
      },
    });

    resultData.memories = rawMemories.map((m) => ({
      title: m.title,
      content: m.content,
      date: m.date.toISOString(),
      location: m.location,
      photoUrls: JSON.parse(m.photoUrls || '[]') as string[],
      authorName: m.author.name,
    }));
  }

  // 2. Notes if enabled
  if (couple.shareShowNotes) {
    const rawNotes = await db.loveNote.findMany({
      where: { coupleId: couple.id },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 6,
      select: {
        content: true,
        style: true,
        color: true,
        noteDate: true,
        recipient: true,
        author: { select: { name: true } },
      },
    });

    resultData.notes = rawNotes.map((n) => ({
      content: n.content,
      style: n.style || n.color || 'blush',
      recipient: n.recipient,
      date: n.noteDate ? n.noteDate.toISOString() : null,
      authorName: n.author.name,
    }));
  }

  // 3. Letters if enabled
  if (couple.shareShowLetters) {
    const rawLetters = await db.openWhenLetter.findMany({
      where: { coupleId: couple.id },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        title: true,
        situation: true,
        content: true,
        photoUrl: true,
        isOpened: true,
        author: { select: { name: true } },
      },
    });

    resultData.letters = rawLetters.map((l) => ({
      title: l.title || `Open when ${l.situation}`,
      isOpened: l.isOpened,
      // If unopened, keep message concealed from public visitor too
      message: l.isOpened ? l.content : undefined,
      photoUrl: l.isOpened ? l.photoUrl : null,
      authorName: l.author.name,
    }));
  }

  // 4. Dates if enabled
  if (couple.shareShowDates) {
    const rawDates = await db.importantDate.findMany({
      where: { coupleId: couple.id },
      select: {
        title: true,
        date: true,
        isYearly: true,
        category: true,
        description: true,
      },
    });

    const mapped = rawDates.map((d) => {
      const milestone = calculateDateMilestone(d.date, d.isYearly);
      return {
        title: d.title,
        formattedDate: milestone.formattedTargetDate,
        daysRemaining: milestone.daysRemaining,
        isToday: milestone.isToday,
        isPast: milestone.isPast,
        category: d.category,
        description: d.description,
      };
    });

    // Upcoming dates first
    resultData.dates = mapped
      .filter((d) => !d.isPast)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 4);
  }

  return { data: resultData };
}

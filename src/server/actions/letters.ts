'use server';

import { db } from '@/lib/db';
import { OpenWhenLetterInputSchema } from '@/lib/validation';
import { requireCoupleAuth, assertCoupleOwnership } from '@/lib/auth/guard';
import { checkPlanLimit } from '@/lib/payments/stripe';

export async function createOpenWhenLetter(input: unknown) {
  const auth = await requireCoupleAuth();

  const parsed = OpenWhenLetterInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const currentCount = await db.openWhenLetter.count({
    where: { coupleId: auth.coupleId },
  });

  const { allowed, limit } = checkPlanLimit(auth.isPremium, 'letters', currentCount);
  if (!allowed) {
    return {
      success: false,
      error: `You have filled your sanctuary room of ${limit} sealed letters. Unlock more room for our story with the Little Us Keepsake Club.`,
    };
  }

  const { title, message, photoUrl, unlockDate } = parsed.data;

  // Clean situation / title
  const cleanSituation = title.toLowerCase().startsWith('open when')
    ? title.replace(/^open when\s*/i, '').trim()
    : title;

  const letter = await db.openWhenLetter.create({
    data: {
      coupleId: auth.coupleId,
      authorId: auth.userId,
      title,
      situation: cleanSituation || title,
      content: message,
      photoUrl: photoUrl || null,
      unlockDate: unlockDate ? new Date(unlockDate) : null,
    },
    select: {
      id: true,
      title: true,
      situation: true,
      createdAt: true,
    },
  });

  return { success: true, letter };
}

export async function updateOpenWhenLetter(letterId: string, input: unknown) {
  const auth = await requireCoupleAuth();

  const letter = await db.openWhenLetter.findUnique({
    where: { id: letterId },
    select: { id: true, coupleId: true },
  });

  if (!letter) return { success: false, error: 'Letter not found' };
  assertCoupleOwnership(letter.coupleId, auth.coupleId);

  const parsed = OpenWhenLetterInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const { title, message, photoUrl, unlockDate } = parsed.data;

  const cleanSituation = title.toLowerCase().startsWith('open when')
    ? title.replace(/^open when\s*/i, '').trim()
    : title;

  const updated = await db.openWhenLetter.update({
    where: { id: letterId },
    data: {
      title,
      situation: cleanSituation || title,
      content: message,
      photoUrl: photoUrl || null,
      unlockDate: unlockDate ? new Date(unlockDate) : null,
    },
    select: {
      id: true,
      title: true,
      situation: true,
      content: true,
      photoUrl: true,
      isOpened: true,
    },
  });

  return { success: true, letter: updated };
}

export async function getOpenWhenLetters() {
  const auth = await requireCoupleAuth();

  const letters = await db.openWhenLetter.findMany({
    where: { coupleId: auth.coupleId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      authorId: true,
      title: true,
      situation: true,
      content: true,
      photoUrl: true,
      isOpened: true,
      openedAt: true,
      unlockDate: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Normalize title and content
  return letters.map((l) => ({
    ...l,
    title: l.title || (l.situation.toLowerCase().startsWith('open when') ? l.situation : `Open when ${l.situation}`),
    message: l.content,
  }));
}

export async function openLetter(letterId: string) {
  const auth = await requireCoupleAuth();

  const letter = await db.openWhenLetter.findUnique({
    where: { id: letterId },
  });

  if (!letter) return { success: false, error: 'Letter not found' };
  assertCoupleOwnership(letter.coupleId, auth.coupleId);

  const updated = await db.openWhenLetter.update({
    where: { id: letterId },
    data: {
      isOpened: true,
      openedAt: letter.openedAt || new Date(),
    },
    select: {
      id: true,
      title: true,
      situation: true,
      content: true,
      photoUrl: true,
      isOpened: true,
      openedAt: true,
    },
  });

  return {
    success: true,
    letter: {
      ...updated,
      title: updated.title || `Open when ${updated.situation}`,
      message: updated.content,
    },
  };
}

export async function deleteLetter(letterId: string) {
  const auth = await requireCoupleAuth();

  const letter = await db.openWhenLetter.findUnique({
    where: { id: letterId },
    select: { id: true, coupleId: true },
  });

  if (!letter) return { success: false, error: 'Letter not found' };
  assertCoupleOwnership(letter.coupleId, auth.coupleId);

  await db.openWhenLetter.delete({
    where: { id: letterId },
  });

  return { success: true };
}

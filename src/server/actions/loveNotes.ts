'use server';

import { db } from '@/lib/db';
import { LoveNoteInputSchema } from '@/lib/validation';
import { requireCoupleAuth, assertCoupleOwnership } from '@/lib/auth/guard';
import { checkPlanLimit } from '@/lib/payments/stripe';
import { checkDeletionLock } from '@/lib/config/plans';

export async function createLoveNote(input: unknown) {
  const auth = await requireCoupleAuth();

  const parsed = LoveNoteInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const currentCount = await db.loveNote.count({
    where: { coupleId: auth.coupleId },
  });

  const { allowed, limit, tierName } = checkPlanLimit(auth.tier, 'loveNotes', currentCount);
  if (!allowed) {
    return {
      success: false,
      error: `You have filled your room of ${limit} love notes on the ${tierName}. Unlock more room with Sweetheart Club (₹69) or Forever Club (₹119).`,
    };
  }

  const { content, style, color, noteDate, recipient, isPinned } = parsed.data;

  const note = await db.loveNote.create({
    data: {
      coupleId: auth.coupleId,
      authorId: auth.userId,
      content,
      style: style || color || 'blush',
      color: color || style || 'blush',
      noteDate: noteDate ? new Date(noteDate) : null,
      recipient: recipient || null,
      isPinned,
    },
    select: {
      id: true,
      content: true,
      style: true,
      color: true,
      noteDate: true,
      recipient: true,
      isPinned: true,
      createdAt: true,
    },
  });

  return { success: true, note };
}

export async function updateLoveNote(noteId: string, input: unknown) {
  const auth = await requireCoupleAuth();

  const note = await db.loveNote.findUnique({
    where: { id: noteId },
    select: { id: true, coupleId: true },
  });

  if (!note) return { success: false, error: 'Note not found' };
  assertCoupleOwnership(note.coupleId, auth.coupleId);

  const parsed = LoveNoteInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const { content, style, color, noteDate, recipient, isPinned } = parsed.data;

  const updated = await db.loveNote.update({
    where: { id: noteId },
    data: {
      content,
      style: style || color || 'blush',
      color: color || style || 'blush',
      noteDate: noteDate ? new Date(noteDate) : null,
      recipient: recipient || null,
      isPinned,
    },
    select: {
      id: true,
      content: true,
      style: true,
      color: true,
      noteDate: true,
      recipient: true,
      isPinned: true,
      createdAt: true,
    },
  });

  return { success: true, note: updated };
}

export async function getLoveNotes() {
  const auth = await requireCoupleAuth();

  const notes = await db.loveNote.findMany({
    where: { coupleId: auth.coupleId },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      authorId: true,
      content: true,
      style: true,
      color: true,
      noteDate: true,
      recipient: true,
      isPinned: true,
      readAt: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return notes;
}

export async function togglePinLoveNote(noteId: string) {
  const auth = await requireCoupleAuth();

  const note = await db.loveNote.findUnique({
    where: { id: noteId },
    select: { id: true, coupleId: true, isPinned: true },
  });

  if (!note) return { success: false, error: 'Note not found' };
  assertCoupleOwnership(note.coupleId, auth.coupleId);

  await db.loveNote.update({
    where: { id: noteId },
    data: { isPinned: !note.isPinned },
  });

  return { success: true, isPinned: !note.isPinned };
}

export async function deleteLoveNote(noteId: string) {
  const auth = await requireCoupleAuth();

  const note = await db.loveNote.findUnique({
    where: { id: noteId },
    select: { id: true, coupleId: true, createdAt: true },
  });

  if (!note) return { success: false, error: 'Note not found' };
  assertCoupleOwnership(note.coupleId, auth.coupleId);

  const lock = checkDeletionLock(note.createdAt);
  if (lock.isLocked) {
    return {
      success: false,
      error: lock.formattedLockMessage,
      daysRemaining: lock.daysRemaining,
    };
  }

  await db.loveNote.delete({
    where: { id: noteId },
  });

  return { success: true };
}

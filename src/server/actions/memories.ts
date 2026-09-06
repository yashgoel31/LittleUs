'use server';

import { db } from '@/lib/db';
import { MemoryInputSchema } from '@/lib/validation';
import { requireCoupleAuth, assertCoupleOwnership } from '@/lib/auth/guard';
import { checkPlanLimit } from '@/lib/payments/stripe';

export async function createMemory(input: unknown) {
  const auth = await requireCoupleAuth();

  const parsed = MemoryInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  // Check plan limits
  const currentCount = await db.memory.count({
    where: { coupleId: auth.coupleId },
  });

  const { allowed, limit } = checkPlanLimit(auth.isPremium, 'memories', currentCount);
  if (!allowed) {
    return {
      success: false,
      error: `You have filled your sanctuary room of ${limit} memories. Unlock more room for our story with the Little Us Keepsake Club.`,
    };
  }

  const { title, content, date, location, photoUrls, isFavorite } = parsed.data;

  const memory = await db.memory.create({
    data: {
      coupleId: auth.coupleId,
      authorId: auth.userId,
      title,
      content,
      date: new Date(date),
      location: location || null,
      photoUrls: JSON.stringify(photoUrls),
      isFavorite,
    },
    select: {
      id: true,
      title: true,
      date: true,
    },
  });

  return { success: true, memory };
}

export async function getMemories() {
  const auth = await requireCoupleAuth();

  const memories = await db.memory.findMany({
    where: { coupleId: auth.coupleId },
    orderBy: { date: 'desc' },
    select: {
      id: true,
      title: true,
      content: true,
      date: true,
      location: true,
      photoUrls: true,
      isFavorite: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return memories.map((m) => ({
    ...m,
    photoUrls: (JSON.parse(m.photoUrls || '[]') as string[]),
  }));
}

export async function toggleFavoriteMemory(memoryId: string) {
  const auth = await requireCoupleAuth();

  const memory = await db.memory.findUnique({
    where: { id: memoryId },
    select: { id: true, coupleId: true, isFavorite: true },
  });

  if (!memory) return { success: false, error: 'Memory not found' };
  assertCoupleOwnership(memory.coupleId, auth.coupleId);

  await db.memory.update({
    where: { id: memoryId },
    data: { isFavorite: !memory.isFavorite },
  });

  return { success: true, isFavorite: !memory.isFavorite };
}

export async function deleteMemory(memoryId: string) {
  const auth = await requireCoupleAuth();

  const memory = await db.memory.findUnique({
    where: { id: memoryId },
    select: { id: true, coupleId: true },
  });

  if (!memory) return { success: false, error: 'Memory not found' };
  assertCoupleOwnership(memory.coupleId, auth.coupleId);

  await db.memory.delete({
    where: { id: memoryId },
  });

  return { success: true };
}

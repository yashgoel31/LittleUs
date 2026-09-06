'use server';

import { db } from '@/lib/db';
import { ImportantDateInputSchema } from '@/lib/validation';
import { requireCoupleAuth, assertCoupleOwnership } from '@/lib/auth/guard';
import { checkPlanLimit } from '@/lib/payments/stripe';
import { calculateDateMilestone } from '@/lib/utils';

export async function createImportantDate(input: unknown) {
  const auth = await requireCoupleAuth();

  const parsed = ImportantDateInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const currentCount = await db.importantDate.count({
    where: { coupleId: auth.coupleId },
  });

  const { allowed, limit } = checkPlanLimit(auth.isPremium, 'importantDates', currentCount);
  if (!allowed) {
    return {
      success: false,
      error: `You have filled your sanctuary room of ${limit} milestone dates. Unlock more room for our story with the Little Us Keepsake Club.`,
    };
  }

  const { title, date, description, category, isYearly, icon } = parsed.data;

  // If anniversary or birthday, ensure isYearly is true by default
  const autoYearly = category === 'anniversary' || category === 'birthday' ? true : isYearly;

  const importantDate = await db.importantDate.create({
    data: {
      coupleId: auth.coupleId,
      title,
      date: new Date(date),
      description: description || null,
      category: category || 'custom',
      isYearly: autoYearly,
      icon,
    },
    select: {
      id: true,
      title: true,
      date: true,
      description: true,
      category: true,
      isYearly: true,
      icon: true,
    },
  });

  return { success: true, importantDate };
}

export async function updateImportantDate(dateId: string, input: unknown) {
  const auth = await requireCoupleAuth();

  const item = await db.importantDate.findUnique({
    where: { id: dateId },
    select: { id: true, coupleId: true },
  });

  if (!item) return { success: false, error: 'Date not found' };
  assertCoupleOwnership(item.coupleId, auth.coupleId);

  const parsed = ImportantDateInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const { title, date, description, category, isYearly, icon } = parsed.data;
  const autoYearly = category === 'anniversary' || category === 'birthday' ? true : isYearly;

  const updated = await db.importantDate.update({
    where: { id: dateId },
    data: {
      title,
      date: new Date(date),
      description: description || null,
      category: category || 'custom',
      isYearly: autoYearly,
      icon,
    },
    select: {
      id: true,
      title: true,
      date: true,
      description: true,
      category: true,
      isYearly: true,
      icon: true,
    },
  });

  return { success: true, importantDate: updated };
}

export async function getImportantDates() {
  const auth = await requireCoupleAuth();

  const rawDates = await db.importantDate.findMany({
    where: { coupleId: auth.coupleId },
    select: {
      id: true,
      title: true,
      date: true,
      description: true,
      category: true,
      isYearly: true,
      icon: true,
    },
  });

  // Calculate upcoming projection for every date to sort accurately
  const mapped = rawDates.map((item) => {
    const milestone = calculateDateMilestone(item.date, item.isYearly);
    return {
      ...item,
      nextOccurrence: milestone.targetDate,
      daysRemaining: milestone.daysRemaining,
      isToday: milestone.isToday,
      isPast: milestone.isPast,
      yearsPassed: milestone.yearsPassed,
      formattedTargetDate: milestone.formattedTargetDate,
    };
  });

  // Sort upcoming items first (by daysRemaining asc), followed by past one-time items
  return mapped.sort((a, b) => {
    if (a.isPast && !b.isPast) return 1;
    if (!a.isPast && b.isPast) return -1;
    return a.daysRemaining - b.daysRemaining;
  });
}

export async function deleteImportantDate(dateId: string) {
  const auth = await requireCoupleAuth();

  const item = await db.importantDate.findUnique({
    where: { id: dateId },
    select: { id: true, coupleId: true },
  });

  if (!item) return { success: false, error: 'Date not found' };
  assertCoupleOwnership(item.coupleId, auth.coupleId);

  await db.importantDate.delete({
    where: { id: dateId },
  });

  return { success: true };
}

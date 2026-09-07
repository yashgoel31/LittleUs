/**
 * Centralized Plan Configuration for Little Us
 * Single source of truth for limits, features, and pricing in Indian Rupees (₹ / INR).
 *
 * 3 Distinct Tiers:
 * 1. FREE (₹0): Essential quiet sanctuary with minimal room.
 *    - 5 Memories, 5 Love Notes, 2 Open When Letters, 4 Milestone Dates
 * 2. SWEETHEART (₹69): Increased room for blossoming love.
 *    - 10 Memories, 15 Love Notes, 15 Open When Letters, 20 Milestone Dates
 * 3. FOREVER (₹119): Generous room for your entire journey.
 *    - 25 Memories, 35 Love Notes, 30 Open When Letters, 30 Milestone Dates
 */

export type PlanTier = 'FREE' | 'SWEETHEART' | 'FOREVER';

export const PLAN_CONFIG = {
  FREE: {
    id: 'FREE' as PlanTier,
    name: 'Free Sanctuary',
    tagline: 'A quiet, genuine home for your daily story.',
    badge: 'Free Sanctuary',
    price: 0,
    priceFormatted: '₹0',
    currency: 'INR',
    maxWorlds: 1,
    maxMemories: 5,
    maxLoveNotes: 5,
    maxLetters: 2,
    maxImportantDates: 4,
    maxMediaSizeMb: 5,
    availableThemeIds: ['warm-paper', 'candlelight'],
    features: [
      '5 Captured memories & photos',
      '5 Handcrafted love notes',
      '2 Sealed Open When letters',
      '4 Milestone & anniversary dates',
      '1 Shared Little Us sanctuary',
      'Warm Paper & Candlelight themes',
      'Private, ad-free forever for two',
    ],
  },
  SWEETHEART: {
    id: 'SWEETHEART' as PlanTier,
    name: 'Sweetheart Club',
    tagline: 'Gentle room for blossoming love.',
    badge: 'Sweetheart Club',
    price: 69,
    priceInPaise: 6900,
    priceFormatted: '₹69',
    currency: 'INR',
    period: '/ year',
    note: '₹69 / year for both of you',
    maxWorlds: 1,
    maxMemories: 10,
    maxLoveNotes: 15,
    maxLetters: 15,
    maxImportantDates: 20,
    maxMediaSizeMb: 15,
    availableThemeIds: ['warm-paper', 'candlelight', 'rose', 'sage'],
    features: [
      '10 Captured memories & photos',
      '15 Handcrafted love notes',
      '15 Sealed Open When letters',
      '20 Milestone & anniversary dates',
      '15 MB media upload room',
      'Blush Rose & Forest Sage themes',
      'Passcode-protected public story link',
      '₹69 / year covers both partners (365 days access)',
    ],
  },
  FOREVER: {
    id: 'FOREVER' as PlanTier,
    name: 'Forever Club',
    tagline: 'Spacious room for your whole journey.',
    badge: 'Forever Club',
    price: 119,
    priceInPaise: 11900,
    priceFormatted: '₹119',
    currency: 'INR',
    period: '/ year',
    note: '₹119 / year for both of you',
    recommended: true,
    maxWorlds: 1,
    maxMemories: 25,
    maxLoveNotes: 35,
    maxLetters: 30,
    maxImportantDates: 30,
    maxMediaSizeMb: 25,
    availableThemeIds: ['warm-paper', 'candlelight', 'rose', 'sage', 'midnight'],
    features: [
      '25 Captured memories & photos',
      '35 Handcrafted love notes',
      '30 Sealed Open When letters',
      '30 Milestone & anniversary dates',
      '25 MB media upload room',
      'All handcrafted themes (including Midnight Velvet)',
      'Archival export & printable keepsake book',
      '₹119 / year covers both partners (365 days access)',
    ],
  },
} as const;

export type PlanType = keyof typeof PLAN_CONFIG;

export const ALL_THEMES = [
  { id: 'warm-paper', name: 'Warm Paper', desc: 'Timeless neutral parchment', minTier: 'FREE' as PlanTier },
  { id: 'candlelight', name: 'Soft Candlelight', desc: 'Warm paper and flickering amber', minTier: 'FREE' as PlanTier },
  { id: 'rose', name: 'Blush Rose', desc: 'Intimate soft pink and rose gold', minTier: 'SWEETHEART' as PlanTier },
  { id: 'sage', name: 'Muted Forest Sage', desc: 'Serene olive and eucalyptus', minTier: 'SWEETHEART' as PlanTier },
  { id: 'midnight', name: 'Midnight Velvet', desc: 'Deep quiet twilight', minTier: 'FOREVER' as PlanTier },
] as const;

/**
 * Normalizes any tier string or legacy boolean to a valid PlanTier
 */
export function normalizeTier(tier: string | boolean | null | undefined): PlanTier {
  if (typeof tier === 'boolean') return tier ? 'FOREVER' : 'FREE';
  if (!tier) return 'FREE';
  const upper = String(tier).toUpperCase();
  if (upper === 'FOREVER') return 'FOREVER';
  if (upper === 'SWEETHEART' || upper === 'KEEPSAKE') return 'SWEETHEART';
  if (upper === 'PREMIUM') return 'FOREVER';
  return 'FREE';
}

/**
 * Returns plan configuration for a given tier or legacy boolean
 */
export function getPlanConfig(tier: string | boolean | null | undefined) {
  const norm = normalizeTier(tier);
  return PLAN_CONFIG[norm];
}

/**
 * Checks if a theme is accessible under the given tier
 */
export function isThemeAvailable(themeId: string, tier: string | boolean | null | undefined): boolean {
  const norm = normalizeTier(tier);
  const theme = ALL_THEMES.find((t) => t.id === themeId);
  if (!theme) return true;

  if (theme.minTier === 'FREE') return true;
  if (theme.minTier === 'SWEETHEART') return norm === 'SWEETHEART' || norm === 'FOREVER';
  if (theme.minTier === 'FOREVER') return norm === 'FOREVER';
  return false;
}

export function isThemePremium(themeId: string): boolean {
  const freeThemeIds = ['warm-paper', 'candlelight', 'Warm Paper'];
  return !freeThemeIds.includes(themeId);
}

/**
 * Checks whether an action exceeds the couple's plan limits.
 * Single unified helper for memories, love notes, letters, and important dates.
 */
export function checkPlanLimit(
  tier: string | boolean | null | undefined,
  resourceType: 'memories' | 'loveNotes' | 'letters' | 'importantDates',
  currentCount: number
): { allowed: boolean; limit: number; remaining: number; tierName: string } {
  const config = getPlanConfig(tier);
  let limit: number = 0;

  switch (resourceType) {
    case 'memories':
      limit = config.maxMemories;
      break;
    case 'loveNotes':
      limit = config.maxLoveNotes;
      break;
    case 'letters':
      limit = config.maxLetters;
      break;
    case 'importantDates':
      limit = config.maxImportantDates;
      break;
  }

  const allowed = currentCount < limit;
  const remaining = Math.max(0, limit - currentCount);

  return { allowed, limit, remaining, tierName: config.name };
}

/**
 * Keepsake Protection Policy:
 * Items (memories, love notes, open when letters, milestone dates) are locked
 * for 21 days from creation before deletion is permitted. This prevents bypassing
 * plan quotas via immediate deletion/recreation cycles and protects the couple's story.
 */
export const DELETION_LOCK_DAYS = 21;

export function checkDeletionLock(createdAt: Date | string | number | null | undefined): {
  isLocked: boolean;
  daysRemaining: number;
  formattedLockMessage: string;
} {
  if (!createdAt) {
    return { isLocked: false, daysRemaining: 0, formattedLockMessage: '' };
  }

  const createdTime = new Date(createdAt).getTime();
  if (isNaN(createdTime)) {
    return { isLocked: false, daysRemaining: 0, formattedLockMessage: '' };
  }

  const now = Date.now();
  const lockDurationMs = DELETION_LOCK_DAYS * 24 * 60 * 60 * 1000;
  const unlockTime = createdTime + lockDurationMs;

  if (now >= unlockTime) {
    return {
      isLocked: false,
      daysRemaining: 0,
      formattedLockMessage: '',
    };
  }

  const msRemaining = unlockTime - now;
  const daysRemaining = Math.max(1, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));

  return {
    isLocked: true,
    daysRemaining,
    formattedLockMessage: `Keepsake Protection: This item is protected and cannot be deleted until 21 days after creation (${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining). This preserves your shared story and respects membership room.`,
  };
}

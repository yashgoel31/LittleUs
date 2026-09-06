/**
 * Centralized Plan Configuration for Little Us
 * Single source of truth for limits, features, and emotional messaging.
 *
 * Design Principle:
 * "The free version must be genuinely useful.
 *  Premium should feel like: 'More room for our story.'
 *  Not: 'Pay to use the product.'"
 */

export const PLAN_CONFIG = {
  FREE: {
    id: 'FREE',
    name: 'Little Us Sanctuary',
    tagline: 'A quiet, genuine home for your daily story.',
    badge: 'Free Sanctuary',
    maxWorlds: 1,
    maxMemories: 25,
    maxLoveNotes: 15,
    maxLetters: 5,
    maxImportantDates: 10,
    maxMediaSizeMb: 5,
    availableThemes: [
      { id: 'warm-paper', name: 'Warm Paper', desc: 'Timeless neutral parchment', isPremium: false },
      { id: 'candlelight', name: 'Candlelight', desc: 'Soft golden amber glow', isPremium: false },
    ],
    features: [
      '1 Shared Little Us sanctuary',
      '25 Captured memories & photos',
      '15 Handcrafted love notes',
      '5 Sealed Open When letters',
      '10 Anniversary & milestone dates',
      'Private, ad-free forever for two',
    ],
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Little Us Keepsake Club',
    tagline: 'More room for our story.',
    badge: 'Keepsake Club',
    description:
      'A gentle, unhurried space with infinite room for both of you to preserve every photograph, note, and anniversary without limits.',
    maxWorlds: 1,
    maxMemories: Infinity,
    maxLoveNotes: Infinity,
    maxLetters: Infinity,
    maxImportantDates: Infinity,
    maxMediaSizeMb: 25,
    availableThemes: [
      { id: 'warm-paper', name: 'Warm Paper', desc: 'Timeless neutral parchment', isPremium: false },
      { id: 'candlelight', name: 'Candlelight', desc: 'Soft golden amber glow', isPremium: false },
      { id: 'rose', name: 'Blush Rose', desc: 'Intimate soft pink and rose gold', isPremium: true },
      { id: 'sage', name: 'Muted Forest Sage', desc: 'Serene olive and eucalyptus', isPremium: true },
      { id: 'midnight', name: 'Midnight Velvet', desc: 'Deep quiet twilight', isPremium: true },
    ],
    features: [
      'Unlimited memories & high-resolution photos',
      'Unlimited sealed Open When letters',
      'Unlimited handwritten love notes',
      'All handcrafted themes (Rose, Sage, Midnight)',
      'Password-protected public keepsake link',
      'Archival export & printable memory book',
      'One membership covers both of you forever',
    ],
    pricing: {
      annual: {
        id: 'annual',
        title: 'Annual Keepsake',
        price: '$29',
        period: '/ year',
        note: 'About $2.40/month for both of you',
      },
      lifetime: {
        id: 'lifetime',
        title: 'Lifetime Keepsake',
        price: '$49',
        period: 'once, forever',
        note: 'A quiet, permanent gift for your entire story',
        recommended: true,
      },
    },
  },
} as const;

export type PlanType = keyof typeof PLAN_CONFIG;

export const ALL_THEMES = [
  { id: 'warm-paper', name: 'Warm Paper', desc: 'Timeless neutral parchment', isPremium: false },
  { id: 'candlelight', name: 'Soft Candlelight', desc: 'Warm paper and flickering amber', isPremium: false },
  { id: 'rose', name: 'Blush Rose', desc: 'Intimate soft pink and rose gold', isPremium: true },
  { id: 'sage', name: 'Muted Forest Sage', desc: 'Serene olive and eucalyptus', isPremium: true },
  { id: 'midnight', name: 'Midnight Velvet', desc: 'Deep quiet twilight', isPremium: true },
] as const;

export function getPlanConfig(isPremium: boolean) {
  return isPremium ? PLAN_CONFIG.PREMIUM : PLAN_CONFIG.FREE;
}

export function isThemeAvailable(themeId: string, isPremium: boolean): boolean {
  if (isPremium) return true;
  // Free themes
  const freeThemeIds = ['warm-paper', 'candlelight', 'Warm Paper'];
  return freeThemeIds.includes(themeId);
}

export function isThemePremium(themeId: string): boolean {
  const freeThemeIds = ['warm-paper', 'candlelight', 'Warm Paper'];
  return !freeThemeIds.includes(themeId);
}

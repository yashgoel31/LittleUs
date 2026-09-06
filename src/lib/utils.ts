/**
 * Shared utility functions for Little Us
 */

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Calculates days elapsed between an anniversary date and now.
 */
export function getDaysTogether(anniversaryDate: Date | string | null | undefined): number {
  if (!anniversaryDate) return 0;
  const start = new Date(anniversaryDate).getTime();
  const now = new Date().getTime();
  const diffInMs = Math.max(0, now - start);
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculates days remaining until a future date.
 */
export function getDaysRemaining(targetDate: Date | string): {
  days: number;
  isPast: boolean;
} {
  const target = new Date(targetDate).getTime();
  const now = new Date().getTime();
  const diffInMs = target - now;

  if (diffInMs < 0) {
    return { days: Math.floor(Math.abs(diffInMs) / (1000 * 60 * 60 * 24)), isPast: true };
  }

  return { days: Math.ceil(diffInMs / (1000 * 60 * 60 * 24)), isPast: false };
}

/**
 * Formats date into an intimate, warm format (e.g., "October 14, 2024")
 */
export function formatIntimateDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Formats relative time (e.g., "2 hours ago", "yesterday")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date().getTime();
  const diff = Math.floor((now - new Date(date).getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return 'yesterday';
  return formatIntimateDate(date);
}

/**
 * Calculates countdown and days remaining, correctly projecting recurring yearly dates.
 */
export function calculateDateMilestone(
  baseDate: Date | string,
  isYearly: boolean
): {
  targetDate: Date;
  daysRemaining: number;
  isToday: boolean;
  isPast: boolean;
  yearsPassed?: number;
  formattedTargetDate: string;
} {
  const original = new Date(baseDate);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (isYearly) {
    const month = original.getMonth();
    const day = original.getDate();

    let targetMidnight = new Date(now.getFullYear(), month, day);
    let yearsPassed = now.getFullYear() - original.getFullYear();

    // If this year's anniversary/birthday has already passed, project to next year
    if (targetMidnight.getTime() < todayMidnight.getTime()) {
      targetMidnight = new Date(now.getFullYear() + 1, month, day);
      yearsPassed = now.getFullYear() + 1 - original.getFullYear();
    }

    const diffMs = targetMidnight.getTime() - todayMidnight.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    return {
      targetDate: targetMidnight,
      daysRemaining: diffDays,
      isToday: diffDays === 0,
      isPast: false,
      yearsPassed: Math.max(1, yearsPassed),
      formattedTargetDate: formatIntimateDate(targetMidnight),
    };
  }

  // One-time date
  const targetMidnight = new Date(original.getFullYear(), original.getMonth(), original.getDate());
  const diffMs = targetMidnight.getTime() - todayMidnight.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return {
    targetDate: targetMidnight,
    daysRemaining: Math.abs(diffDays),
    isToday: diffDays === 0,
    isPast: diffDays < 0,
    formattedTargetDate: formatIntimateDate(original),
  };
}

'use server';

import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { RegisterSchema, LoginSchema } from '@/lib/validation';
import { createSession, destroySession, getSession } from '@/lib/auth/session';

export type AuthActionResult = {
  success: boolean;
  error?: string;
  hasCouple?: boolean;
  resetUrl?: string;
  user?: { id: string; email: string; name: string };
};

/**
 * Registers a new user with strong password hashing and input validation.
 */
export async function registerUser(formData: unknown): Promise<AuthActionResult> {
  const parseResult = RegisterSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0]?.message || 'Invalid input data',
    };
  }

  const { email, password, name } = parseResult.data;

  // Check if email already exists
  const existingUser = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return { success: false, error: 'An account with this email already exists' };
  }

  // Hash password securely (cost factor 12)
  const passwordHash = await bcrypt.hash(password, 12);

  const newUser = await db.user.create({
    data: {
      email,
      passwordHash,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  await createSession({
    userId: newUser.id,
    email: newUser.email,
    name: newUser.name,
  });

  return { success: true, hasCouple: false, user: newUser };
}

/**
 * Authenticates user credentials and issues an HTTP-only session cookie.
 */
export async function loginUser(formData: unknown): Promise<AuthActionResult> {
  const parseResult = LoginSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0]?.message || 'Invalid email or password',
    };
  }

  const { email, password } = parseResult.data;

  const user = await db.user.findUnique({
    where: { email },
    include: {
      memberships: {
        select: { id: true, coupleId: true },
      },
    },
  });

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return { success: false, error: 'Invalid email or password' };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  const hasCouple = user.memberships.length > 0;

  return {
    success: true,
    hasCouple,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}

/**
 * Initiates a password reset request with a secure one-hour token.
 */
export async function requestPasswordReset(formData: unknown): Promise<AuthActionResult> {
  const crypto = await import('crypto');
  const { RequestPasswordResetSchema } = await import('@/lib/validation');
  const parseResult = RequestPasswordResetSchema.safeParse(formData);

  if (!parseResult.success) {
    return { success: false, error: parseResult.error.errors[0]?.message || 'Invalid email address' };
  }

  const { email } = parseResult.data;
  const user = await db.user.findUnique({ where: { email } });

  // For security, don't reveal whether the user exists
  if (!user) {
    return { success: true };
  }

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.passwordResetToken.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  return { success: true, resetUrl };
}

/**
 * Resets the password using a valid, unexpired token.
 */
export async function resetPassword(formData: unknown): Promise<AuthActionResult> {
  const { ResetPasswordSchema } = await import('@/lib/validation');
  const parseResult = ResetPasswordSchema.safeParse(formData);

  if (!parseResult.success) {
    return { success: false, error: parseResult.error.errors[0]?.message || 'Invalid input data' };
  }

  const { token, password } = parseResult.data;

  const resetRecord = await db.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetRecord || new Date() > resetRecord.expiresAt) {
    return { success: false, error: 'This password reset link is invalid or has expired.' };
  }

  const user = await db.user.findUnique({
    where: { email: resetRecord.email },
    include: { memberships: { select: { id: true } } },
  });

  if (!user) {
    return { success: false, error: 'Account not found' };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Delete used token
  await db.passwordResetToken.delete({ where: { token } });

  // Automatically sign in the user
  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  const hasCouple = user.memberships.length > 0;

  return {
    success: true,
    hasCouple,
    user: { id: user.id, email: user.email, name: user.name },
  };
}

/**
 * Logs out the current user by terminating the session cookie.
 */
export async function logoutUser(): Promise<{ success: boolean }> {
  await destroySession();
  return { success: true };
}

/**
 * Gets currently logged in user profile (without sensitive fields).
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      createdAt: true,
      memberships: {
        include: {
          couple: {
            select: {
              id: true,
              name: true,
              slug: true,
              inviteCode: true,
              theme: true,
              anniversaryDate: true,
              subscription: {
                select: {
                  tier: true,
                  status: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return user;
}

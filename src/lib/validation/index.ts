import { z } from 'zod';

// ==========================================
// Authentication Schemas
// ==========================================
export const RegisterSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password is too long'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
});

export const LoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const RequestPasswordResetSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password is too long'),
});

// ==========================================
// Couple Space Schemas
// ==========================================
export const CreateCoupleSchema = z.object({
  name: z.string().trim().min(2, 'Couple space name must be at least 2 characters').max(60),
  myNickname: z.string().trim().min(1, 'Your name is required').max(40),
  partnerNickname: z.string().trim().min(1, "Your partner's name is required").max(40),
  myAvatar: z.string().optional().nullable(),
  partnerAvatar: z.string().optional().nullable(),
  anniversaryDate: z.string().optional().nullable(),
  theme: z.enum(['Soft Rose', 'Midnight', 'Warm Paper', 'rose', 'midnight', 'warm-paper', 'candlelight', 'sage']).default('Warm Paper'),
});

export const JoinCoupleSchema = z.object({
  inviteCode: z.string().trim().min(4, 'Invalid invite code').max(32),
  myNickname: z.string().trim().min(1, 'Please choose a nickname for yourself').max(40),
  myAvatar: z.string().optional().nullable(),
});

export const UpdateCoupleSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  anniversaryDate: z.string().optional().nullable(),
  theme: z.enum(['candlelight', 'rose', 'sage', 'midnight']).optional(),
});

// ==========================================
// Memory Schemas
// ==========================================
export const MemoryInputSchema = z.object({
  title: z.string().trim().min(1, 'Memory title is required').max(120),
  content: z.string().trim().min(1, 'Please write a few words about this memory').max(10000),
  date: z.string().min(1, 'Please select a date for this memory'),
  location: z.string().trim().max(100).optional().nullable(),
  photoUrls: z
    .array(
      z
        .string()
        .trim()
        .url('Photo must be a valid URL')
        .refine((val) => val.startsWith('https://') || val.startsWith('http://'), {
          message: 'Photo URL must use http or https protocol',
        })
    )
    .max(6, 'Maximum 6 photos per memory')
    .default([]),
  isFavorite: z.boolean().default(false),
});

// ==========================================
// Love Note Schemas
// ==========================================
export const LoveNoteInputSchema = z.object({
  content: z.string().trim().min(1, 'Love note cannot be empty').max(2000, 'Keep it intimate and sweet (max 2000 characters)'),
  style: z.enum(['blush', 'parchment', 'sage', 'lavender', 'letterpress']).default('blush'),
  color: z.string().optional(),
  noteDate: z.string().optional().nullable(),
  recipient: z.string().trim().max(50).optional().nullable(),
  isPinned: z.boolean().default(false),
});

// ==========================================
// Open When Letter Schemas
// ==========================================
export const OpenWhenLetterInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'e.g., "Open when you miss me" or "Open on our anniversary"')
    .max(120),
  message: z.string().trim().min(2, 'Please write a message inside the envelope').max(15000),
  photoUrl: z
    .string()
    .trim()
    .url('Photo must be a valid URL')
    .refine((val) => val.startsWith('https://') || val.startsWith('http://'), {
      message: 'Photo URL must use http or https protocol',
    })
    .optional()
    .nullable(),
  unlockDate: z.string().optional().nullable(),
});

// ==========================================
// Important Date Schemas
// ==========================================
export const ImportantDateInputSchema = z.object({
  title: z.string().trim().min(1, 'Event title is required').max(80),
  date: z.string().min(1, 'Please select a date'),
  description: z.string().trim().max(500).optional().nullable(),
  category: z.enum(['anniversary', 'birthday', 'first_date', 'custom']).default('custom'),
  isYearly: z.boolean().default(false),
  icon: z.enum(['heart', 'sparkles', 'plane', 'ring', 'home', 'star', 'cake', 'cup']).default('heart'),
});

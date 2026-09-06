'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/server/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconHeart } from '@/components/ui/Icons';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing or invalid reset token. Please request a new link.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const res = await resetPassword({ token, password });
    setLoading(false);

    if (res.success) {
      if (res.hasCouple) {
        router.push('/home');
      } else {
        router.push('/onboarding');
      }
      router.refresh();
    } else {
      setError(res.error || 'Failed to reset password');
    }
  };

  return (
    <div
      className="surface-card"
      style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem 2rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-raised)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ color: 'var(--color-accent)', display: 'inline-flex', marginBottom: '0.5rem' }}>
          <IconHeart size={28} />
        </div>
        <h1 className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--color-text-primary)' }}>
          Set New Password
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
          Choose a new password for your Little Us account.
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-tint-rose)',
            color: 'var(--color-accent-hover)',
            fontSize: '0.84375rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--color-tint-rose-border)',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="New Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />

        <Input
          label="Confirm Password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your new password"
          autoComplete="new-password"
        />

        <Button type="submit" isLoading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
          Update Password & Enter →
        </Button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <Link href="/login" className="btn-ghost" style={{ fontSize: '0.8125rem' }}>
          Cancel & Return to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(253, 243, 241, 0.7) 0%, rgba(250, 248, 245, 0) 70%)',
      }}
    >
      <Suspense fallback={<div style={{ textAlign: 'center' }}>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

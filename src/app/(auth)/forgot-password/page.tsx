'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/server/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconMail } from '@/components/ui/Icons';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await requestPasswordReset({ email });
    setLoading(false);

    if (res.success) {
      setSubmitted(true);
      if (res.resetUrl) {
        setResetUrl(res.resetUrl);
      }
    } else {
      setError(res.error || 'Failed to send reset link');
    }
  };

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
            <IconMail size={28} />
          </div>
          <h1 className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--color-text-primary)' }}>
            Reset Your Password
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
            Enter your email to receive a password reset link.
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

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-tint-sage)',
                border: '1px solid var(--color-tint-sage-border)',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                color: '#2E4426',
                lineHeight: 1.5,
              }}
            >
              If an account exists for <strong>{email}</strong>, we have prepared a reset link.
            </div>

            {/* Development helper link */}
            {resetUrl && (
              <div
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border-subtle)',
                  marginBottom: '1.5rem',
                  fontSize: '0.8125rem',
                  wordBreak: 'break-all',
                }}
              >
                <span style={{ display: 'block', color: 'var(--color-text-tertiary)', marginBottom: '0.35rem' }}>
                  Development Direct Link:
                </span>
                <Link href={resetUrl} style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                  Click here to set a new password →
                </Link>
              </div>
            )}

            <Link href="/login" className="btn-secondary" style={{ width: '100%' }}>
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />

            <Button type="submit" isLoading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              Send Reset Link →
            </Button>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link href="/login" className="btn-ghost" style={{ fontSize: '0.8125rem' }}>
                ← Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser } from '@/server/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconDove } from '@/components/ui/Icons';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await loginUser({ email, password });
    setLoading(false);

    if (res.success) {
      if (res.hasCouple) {
        router.push('/home');
      } else {
        router.push(callbackUrl || '/onboarding');
      }
      router.refresh();
    } else {
      setError(res.error || 'Invalid email or password');
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
          maxWidth: '400px',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-raised)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ color: 'var(--color-accent)', display: 'inline-flex', marginBottom: '0.5rem' }}>
            <IconDove size={32} />
          </div>
          <h1 className="font-serif" style={{ fontSize: '1.85rem', color: 'var(--color-text-primary)' }}>
            Welcome back to Little Us
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
            Your private sanctuary is quietly waiting for you.
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
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.75rem', marginBottom: '1.25rem' }}>
            <Link
              href="/forgot-password"
              style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textDecoration: 'underline' }}
            >
              Forgot your password?
            </Link>
          </div>

          <Button type="submit" isLoading={loading} style={{ width: '100%' }}>
            Step Inside →
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.84375rem', color: 'var(--color-text-secondary)' }}>
          Don&apos;t have a shared world yet?{' '}
          <Link
            href={callbackUrl ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/register'}
            style={{ color: 'var(--color-accent)', fontWeight: 600 }}
          >
            Create one together
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

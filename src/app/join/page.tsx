'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function JoinRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code') || '';
    if (code) {
      router.replace(`/onboarding?mode=join&code=${encodeURIComponent(code)}`);
    } else {
      router.replace('/onboarding?mode=join');
    }
  }, [router, searchParams]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
        Opening your partner&apos;s sanctuary...
      </p>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <JoinRedirect />
    </Suspense>
  );
}

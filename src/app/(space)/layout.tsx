import React from 'react';
import { redirect } from 'next/navigation';
import { requireCoupleAuth } from '@/lib/auth/guard';
import { SpaceNavigation } from '@/components/features/SpaceNavigation';

export const dynamic = 'force-dynamic';

export default async function SpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let auth;
  try {
    auth = await requireCoupleAuth();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '';
    if (message === 'NO_COUPLE_MEMBERSHIP') {
      redirect('/onboarding');
    }
    redirect('/login');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SpaceNavigation
        coupleName={auth.coupleName}
        myNickname={auth.myNickname}
        isPremium={auth.isPremium}
        tier={auth.tier}
      />
      <main style={{ flex: 1, padding: '2rem 0 4rem 0' }}>
        <div className="container">{children}</div>
      </main>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { ProductPreviewCard } from '@/components/landing/ProductPreviewCard';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { FinalCtaSection } from '@/components/landing/FinalCtaSection';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const session = await getSession();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <LandingHeader isAuthenticated={!!session} />

      <main style={{ flex: 1 }}>
        {/* 1. HERO SECTION */}
        <section
          style={{
            padding: '4rem 0 3.5rem 0',
            textAlign: 'center',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(253, 243, 241, 0.75) 0%, rgba(250, 248, 245, 0) 70%)',
          }}
        >
          <div className="container-narrow" style={{ marginBottom: '2.5rem' }}>
            {/* Small emotional eyebrow */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-accent)',
                backgroundColor: 'var(--color-accent-subtle)',
                border: '1px solid var(--color-accent-border)',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                marginBottom: '1.25rem',
              }}
            >
              For the two of you ❤️
            </div>

            {/* Main heading */}
            <h1
              className="font-serif"
              style={{
                fontSize: '2.5rem',
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                lineHeight: 1.15,
                marginBottom: '1rem',
              }}
            >
              Your little world, together.
            </h1>

            {/* Supporting text */}
            <p
              style={{
                fontSize: '1.0625rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                maxWidth: '480px',
                margin: '0 auto 2rem auto',
              }}
            >
              Keep your memories, little notes, special dates and everything that makes your story yours.
            </p>

            {/* CTAs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/register"
                className="btn-primary"
                style={{ padding: '0.75rem 1.75rem', fontSize: '0.9375rem' }}
              >
                Create your little world
              </Link>
              <a
                href="#how-it-works"
                className="btn-secondary"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.9375rem' }}
              >
                See how it works
              </a>
            </div>
          </div>

          {/* VISUAL: Product Preview Card */}
          <div className="container" style={{ paddingBottom: '1rem' }}>
            <ProductPreviewCard />
          </div>
        </section>

        {/* 2. SIMPLE EXPLANATION OF HOW IT WORKS */}
        <HowItWorksSection />

        {/* 3, 4, 5, 6. PREVIEWS (Memories, Love notes, Open When, Important dates) */}
        <FeaturesSection />

        {/* 7. FINAL CTA */}
        <FinalCtaSection />
      </main>

      {/* Intimate, calm footer */}
      <footer
        style={{
          borderTop: '1px solid var(--color-border-subtle)',
          padding: '2rem 0',
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: 'var(--color-text-tertiary)',
        }}
      >
        <div className="container">
          <p className="font-serif" style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
            Little Us
          </p>
          <p>A quiet, private sanctuary designed with care for two.</p>
        </div>
      </footer>
    </div>
  );
}

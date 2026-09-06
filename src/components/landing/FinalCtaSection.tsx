import React from 'react';
import Link from 'next/link';
import { IconDove } from '@/components/ui/Icons';

export function FinalCtaSection() {
  return (
    <section
      style={{
        padding: '5rem 0 6rem 0',
        textAlign: 'center',
        background: 'radial-gradient(ellipse at 50% 10%, rgba(253, 243, 241, 0.8) 0%, rgba(250, 248, 245, 0) 70%)',
      }}
    >
      <div className="container-narrow">
        <div style={{ color: 'var(--color-accent)', display: 'inline-flex', marginBottom: '1rem' }}>
          <IconDove size={32} />
        </div>
        <h2 className="font-serif" style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>
          A tiny private world for two.
        </h2>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2rem',
            maxWidth: '440px',
            margin: '0 auto 2rem auto',
          }}
        >
          Begin preserving the little moments today. Strictly private between you and your favorite person.
        </p>
        <Link href="/register" className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
          Create your little world
        </Link>
      </div>
    </section>
  );
}

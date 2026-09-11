import React from 'react';
import Link from 'next/link';
import { IconDove } from '@/components/ui/Icons';

export function LandingHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--color-border-subtle)',
        backgroundColor: 'rgba(250, 248, 245, 0.9)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4rem',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
          }}
        >
          <span style={{ color: 'var(--color-accent)', display: 'flex', alignItems: 'center' }}>
            <IconDove size={24} />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              className="font-serif"
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                lineHeight: 1.15,
              }}
            >
              LittleUs
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                color: 'var(--color-text-tertiary)',
                letterSpacing: '0.02em',
                fontWeight: 500,
              }}
            >
              A private world
            </span>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <>
              <Link href="/login" className="btn-ghost" style={{ fontSize: '0.8125rem' }}>
                Sign in / Switch
              </Link>
              <Link href="/home" className="btn-primary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>
                Open Sanctuary →
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost" style={{ fontSize: '0.8125rem' }}>
                Sign in
              </Link>
              <Link
                href="/register"
                className="btn-primary"
                style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
              >
                Create your world
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

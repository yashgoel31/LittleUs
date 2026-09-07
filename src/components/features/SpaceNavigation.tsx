'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { logoutUser } from '@/server/actions/auth';
import { IconSettings, IconDove } from '@/components/ui/Icons';

interface SpaceNavigationProps {
  coupleName: string;
  myNickname: string;
  isPremium?: boolean;
  tier?: string;
}

export function SpaceNavigation({ coupleName, myNickname, isPremium, tier }: SpaceNavigationProps) {
  const pathname = usePathname();

  const links = [
    { href: '/home', label: 'Home' },
    { href: '/memories', label: 'Memories' },
    { href: '/notes', label: 'Notes' },
    { href: '/letters', label: 'Open When' },
    { href: '/dates', label: 'Dates' },
  ];

  const badgeText =
    tier === 'FOREVER'
      ? 'Forever'
      : tier === 'SWEETHEART'
      ? 'Sweetheart'
      : isPremium
      ? 'Club'
      : null;

  return (
    <header
      style={{
        borderBottom: '1px solid var(--color-border-subtle)',
        background: 'rgba(250, 248, 245, 0.95)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '3.75rem',
        }}
      >
        {/* Brand & Couple Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none' }}>
            <span style={{ color: 'var(--color-accent)', display: 'flex', alignItems: 'center' }}>
              <IconDove size={20} />
            </span>
            <span
              className="font-serif"
              style={{
                fontSize: '1.15rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              {coupleName}
            </span>
          </Link>
          {badgeText ? (
            <Link href="/upgrade" title={`Little Us ${badgeText} Club`} style={{ textDecoration: 'none' }}>
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-tint-rose)',
                  color: 'var(--color-accent)',
                  border: '1px solid var(--color-tint-rose-border)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'inline-block',
                }}
              >
                {badgeText}
              </span>
            </Link>
          ) : null}
        </div>

        {/* Primary Simple Navigation: Home, Memories, Notes, Open When, Dates */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            overflowX: 'auto',
          }}
        >
          {links.map((link) => {
            const isActive =
              link.href === '/home'
                ? pathname === '/home'
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.84375rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  borderBottom: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                  borderRadius: '2px',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--duration-fast)',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Secondary Navigation: Settings & Account */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {!isPremium && (
            <Link
              href="/upgrade"
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--color-accent)',
                padding: '0.2rem 0.55rem',
                background: 'var(--color-tint-rose)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-tint-rose-border)',
                textDecoration: 'none',
                marginRight: '0.25rem',
                whiteSpace: 'nowrap',
              }}
            >
              More room ✨
            </Link>
          )}

          <Link
            href="/settings"
            title="Settings & Space Personalization"
            style={{
              color: pathname === '/settings' ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <IconSettings size={18} />
          </Link>

          <button
            onClick={() => logoutUser().then(() => (window.location.href = '/login'))}
            className="btn-ghost"
            style={{
              fontSize: '0.75rem',
              padding: '0.35rem 0.6rem',
              color: 'var(--color-text-tertiary)',
            }}
            title={`Signed in as ${myNickname}`}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

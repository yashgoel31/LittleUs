'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutUser } from '@/server/actions/auth';
import {
  IconSettings,
  IconDove,
  IconHome,
  IconPhoto,
  IconPin,
  IconMail,
  IconCalendar,
} from '@/components/ui/Icons';

interface SpaceNavigationProps {
  coupleName: string;
  myNickname: string;
  isPremium?: boolean;
  tier?: string;
}

export function SpaceNavigation({ coupleName, myNickname, isPremium, tier }: SpaceNavigationProps) {
  const pathname = usePathname();

  const links = [
    { href: '/home', label: 'Home', desktopLabel: 'Home', icon: IconHome },
    { href: '/memories', label: 'Memories', desktopLabel: 'Memories', icon: IconPhoto },
    { href: '/notes', label: 'Notes', desktopLabel: 'Notes', icon: IconPin },
    { href: '/letters', label: 'Letters', desktopLabel: 'Open When', icon: IconMail },
    { href: '/dates', label: 'Dates', desktopLabel: 'Dates', icon: IconCalendar },
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
    <>
      {/* Top Header Bar */}
      <header
        style={{
          borderBottom: '1px solid var(--color-border-subtle)',
          background: 'rgba(250, 248, 245, 0.96)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div className="nav-container">
          {/* Brand & Couple Identity: fits entire couple name even on 320px screens */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0, flex: 1 }}>
            <Link
              href="/home"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                textDecoration: 'none',
                minWidth: 0,
              }}
            >
              <span style={{ color: 'var(--color-accent)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <IconDove size={19} />
              </span>
              <span
                className="font-serif truncate-single-line"
                style={{
                  fontSize: 'clamp(0.82rem, 3.8vw, 1.15rem)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.02em',
                  display: 'inline-block',
                }}
                title={coupleName}
              >
                {coupleName}
              </span>
            </Link>

            {badgeText && (
              <Link href="/upgrade" title={`Little Us ${badgeText} Club`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    padding: '0.1rem 0.35rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-tint-rose)',
                    color: 'var(--color-accent)',
                    border: '1px solid var(--color-tint-rose-border)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'inline-block',
                  }}
                >
                  {badgeText}
                </span>
              </Link>
            )}
          </div>

          {/* Primary Navigation - Desktop Only (≥ 768px) */}
          <nav
            className="hide-on-mobile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
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
                  {link.desktopLabel}
                </Link>
              );
            })}
          </nav>

          {/* Secondary Actions: Room Upgrade & Settings */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
            {!isPremium && (
              <Link
                href="/upgrade"
                title="Upgrade Sanctuary Room"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-accent)',
                  padding: '0.2rem 0.45rem',
                  background: 'var(--color-tint-rose)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-tint-rose-border)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.15rem',
                }}
              >
                <span className="badge-room-full">More room ✨</span>
                <span className="badge-room-short">✨ Room</span>
                <span className="badge-room-micro">✨</span>
              </Link>
            )}

            <Link
              href="/settings"
              title="Settings & Space Personalization"
              style={{
                color: pathname === '/settings' ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                padding: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                transition: 'color var(--duration-fast)',
              }}
              aria-label="Settings"
            >
              <IconSettings size={18} />
            </Link>

            {/* Desktop Only Sign out button: on mobile, Sign out lives comfortably in Settings */}
            <button
              onClick={() => logoutUser().then(() => (window.location.href = '/login'))}
              className="btn-ghost hide-on-mobile"
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.5rem',
                color: 'var(--color-text-tertiary)',
                whiteSpace: 'nowrap',
              }}
              title={`Signed in as ${myNickname}`}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (< 768px) */}
      <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
        {links.map((link) => {
          const isActive =
            link.href === '/home'
              ? pathname === '/home'
              : pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`mobile-bottom-tab ${isActive ? 'active' : ''}`}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  width: '24px',
                  height: '24px',
                }}
              >
                <Icon size={20} />
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-accent)',
                    }}
                  />
                )}
              </div>
              <span style={{ whiteSpace: 'nowrap' }}>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

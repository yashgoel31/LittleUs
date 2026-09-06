import React from 'react';
import { IconBook, IconMail, IconPin, IconCalendar, IconMapPin } from '@/components/ui/Icons';

export function FeaturesSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* 3. Memories Preview */}
      <section style={{ padding: '4.5rem 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                }}
              >
                <IconBook size={16} />
                <span>Memories</span>
              </div>
              <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
                Your shared journal, page by page.
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Not for likes or comments. Just a private place to write down how you felt on the summer road trip, the quiet Tuesday dinner, and the silly inside jokes that make your story yours.
              </p>
            </div>

            {/* Realistic Preview Item */}
            <div
              className="surface-card"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-raised)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                  August 19, 2024
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  <IconMapPin size={12} /> Big Sur Lighthouse
                </span>
              </div>
              <h3 className="font-serif" style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                The Fog Clearing Over the Cliffs
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                We waited in the cold car sipping lukewarm coffee until 10am. Just as we thought it was a lost cause, the clouds broke and the whole ocean turned gold.
              </p>
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                <span>Penned by Julian</span>
                <span style={{ color: 'var(--color-accent)' }}>♥ Favorite</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Love Notes Preview */}
      <section style={{ padding: '4.5rem 0', borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-subtle)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            {/* Realistic Preview Item (Left on desktop) */}
            <div
              style={{
                background: 'var(--color-tint-rose)',
                border: '1px solid var(--color-tint-rose-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-card)',
                transform: 'rotate(-0.5deg)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent)', fontWeight: 600 }}>
                  Pinned to Sanctuary Desk
                </span>
                <span style={{ color: 'var(--color-accent)' }}>
                  <IconPin size={16} />
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  lineHeight: 1.5,
                  color: '#4A2A26',
                  margin: '1rem 0',
                }}
              >
                “I was thinking about you while walking between meetings today. Thank you for making our home feel so warm.”
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                <span>From Maya</span>
                <span>today at 2:14 PM</span>
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                }}
              >
                <IconPin size={16} />
                <span>Love Notes</span>
              </div>
              <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
                Little whispers left on your desk.
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Pin sweet thoughts, warm reminders, and little gratitude notes for your partner to find during a busy workday.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Open When Preview */}
      <section style={{ padding: '4.5rem 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                }}
              >
                <IconMail size={16} />
                <span>Open When Letters</span>
              </div>
              <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
                Digital wax seals for when they need you.
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Write letters in advance for the moments that matter: when they are feeling overwhelmed, when you had a silly argument, or when you are traveling miles apart. The letters stay sealed until opened.
              </p>
            </div>

            {/* Realistic Preview Envelope */}
            <div
              className="surface-card"
              style={{
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                background: 'linear-gradient(145deg, #FAF4F0 0%, #F5EAE4 100%)',
                border: '1px solid #E4D2C9',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent)', fontWeight: 600 }}>
                  ✉️ Wax-Sealed Letter
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                  Penned with love
                </span>
              </div>
              <h3 className="font-serif" style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>
                Open when you&apos;ve had an exhausting day.
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
                Take off your shoes, put down your phone, and let these words give you a hug.
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border-default)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--color-accent)',
                }}
              >
                Sealed until you break the wax seal →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Important Dates Preview */}
      <section style={{ padding: '4.5rem 0', borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-subtle)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            {/* Realistic Date Cards (Left) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                className="surface-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div className="font-serif" style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                    Our 3rd Anniversary
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                    October 14 • Yearly milestone
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                    in 18 days
                  </span>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>
                    Countdown
                  </div>
                </div>
              </div>

              <div
                className="surface-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div className="font-serif" style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                    First Moved In Together
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                    June 2, 2023
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                    462 days ago
                  </span>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)' }}>
                    Passed
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                }}
              >
                <IconCalendar size={16} />
                <span>Special Dates</span>
              </div>
              <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
                Every milestone softly counted.
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Watch your days together grow day by day, and count down toward your next anniversary, getaway, or quiet celebration.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

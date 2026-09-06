import React from 'react';
import { IconHeart, IconPin, IconCalendar, IconMapPin } from '@/components/ui/Icons';

export function ProductPreviewCard() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '720px',
        margin: '0 auto',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-default)',
        background: 'var(--color-bg-surface)',
        boxShadow: '0 12px 32px rgba(43, 36, 33, 0.08), 0 2px 6px rgba(43, 36, 33, 0.03)',
        overflow: 'hidden',
        textAlign: 'left',
      }}
    >
      {/* App Header Chrome */}
      <div
        style={{
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid var(--color-border-subtle)',
          background: 'var(--color-bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--color-accent)', display: 'flex' }}>
            <IconHeart size={16} />
          </span>
          <span className="font-serif" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Maya & Julian&apos;s World
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
          <span>Sanctuary</span>
          <span>•</span>
          <span>Private for 2</span>
        </div>
      </div>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Days Together & Upcoming Date Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent)', fontWeight: 600 }}>
              Together Since October 2021
            </span>
            <div className="font-serif" style={{ fontSize: '2.1rem', fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.15 }}>
              1,248 days
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
              Holding hands, building a home, laughing at silly things.
            </p>
          </div>

          {/* Upcoming Date Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <span style={{ color: 'var(--color-accent)' }}>
              <IconCalendar size={18} />
            </span>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Amalfi Coast Trip
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 500 }}>
                in 18 days
              </div>
            </div>
          </div>
        </div>

        {/* Two column preview: Pinned Love Note & Memory Keepsake */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Pinned Love Note */}
          <div
            style={{
              background: 'var(--color-tint-rose)',
              border: '1px solid var(--color-tint-rose-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.15rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-accent)', fontWeight: 600 }}>
                  Pinned Whisper
                </span>
                <span style={{ color: 'var(--color-accent)', opacity: 0.8 }}>
                  <IconPin size={14} />
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.05rem',
                  lineHeight: 1.45,
                  color: '#4A2A26',
                  fontStyle: 'italic',
                }}
              >
                “Left the warm almond croissant on the small plate for you. Don&apos;t work too hard today my love x”
              </p>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.75rem' }}>
              From Julian • this morning
            </div>
          </div>

          {/* Memory Preview Card */}
          <div
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.15rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: '0.35rem' }}>
                <IconMapPin size={13} />
                <span>Kyoto, Japan • Oct 14</span>
              </div>
              <h4 className="font-serif" style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                Rainy Coffee at Vintage Books
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                We stood under the awning listening to the rain on the tiles. You tucked your cold hands inside my coat pocket.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
              <span>Saved by Maya</span>
              <span style={{ color: 'var(--color-accent)' }}>♥ Favorite</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

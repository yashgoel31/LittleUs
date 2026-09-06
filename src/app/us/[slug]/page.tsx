'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getPublicSharedPage, PublicSharePageResult } from '@/server/actions/share';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconHeart, IconPin, IconMail, IconCalendar, IconMapPin, IconDove } from '@/components/ui/Icons';
import { formatIntimateDate } from '@/lib/utils';
import { NOTE_STYLES } from '@/components/features/LoveNoteCard';

export default function PublicSharedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [loading, setLoading] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [submittingPasscode, setSubmittingPasscode] = useState(false);
  const [shareData, setShareData] = useState<PublicSharePageResult | null>(null);

  const loadData = async (code?: string) => {
    try {
      const res = await getPublicSharedPage(slug, code);
      setShareData(res);
      if (res.isLocked && code) {
        setPasscodeError('Incorrect passcode. Please check with the couple.');
      } else {
        setPasscodeError(null);
      }
    } finally {
      setLoading(false);
      setSubmittingPasscode(false);
    }
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    setSubmittingPasscode(true);
    loadData(passcode.trim());
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-bg-base)',
          color: 'var(--color-text-secondary)',
          fontSize: '0.9375rem',
        }}
      >
        Opening Little Us sanctuary...
      </div>
    );
  }

  // Not found or sharing disabled
  if (!shareData || shareData.notFound) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          backgroundColor: 'var(--color-bg-base)',
        }}
      >
        <div
          className="surface-card"
          style={{
            maxWidth: '420px',
            textAlign: 'center',
            padding: '2.5rem 2rem',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div style={{ color: 'var(--color-accent)', marginBottom: '0.75rem' }}>
            <IconDove size={36} />
          </div>
          <h1 className="font-serif" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            This little world is private.
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            The link you followed may be expired or the couple has kept their space intimate.
          </p>
          <Link href="/" className="btn-secondary" style={{ fontSize: '0.84375rem' }}>
            Learn about Little Us
          </Link>
        </div>
      </div>
    );
  }

  // Password protected world challenge
  if (shareData.isLocked) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          backgroundColor: 'var(--color-bg-base)',
        }}
      >
        <div
          className="surface-card"
          style={{
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            padding: '2.5rem 2rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-raised)',
          }}
        >
          <span style={{ fontSize: '2rem' }}>🗝️</span>
          <h1 className="font-serif" style={{ fontSize: '1.65rem', marginTop: '0.5rem', marginBottom: '0.35rem' }}>
            {shareData.coupleName || 'Private Sanctuary'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            This world is password-protected. Please enter the visitor passcode.
          </p>

          {passcodeError && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-tint-rose)',
                color: 'var(--color-accent-hover)',
                fontSize: '0.8125rem',
                marginBottom: '1rem',
              }}
            >
              {passcodeError}
            </div>
          )}

          <form onSubmit={handleUnlock}>
            <Input
              type="password"
              required
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode..."
              autoFocus
            />

            <Button type="submit" isLoading={submittingPasscode} style={{ width: '100%', marginTop: '0.5rem' }}>
              Step Inside →
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const { data } = shareData;
  if (!data) return null;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Quiet Header */}
      <header
        style={{
          borderBottom: '1px solid var(--color-border-subtle)',
          padding: '0.75rem 1rem',
          textAlign: 'center',
          backgroundColor: 'rgba(250, 248, 245, 0.85)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-tertiary)' }}>
          Shared Keepsake • Little Us
        </span>
      </header>

      {/* Main Content (Optimized Mobile & Desktop Experience) */}
      <main style={{ flex: 1, padding: '2.5rem 1rem 4rem 1rem' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* ===============================================================
              HERO: Avatars, Couple Names, Days Together
              =============================================================== */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-subtle)',
                boxShadow: 'var(--shadow-subtle)',
                marginBottom: '1rem',
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>{data.partner1.avatar}</span>
              <span style={{ color: 'var(--color-accent)', fontSize: '0.9rem' }}>♥</span>
              <span style={{ fontSize: '1.4rem' }}>{data.partner2.avatar}</span>
            </div>

            <h1
              className="font-serif"
              style={{
                fontSize: '2.4rem',
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                marginBottom: '0.35rem',
              }}
            >
              {data.partner1.name} & {data.partner2.name}
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--color-accent)', fontWeight: 500 }}>
              {data.daysTogetherString}
            </p>
          </div>

          {/* ===============================================================
              SELECTED LOVE NOTES (if enabled)
              =============================================================== */}
          {data.notes && data.notes.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
                <span style={{ color: 'var(--color-accent)' }}>
                  <IconPin size={15} />
                </span>
                <h2 className="font-serif" style={{ fontSize: '1.35rem' }}>
                  Little Whispers
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.notes.map((note, idx) => {
                  const styleKey = note.style as keyof typeof NOTE_STYLES;
                  const scheme = NOTE_STYLES[styleKey] || NOTE_STYLES.blush;

                  return (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: scheme.bg,
                        border: `1px solid ${scheme.border}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '1.35rem',
                        boxShadow: 'var(--shadow-subtle)',
                      }}
                    >
                      {note.recipient && (
                        <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: scheme.tag, fontWeight: 600, marginBottom: '0.35rem' }}>
                          For {note.recipient}
                        </div>
                      )}
                      <p
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '1.15rem',
                          lineHeight: 1.5,
                          color: scheme.text,
                          whiteSpace: 'pre-wrap',
                          marginBottom: '0.75rem',
                        }}
                      >
                        “{note.content}”
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-tertiary)', borderTop: `1px dashed ${scheme.border}`, paddingTop: '0.5rem' }}>
                        <span>From {note.authorName}</span>
                        {note.date && <span>{formatIntimateDate(note.date)}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ===============================================================
              SELECTED MEMORIES (if enabled)
              =============================================================== */}
          {data.memories && data.memories.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--color-accent)' }}>
                  <IconHeart size={15} />
                </span>
                <h2 className="font-serif" style={{ fontSize: '1.35rem' }}>
                  Keepsake Memories
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {data.memories.map((mem, idx) => (
                  <article
                    key={idx}
                    className="surface-card"
                    style={{
                      borderRadius: 'var(--radius-md)',
                      padding: '1.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: '0.5rem' }}>
                      <span>{formatIntimateDate(mem.date)}</span>
                      {mem.location && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <IconMapPin size={11} /> {mem.location}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                      {mem.title}
                    </h3>

                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {mem.content}
                    </p>

                    {mem.photoUrls && mem.photoUrls.length > 0 && (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: `repeat(${Math.min(mem.photoUrls.length, 3)}, 1fr)`,
                          gap: '0.5rem',
                          marginTop: '0.85rem',
                        }}
                      >
                        {mem.photoUrls.map((url, i) => (
                          <div
                            key={i}
                            style={{
                              borderRadius: 'var(--radius-sm)',
                              overflow: 'hidden',
                              aspectRatio: '4/3',
                              background: 'var(--color-bg-subtle)',
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt={mem.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ===============================================================
              SELECTED OPEN WHEN ENVELOPES (if enabled)
              =============================================================== */}
          {data.letters && data.letters.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--color-accent)' }}>
                  <IconMail size={15} />
                </span>
                <h2 className="font-serif" style={{ fontSize: '1.35rem' }}>
                  “Open When” Letters
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {data.letters.map((letter, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: letter.isOpened ? 'var(--color-bg-surface)' : '#FAF3EE',
                      border: letter.isOpened ? '1px solid var(--color-border-subtle)' : '1px solid #E6D2C8',
                    }}
                  >
                    <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-accent)', fontWeight: 600 }}>
                      {letter.isOpened ? '✉️ Opened Keepsake' : '💌 Sealed Envelope'}
                    </span>

                    <h4 className="font-serif" style={{ fontSize: '1.15rem', margin: '0.4rem 0' }}>
                      {letter.title}
                    </h4>

                    {letter.isOpened && letter.message && (
                      <p style={{ fontSize: '0.84375rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                        “{letter.message}”
                      </p>
                    )}

                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.5rem' }}>
                      From {letter.authorName}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ===============================================================
              IMPORTANT DATES (if enabled)
              =============================================================== */}
          {data.dates && data.dates.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--color-accent)' }}>
                  <IconCalendar size={15} />
                </span>
                <h2 className="font-serif" style={{ fontSize: '1.35rem' }}>
                  Upcoming Days
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.dates.map((d, idx) => (
                  <div
                    key={idx}
                    className="surface-card"
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <h4 className="font-serif" style={{ fontSize: '1.05rem' }}>
                        {d.title}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        {d.formattedDate}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                        {d.isToday ? 'Today! 🎉' : `in ${d.daysRemaining}d`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Warm Footer for Guests */}
      <footer
        style={{
          borderTop: '1px solid var(--color-border-subtle)',
          padding: '2.5rem 1rem',
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: 'var(--color-text-tertiary)',
        }}
      >
        <p className="font-serif" style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
          Little Us
        </p>
        <p style={{ marginBottom: '1rem' }}>
          A quiet, private sanctuary designed for two.
        </p>
        <Link href="/" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.9rem' }}>
          Start your own Little Us →
        </Link>
      </footer>
    </div>
  );
}

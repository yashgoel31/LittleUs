import React from 'react';
import Link from 'next/link';
import { getCoupleOverview } from '@/server/actions/couple';
import { getMemories } from '@/server/actions/memories';
import { getLoveNotes } from '@/server/actions/loveNotes';
import { getOpenWhenLetters } from '@/server/actions/letters';
import { getImportantDates } from '@/server/actions/dates';
import { getDaysTogether, formatIntimateDate, getDaysRemaining } from '@/lib/utils';
import { MemoryCard } from '@/components/features/MemoryCard';
import { LetterEnvelope } from '@/components/features/LetterEnvelope';
import { IconHeart, IconPin, IconCalendar, IconMail, IconPlus } from '@/components/ui/Icons';

export const dynamic = 'force-dynamic';

export default async function SanctuaryHomePage() {
  const { couple, currentAuth } = await getCoupleOverview();
  if (!couple) return null;

  const [allMemories, allNotes, allLetters, allDates] = await Promise.all([
    getMemories(),
    getLoveNotes(),
    getOpenWhenLetters(),
    getImportantDates(),
  ]);

  // Latest 3 memories
  const latestMemories = allMemories.slice(0, 3);

  // Latest love note
  const latestNote = allNotes[0] || null;

  // Unopened letters (few, up to 3)
  const unopenedLetters = allLetters.filter((l) => !l.isOpened).slice(0, 3);

  // Nearest upcoming date
  const nearestDate = allDates.find((d) => !getDaysRemaining(d.date).isPast) || allDates[0] || null;

  // Partner display logic
  const member1 = couple.members[0];
  const member2 = couple.members[1];

  const name1 = member1?.nickname || currentAuth.myNickname || 'You';
  const name2 = member2?.nickname || 'Partner';
  const coupleHeading = member2 ? `${name1} & ${name2}` : `${name1}'s Space`;

  const avatar1 = member1?.avatarUrl || '🕊️';
  const avatar2 = member2?.avatarUrl || (member2 ? '🌿' : '💌');

  // Days together calculation
  const daysTogether = couple.anniversaryDate ? getDaysTogether(couple.anniversaryDate) : 0;
  const daysString = daysTogether > 0 ? `Together for ${daysTogether.toLocaleString()} days ❤️` : 'Day 1 of your story ❤️';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '820px', margin: '0 auto' }}>
      {/* =========================================================================
          TOP: Avatars, Couple Names, Days Together, & Primary Actions
          ========================================================================= */}
      <section style={{ textAlign: 'center', paddingTop: '1rem' }}>
        {/* [their avatar] + [partner avatar] */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: 'var(--shadow-subtle)',
            marginBottom: '1rem',
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>{avatar1}</span>
          <span style={{ color: 'var(--color-accent)', fontSize: '0.9rem' }}>♥</span>
          <span style={{ fontSize: '1.4rem' }}>{avatar2}</span>
        </div>

        {/* "Yash & Alex" */}
        <h1
          className="font-serif"
          style={{
            fontSize: 'clamp(2rem, 6vw, 2.5rem)',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '0.35rem',
          }}
        >
          {coupleHeading}
        </h1>

        {/* "Together for 247 days ❤️" */}
        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--color-accent)',
            fontWeight: 500,
            marginBottom: '1.75rem',
          }}
        >
          {daysString}
        </p>

        {/* PRIMARY ACTIONS: "Add memory", "Write a note", "Create an Open When" */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/memories"
            className="btn-primary"
            style={{ padding: '0.6rem 1.15rem', fontSize: '0.84375rem' }}
          >
            <IconPlus size={15} />
            <span>Add memory</span>
          </Link>

          <Link
            href="/notes"
            className="btn-secondary"
            style={{ padding: '0.6rem 1.15rem', fontSize: '0.84375rem' }}
          >
            <IconPin size={15} />
            <span>Write a note</span>
          </Link>

          <Link
            href="/letters"
            className="btn-secondary"
            style={{ padding: '0.6rem 1.15rem', fontSize: '0.84375rem' }}
          >
            <IconMail size={15} />
            <span>Create an Open When</span>
          </Link>
        </div>
      </section>

      {/* Solo Partner Notice if awaiting partner */}
      {couple.members.length === 1 && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-tint-rose)',
            border: '1px solid var(--color-tint-rose-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-accent-hover)' }}>
              Waiting for your partner to step inside...
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
              Share your secret invite code:{' '}
              <strong style={{ letterSpacing: '0.08em', color: 'var(--color-text-primary)' }}>
                {couple.inviteCode}
              </strong>
            </div>
          </div>
          <Link href="/settings" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}>
            Invite Code Details
          </Link>
        </div>
      )}

      {/* =========================================================================
          LOVE NOTE: Show the latest note
          ========================================================================= */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--color-accent)' }}>
              <IconPin size={16} />
            </span>
            <h2 className="font-serif" style={{ fontSize: '1.35rem' }}>
              Latest Love Note
            </h2>
          </div>
          <Link href="/notes" style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', textDecoration: 'underline' }}>
            All notes ({allNotes.length}) →
          </Link>
        </div>

        {latestNote ? (
          <div
            style={{
              background: 'var(--color-tint-rose)',
              border: '1px solid var(--color-tint-rose-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-card)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-accent)', fontWeight: 600 }}>
                Left on the desk
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                From {latestNote.author.name}
              </span>
            </div>

            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.25rem',
                lineHeight: 1.55,
                color: '#4A2A26',
                margin: '0.75rem 0',
                whiteSpace: 'pre-wrap',
              }}
            >
              “{latestNote.content}”
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
              <span>{formatIntimateDate(latestNote.createdAt)}</span>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '2rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-border-default)',
              background: 'var(--color-bg-surface)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
              No note pinned right now. Leave a sweet little thought for them to wake up to.
            </p>
            <Link href="/notes" className="btn-secondary" style={{ fontSize: '0.8125rem' }}>
              Leave a note
            </Link>
          </div>
        )}
      </section>

      {/* =========================================================================
          UPCOMING: Show the nearest important date with countdown
          ========================================================================= */}
      {nearestDate && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: 'var(--color-accent)' }}>
                <IconCalendar size={16} />
              </span>
              <h2 className="font-serif" style={{ fontSize: '1.35rem' }}>
                Coming Up Next
              </h2>
            </div>
            <Link href="/dates" style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', textDecoration: 'underline' }}>
              All dates ({allDates.length}) →
            </Link>
          </div>

          {(() => {
            const days = nearestDate.daysRemaining;
            const isPast = nearestDate.isPast;
            const isToday = nearestDate.isToday;
            const dateStr = nearestDate.formattedTargetDate || formatIntimateDate(nearestDate.date);

            return (
              <div
                className="surface-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.85rem',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div>
                  <h3 className="font-serif" style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
                    {nearestDate.title}
                  </h3>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    Next: {dateStr} {nearestDate.isYearly && nearestDate.yearsPassed ? `• Celebrating ${nearestDate.yearsPassed} yr${nearestDate.yearsPassed > 1 ? 's' : ''}` : nearestDate.isYearly ? '• Annual celebration' : ''}
                  </span>
                  {nearestDate.description && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                      “{nearestDate.description}”
                    </p>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: isToday ? 'var(--color-accent)' : isPast ? 'var(--color-text-secondary)' : 'var(--color-accent)' }}>
                    {isToday ? 'Today! 🎉' : isPast ? `${days}d ago` : `in ${days} day${days === 1 ? '' : 's'}`}
                  </div>
                  <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-tertiary)' }}>
                    {isToday ? 'Celebration' : isPast ? 'Milestone passed' : 'Countdown'}
                  </span>
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* =========================================================================
          MEMORY PREVIEW: Show the latest 3 memories
          ========================================================================= */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--color-accent)' }}>
              <IconHeart size={16} />
            </span>
            <h2 className="font-serif" style={{ fontSize: '1.35rem' }}>
              Recent Scrapbook Keepsakes
            </h2>
          </div>
          <Link href="/memories" style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', textDecoration: 'underline' }}>
            Open full album ({allMemories.length}) →
          </Link>
        </div>

        {latestMemories.length === 0 ? (
          <div
            style={{
              padding: '3rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-border-default)',
              background: 'var(--color-bg-surface)',
              textAlign: 'center',
            }}
          >
            <h3 className="font-serif" style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>
              Your scrapbook is ready for its first moment.
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Preserve a quiet trip, a laughing photo, or an anniversary dinner.
            </p>
            <Link href="/memories" className="btn-primary" style={{ fontSize: '0.8125rem' }}>
              + Add first memory
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {latestMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          OPEN WHEN: Show a few unopened letters
          ========================================================================= */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: 'var(--color-accent)' }}>
              <IconMail size={16} />
            </span>
            <h2 className="font-serif" style={{ fontSize: '1.35rem' }}>
              Sealed “Open When” Letters
            </h2>
          </div>
          <Link href="/letters" style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', textDecoration: 'underline' }}>
            View chest ({allLetters.length}) →
          </Link>
        </div>

        {unopenedLetters.length === 0 ? (
          <div
            style={{
              padding: '2.5rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-border-default)',
              background: 'var(--color-bg-surface)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
              No unopened letters waiting. Write one for when your partner is having a long day or misses you.
            </p>
            <Link href="/letters" className="btn-secondary" style={{ fontSize: '0.8125rem' }}>
              Seal an “Open When” Letter
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {unopenedLetters.map((letter) => (
              <LetterEnvelope key={letter.id} letter={letter} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

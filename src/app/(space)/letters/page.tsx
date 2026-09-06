'use client';

import React, { useState, useEffect } from 'react';
import { getOpenWhenLetters } from '@/server/actions/letters';
import { LetterEnvelope, OpenWhenLetterData } from '@/components/features/LetterEnvelope';
import { LetterModal } from '@/components/features/LetterModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { IconMail, IconPlus } from '@/components/ui/Icons';

export default function OpenWhenLettersPage() {
  const [letters, setLetters] = useState<OpenWhenLetterData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalMode, setModalMode] = useState<'open' | 'create' | 'edit' | null>(null);
  const [activeLetter, setActiveLetter] = useState<OpenWhenLetterData | null>(null);

  const fetchLetters = async () => {
    try {
      const data = await getOpenWhenLetters();
      setLetters(data as OpenWhenLetterData[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const handleOpenLetter = (letter: OpenWhenLetterData) => {
    setActiveLetter(letter);
    setModalMode('open');
  };

  const handleCreateLetter = () => {
    setActiveLetter(null);
    setModalMode('create');
  };

  const handleEditLetter = (letter: OpenWhenLetterData) => {
    setActiveLetter(letter);
    setModalMode('edit');
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setActiveLetter(null);
  };

  const sealedLetters = letters.filter((l) => !l.isOpened);
  const openedLetters = letters.filter((l) => l.isOpened);

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-accent)',
              fontWeight: 600,
              marginBottom: '0.25rem',
            }}
          >
            <IconMail size={14} />
            <span>Digital Envelopes</span>
          </div>
          <h1 className="font-serif" style={{ fontSize: '2.25rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
            “Open When...” Letters
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            Sealed with digital wax. Waiting for the exact moments your partner needs them.
          </p>
        </div>

        <Button onClick={handleCreateLetter}>
          <IconPlus size={16} />
          <span>Seal an Envelope</span>
        </Button>
      </div>

      {/* ===============================================================
          LOADING STATE
          =============================================================== */}
      {loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="surface-card"
              style={{
                height: '210px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-subtle)',
                opacity: 0.6,
                animation: 'fadeIn 1s ease-in-out infinite alternate',
              }}
            />
          ))}
        </div>
      )}

      {/* ===============================================================
          EMPTY STATE
          =============================================================== */}
      {!loading && letters.length === 0 && (
        <EmptyState
          icon={<IconMail size={32} />}
          title="The letter chest is empty."
          description="Seal a letter for when they are having a hard day, when you're apart on a rainy night, or for an upcoming anniversary."
          actionLabel="Seal your first envelope"
          onAction={handleCreateLetter}
        />
      )}

      {/* ===============================================================
          SEALED ENVELOPES SECTION
          =============================================================== */}
      {!loading && sealedLetters.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--color-accent)' }}>
              <IconMail size={16} />
            </span>
            <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>
              Sealed Envelopes ({sealedLetters.length})
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {sealedLetters.map((letter) => (
              <LetterEnvelope
                key={letter.id}
                letter={letter}
                onOpen={handleOpenLetter}
                onEdit={handleEditLetter}
                onRefresh={fetchLetters}
              />
            ))}
          </div>
        </section>
      )}

      {/* ===============================================================
          OPENED LETTERS ARCHIVE SECTION
          =============================================================== */}
      {!loading && openedLetters.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
            <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)' }}>
              Opened Envelopes ({openedLetters.length})
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {openedLetters.map((letter) => (
              <LetterEnvelope
                key={letter.id}
                letter={letter}
                onOpen={handleOpenLetter}
                onEdit={handleEditLetter}
                onRefresh={fetchLetters}
              />
            ))}
          </div>
        </section>
      )}

      {/* Interactive Modal for Opening, Creating, and Editing */}
      {modalMode && (
        <LetterModal
          mode={modalMode}
          letter={activeLetter}
          onClose={handleCloseModal}
          onSuccess={fetchLetters}
        />
      )}
    </div>
  );
}

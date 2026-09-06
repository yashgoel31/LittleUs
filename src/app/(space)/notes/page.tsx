'use client';

import React, { useState, useEffect } from 'react';
import { getLoveNotes } from '@/server/actions/loveNotes';
import { LoveNoteCard, LoveNoteData } from '@/components/features/LoveNoteCard';
import { LoveNoteModal } from '@/components/features/LoveNoteModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { IconPin, IconPlus } from '@/components/ui/Icons';

export default function LoveNotesPage() {
  const [notes, setNotes] = useState<LoveNoteData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [activeNote, setActiveNote] = useState<LoveNoteData | null>(null);

  const fetchNotes = async () => {
    try {
      const data = await getLoveNotes();
      setNotes(data as LoveNoteData[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleOpenCreate = () => {
    setActiveNote(null);
    setModalMode('create');
  };

  const handleOpenEdit = (note: LoveNoteData) => {
    setActiveNote(note);
    setModalMode('edit');
  };

  const handleOpenView = (note: LoveNoteData) => {
    setActiveNote(note);
    setModalMode('view');
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setActiveNote(null);
  };

  const pinnedNotes = notes.filter((n) => n.isPinned);
  const unpinnedNotes = notes.filter((n) => !n.isPinned);

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header: Focused on calm typography & whitespace */}
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
            <IconPin size={14} />
            <span>Desk Whispers</span>
          </div>
          <h1 className="font-serif" style={{ fontSize: '2.25rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
            Love Notes
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            Little personal cards left for each other to discover.
          </p>
        </div>

        <Button onClick={handleOpenCreate}>
          <IconPlus size={16} />
          <span>Write a Note</span>
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
                height: '190px',
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
      {!loading && notes.length === 0 && (
        <EmptyState
          icon={<IconPin size={32} />}
          title="The note tray is quiet."
          description="Write a little compliment, a warm thought, or a morning reminder to leave on your partner’s desk."
          actionLabel="Write your first note"
          onAction={handleOpenCreate}
        />
      )}

      {/* ===============================================================
          PINNED NOTES SECTION
          =============================================================== */}
      {!loading && pinnedNotes.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--color-accent)' }}>
              <IconPin size={15} />
            </span>
            <h3 className="font-serif" style={{ fontSize: '1.15rem', color: 'var(--color-text-primary)' }}>
              Pinned to Top
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {pinnedNotes.map((note) => (
              <LoveNoteCard
                key={note.id}
                note={note}
                onRefresh={fetchNotes}
                onView={handleOpenView}
                onEdit={handleOpenEdit}
              />
            ))}
          </div>
        </section>
      )}

      {/* ===============================================================
          ALL OTHER NOTES SECTION
          =============================================================== */}
      {!loading && unpinnedNotes.length > 0 && (
        <section>
          {pinnedNotes.length > 0 && (
            <h3 className="font-serif" style={{ fontSize: '1.15rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
              All Notes
            </h3>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {unpinnedNotes.map((note) => (
              <LoveNoteCard
                key={note.id}
                note={note}
                onRefresh={fetchNotes}
                onView={handleOpenView}
                onEdit={handleOpenEdit}
              />
            ))}
          </div>
        </section>
      )}

      {/* Modal for View, Create, and Edit */}
      {modalMode && (
        <LoveNoteModal
          mode={modalMode}
          note={activeNote}
          onClose={handleCloseModal}
          onSuccess={fetchNotes}
        />
      )}
    </div>
  );
}

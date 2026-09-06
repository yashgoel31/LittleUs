'use client';

import React, { useState, useEffect } from 'react';
import { getImportantDates } from '@/server/actions/dates';
import { ImportantDateCard, ImportantDateData } from '@/components/features/ImportantDateCard';
import { ImportantDateModal } from '@/components/features/ImportantDateModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { IconCalendar, IconPlus } from '@/components/ui/Icons';

export default function ImportantDatesPage() {
  const [dates, setDates] = useState<ImportantDateData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [activeDate, setActiveDate] = useState<ImportantDateData | null>(null);

  const fetchDates = async () => {
    try {
      const data = await getImportantDates();
      setDates(data as ImportantDateData[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDates();
  }, []);

  const handleCreate = () => {
    setActiveDate(null);
    setModalMode('create');
  };

  const handleEdit = (item: ImportantDateData) => {
    setActiveDate(item);
    setModalMode('edit');
  };

  const handleClose = () => {
    setModalMode(null);
    setActiveDate(null);
  };

  // Group into upcoming vs past
  const upcomingDates = dates.filter((d) => !d.isPast);
  const pastDates = dates.filter((d) => d.isPast);

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
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
            <IconCalendar size={14} />
            <span>Milestones & Countdowns</span>
          </div>
          <h1 className="font-serif" style={{ fontSize: '2.25rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
            Important Dates
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            Anniversaries, birthdays, first dates, and days you look forward to together.
          </p>
        </div>

        <Button onClick={handleCreate}>
          <IconPlus size={16} />
          <span>Add a Date</span>
        </Button>
      </div>

      {/* ===============================================================
          LOADING STATE
          =============================================================== */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="surface-card"
              style={{
                height: '80px',
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
      {!loading && dates.length === 0 && (
        <EmptyState
          icon={<IconCalendar size={32} />}
          title="No milestone dates saved yet."
          description="Add your official anniversary, your partner's birthday, your first date, or an upcoming vacation."
          actionLabel="Add your first milestone"
          onAction={handleCreate}
        />
      )}

      {/* ===============================================================
          UPCOMING DATES
          =============================================================== */}
      {!loading && upcomingDates.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--color-accent)' }}>
              <IconCalendar size={16} />
            </span>
            <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>
              Upcoming Countdowns ({upcomingDates.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {upcomingDates.map((item) => (
              <ImportantDateCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onRefresh={fetchDates}
              />
            ))}
          </div>
        </section>
      )}

      {/* ===============================================================
          PAST DATES
          =============================================================== */}
      {!loading && pastDates.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
            <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)' }}>
              Cherished Milestones ({pastDates.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pastDates.map((item) => (
              <ImportantDateCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onRefresh={fetchDates}
              />
            ))}
          </div>
        </section>
      )}

      {/* Modal for Create & Edit */}
      {modalMode && (
        <ImportantDateModal
          mode={modalMode}
          item={activeDate}
          onClose={handleClose}
          onSuccess={fetchDates}
        />
      )}
    </div>
  );
}

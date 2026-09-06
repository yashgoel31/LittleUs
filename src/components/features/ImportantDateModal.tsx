'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconClose } from '@/components/ui/Icons';
import { ImportantDateData } from './ImportantDateCard';
import { createImportantDate, updateImportantDate } from '@/server/actions/dates';

interface ImportantDateModalProps {
  mode: 'create' | 'edit';
  item?: ImportantDateData | null;
  onClose: () => void;
  onSuccess: () => void;
}

type CategoryType = 'anniversary' | 'birthday' | 'first_date' | 'custom';

export function ImportantDateModal({ mode, item, onClose, onSuccess }: ImportantDateModalProps) {
  const [category, setCategory] = useState<CategoryType>(
    (item?.category as CategoryType) || 'custom'
  );
  const [title, setTitle] = useState(item?.title || '');
  const [date, setDate] = useState(
    item?.date ? new Date(item.date).toISOString().split('T')[0] : ''
  );
  const [description, setDescription] = useState(item?.description || '');
  const [isYearly, setIsYearly] = useState(item?.isYearly ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setCategory((item.category as CategoryType) || 'custom');
      setTitle(item.title);
      setDate(new Date(item.date).toISOString().split('T')[0]);
      setDescription(item.description || '');
      setIsYearly(item.isYearly);
    }
  }, [item]);

  const handleSelectCategory = (cat: CategoryType) => {
    setCategory(cat);
    if (cat === 'anniversary') {
      setIsYearly(true);
      if (!title || title.includes('Birthday') || title.includes('Date')) {
        setTitle('Our Anniversary');
      }
    } else if (cat === 'birthday') {
      setIsYearly(true);
      if (!title || title.includes('Anniversary') || title.includes('Date')) {
        setTitle("Partner's Birthday");
      }
    } else if (cat === 'first_date') {
      setIsYearly(true);
      if (!title || title.includes('Birthday') || title.includes('Anniversary')) {
        setTitle('Our First Date');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setError(null);
    setLoading(true);

    const payload = {
      title: title.trim(),
      date,
      description: description.trim() || null,
      category,
      isYearly,
      icon: category === 'anniversary' ? 'ring' : category === 'birthday' ? 'cake' : category === 'first_date' ? 'cup' : 'heart',
    };

    let res;
    if (mode === 'edit' && item) {
      res = await updateImportantDate(item.id, payload);
    } else {
      res = await createImportantDate(payload);
    }

    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Failed to save milestone date');
    }
  };

  const categories: Array<{ id: CategoryType; label: string; emoji: string }> = [
    { id: 'anniversary', label: 'Anniversary', emoji: '💍' },
    { id: 'birthday', label: 'Birthday', emoji: '🎂' },
    { id: 'first_date', label: 'First Date', emoji: '☕' },
    { id: 'custom', label: 'Custom Date', emoji: '✨' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(43, 36, 33, 0.45)',
        backdropFilter: 'blur(5px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="date-modal-title"
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-raised)',
          padding: '2rem 1.75rem',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close milestone dialog"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-tertiary)',
            cursor: 'pointer',
            padding: '0.35rem',
          }}
        >
          <IconClose size={18} />
        </button>

        <h2 id="date-modal-title" className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>
          {mode === 'edit' ? 'Edit Milestone Date' : 'Add an Important Date'}
        </h2>
        <p style={{ fontSize: '0.84375rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          Count down toward special days or mark recurring celebrations.
        </p>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-tint-rose)',
              color: 'var(--color-accent-hover)',
              fontSize: '0.84375rem',
              marginBottom: '1.25rem',
              border: '1px solid var(--color-tint-rose-border)',
            }}
          >
            {error}
          </div>
        )}

        {/* Category selector pills */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="input-label" style={{ marginBottom: '0.45rem' }}>
            Event Type
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
            {categories.map((c) => {
              const isSelected = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCategory(c.id)}
                  style={{
                    padding: '0.5rem 0.25rem',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border-default)',
                    background: isSelected ? 'var(--color-accent-subtle)' : 'var(--color-bg-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? 'var(--color-accent-hover)' : 'var(--color-text-primary)',
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{c.emoji}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Our 3rd Anniversary / First Date at the Pier"
            autoFocus
          />

          <Input
            label="Date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div style={{ marginBottom: '1.25rem' }}>
            <label className="input-label">Optional Description or Note</label>
            <textarea
              rows={2}
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. The little Italian cafe where we talked until 2am."
              style={{ fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84375rem', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
              <input
                type="checkbox"
                checked={isYearly}
                onChange={(e) => setIsYearly(e.target.checked)}
              />
              <span>Repeats every year (automatic annual countdown)</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              {mode === 'edit' ? 'Save Changes' : 'Save Date'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { getMemories, createMemory } from '@/server/actions/memories';
import { MemoryCard } from '@/components/features/MemoryCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface MemoryItem {
  id: string;
  title: string;
  content: string;
  date: Date | string;
  location?: string | null;
  photoUrls?: string[];
  isFavorite: boolean;
  author: {
    id: string;
    name: string;
  };
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [filterFav, setFilterFav] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  const fetchMemories = async () => {
    try {
      const list = await getMemories();
      setMemories(list as MemoryItem[]);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const photoUrls = photoUrlInput
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && u.startsWith('http'));

    const res = await createMemory({
      title,
      content,
      date,
      location: location || null,
      photoUrls,
      isFavorite: false,
    });

    setLoading(false);

    if (res.success) {
      setTitle('');
      setContent('');
      setLocation('');
      setPhotoUrlInput('');
      setShowModal(false);
      fetchMemories();
    } else {
      setError(res.error || 'Failed to preserve memory');
    }
  };

  const displayedMemories = filterFav
    ? memories.filter((m) => m.isFavorite)
    : memories;

  return (
    <div>
      {/* Header with Title & Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 className="font-serif" style={{ fontSize: '2rem' }}>
            Keepsake Memories
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
            The moments, adventures, and quiet rituals that make up your days
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setFilterFav(!filterFav)}
            className="btn-secondary"
            style={{
              borderColor: filterFav ? 'var(--text-accent)' : undefined,
              color: filterFav ? 'var(--text-accent)' : undefined,
            }}
          >
            {filterFav ? '♥ Showing Favorites' : '♡ Filter Favorites'}
          </button>
          <Button onClick={() => setShowModal(true)}>
            + Preserve Moment
          </Button>
        </div>
      </div>

      {/* New Memory Modal / Dropdown */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="memory-modal-title"
          className="surface-card"
          style={{
            padding: '2rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2.5rem',
            border: '2px solid var(--border-medium)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 id="memory-modal-title" className="font-serif" style={{ fontSize: '1.4rem' }}>
              Preserve a New Moment
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="btn-ghost"
              style={{ fontSize: '1.2rem' }}
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>

          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--blush-100)',
                color: 'var(--blush-600)',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
              <Input
                label="Memory Title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Rainy coffee in Kyoto"
              />
              <Input
                label="Date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <Input
              label="Location (Optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Old Town Bookshop, Prague"
            />

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="input-label">The Story / Feeling</label>
              <textarea
                required
                rows={4}
                className="input-field"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What did you talk about? How did the air smell? What made you smile?"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="input-label">Photo URLs (Optional, one per line)</label>
              <textarea
                rows={2}
                className="input-field"
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/... (one link per line)"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <Button type="submit" isLoading={loading}>
                Save into Our Keepsake Book
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Memories Grid */}
      {initialLoading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
            gap: '1.5rem',
          }}
        >
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="surface-card"
              style={{
                height: '220px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-subtle)',
                opacity: 0.6,
                animation: 'fadeIn 0.8s ease-in-out infinite alternate',
              }}
            />
          ))}
        </div>
      ) : displayedMemories.length === 0 ? (
        <div
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            border: '1px dashed var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📷</div>
          <h3 className="font-serif" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
            {filterFav ? 'No favorite memories found.' : 'Your keepsake journal is blank.'}
          </h3>
          <p style={{ fontSize: '0.9375rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            Every special night, quiet trip, and laughing fit deserves a soft place to rest.
          </p>
          <Button onClick={() => setShowModal(true)}>
            Preserve Your First Moment
          </Button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
            gap: '1.5rem',
          }}
        >
          {displayedMemories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onRefresh={fetchMemories}
            />
          ))}
        </div>
      )}
    </div>
  );
}

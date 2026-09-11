'use client';

import React, { useState, useRef } from 'react';
import { PlanTier, getPlanConfig } from '@/lib/config/plans';
import { IconSparkles } from '@/components/ui/Icons';

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  tier?: PlanTier | string | boolean | null;
  onUpgradeClick?: () => void;
}

export function PhotoUploader({
  photos,
  onChange,
  tier = 'FREE',
  onUpgradeClick,
}: PhotoUploaderProps) {
  const plan = getPlanConfig(tier);
  const maxMb = plan.maxMediaSizeMb;
  const maxBytes = maxMb * 1024 * 1024;

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Check size on client first
    for (const file of fileArray) {
      if (file.size > maxBytes) {
        const fileMb = (file.size / (1024 * 1024)).toFixed(1);
        setError(
          `"${file.name}" is ${fileMb} MB, which exceeds your ${plan.name} limit (${maxMb} MB). ${
            tier === 'FREE'
              ? 'Upgrade to Sweetheart (15 MB) or Forever (25 MB) to upload larger photos.'
              : tier === 'SWEETHEART'
              ? 'Upgrade to Forever Club for up to 25 MB per photo.'
              : ''
          }`
        );
        return;
      }
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgress(`Uploading ${i + 1} of ${fileArray.length} to Cloudinary...`);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || 'Failed to upload photo to cloud storage.');
          break;
        }

        if (data.url) {
          uploadedUrls.push(data.url);
        }
      } catch {
        setError('Network error while uploading photo. Please try again.');
        break;
      }
    }

    setUploading(false);
    setUploadProgress(null);

    if (uploadedUrls.length > 0) {
      onChange([...photos, ...uploadedUrls]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    onChange(photos.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddManualUrl = () => {
    const trimmed = manualUrl.trim();
    if (trimmed && (trimmed.startsWith('http://') || trimmed.startsWith('https://'))) {
      onChange([...photos, trimmed]);
      setManualUrl('');
      setError(null);
    } else {
      setError('Please provide a valid image URL starting with http:// or https://');
    }
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.4rem',
        }}
      >
        <label className="input-label" style={{ marginBottom: 0 }}>
          Photos & Keepsakes
        </label>
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-accent)',
            backgroundColor: 'var(--color-accent-subtle)',
            padding: '0.15rem 0.55rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-accent-border)',
            fontWeight: 500,
          }}
        >
          {plan.name}: Max {maxMb} MB / photo
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/heic,image/gif"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          border: isDragging
            ? '2px dashed var(--color-accent)'
            : '1.5px dashed var(--color-border-default)',
          backgroundColor: isDragging
            ? 'var(--color-accent-subtle)'
            : 'var(--color-bg-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem 1rem',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          transition: 'all var(--duration-fast)',
        }}
      >
        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                border: '2.5px solid var(--color-accent-subtle)',
                borderTopColor: 'var(--color-accent)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              {uploadProgress || 'Optimizing & uploading to Cloudinary...'}
            </span>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>📷</div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Click to select photos or drag & drop here
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.2rem' }}>
              JPG, PNG, WebP, HEIC (iPhone) up to {maxMb} MB
            </p>
          </div>
        )}
      </div>

      {/* Error alert with potential upgrade button */}
      {error && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-tint-rose)',
            border: '1px solid var(--color-tint-rose-border)',
            color: 'var(--color-accent-hover)',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <span>{error}</span>
          {onUpgradeClick && (tier === 'FREE' || tier === 'SWEETHEART') && (
            <button
              type="button"
              onClick={onUpgradeClick}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent)',
                fontWeight: 600,
                textDecoration: 'underline',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: '0.8125rem',
              }}
            >
              Upgrade room →
            </button>
          )}
        </div>
      )}

      {/* Uploaded Photos Gallery Preview */}
      {photos.length > 0 && (
        <div style={{ marginTop: '0.85rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
            Attached Photos ({photos.length}):
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {photos.map((url, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  aspectRatio: '1/1',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-subtle)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Memory photo ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto(index);
                  }}
                  title="Remove photo"
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    color: '#fff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual URL toggle fallback */}
      <div style={{ marginTop: '0.65rem' }}>
        <button
          type="button"
          onClick={() => setShowUrlFallback(!showUrlFallback)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-tertiary)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          {showUrlFallback ? '▲ Hide URL input' : '▼ Or add photo from a web link'}
        </button>

        {showUrlFallback && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="input-field"
              style={{ fontSize: '0.8125rem', height: '36px' }}
            />
            <button
              type="button"
              onClick={handleAddManualUrl}
              className="btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0 0.85rem', whiteSpace: 'nowrap' }}
            >
              Add Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

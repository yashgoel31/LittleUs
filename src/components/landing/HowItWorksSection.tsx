import React from 'react';

export function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Create your private world',
      desc: 'Set up your shared sanctuary in seconds. Pick your nicknames and your anniversary date.',
    },
    {
      num: '02',
      title: 'Invite your partner',
      desc: 'Share a secret invite code. Little Us is built exclusively for two—no third person can ever enter.',
    },
    {
      num: '03',
      title: 'Fill it with your story',
      desc: 'Leave sudden notes, seal letters for difficult days, and preserve memories that belong only to you.',
    },
  ];

  return (
    <section id="how-it-works" style={{ padding: '4.5rem 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-accent)',
              fontWeight: 600,
            }}
          >
            How it works
          </span>
          <h2 className="font-serif" style={{ fontSize: '1.85rem', marginTop: '0.4rem' }}>
            A quiet ritual for two.
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {steps.map((step) => (
            <div
              key={step.num}
              className="surface-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.75rem',
                  color: 'var(--color-accent)',
                  fontWeight: 500,
                }}
              >
                {step.num}
              </span>
              <h3 className="font-serif" style={{ fontSize: '1.2rem' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

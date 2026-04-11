import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'ReplyPro — AI odgovori za agente nekretnina'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0a1f1a 0%, #0d2b22 50%, #0a1f1a 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(22,163,122,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(22,163,122,0.06) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Glow orb top-left */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            left: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(22,163,122,0.18) 0%, transparent 70%)',
          }}
        />

        {/* Glow orb bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-60px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(22,163,122,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '32px',
          }}
        >
          {/* Icon mark */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #16a37a, #0d7a5c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 32px rgba(22,163,122,0.5)',
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                fill="white"
              />
            </svg>
          </div>
          <span
            style={{
              fontSize: '42px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-1px',
            }}
          >
            ReplyPro
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '52px',
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.15,
            maxWidth: '860px',
            marginBottom: '16px',
            letterSpacing: '-1.5px',
          }}
        >
          Odgovarajte klijentima{' '}
          <span style={{ color: '#16a37a' }}>za 5 sekundi</span>
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: '22px',
            color: 'rgba(255,255,255,0.55)',
            marginBottom: '44px',
            textAlign: 'center',
          }}
        >
          AI asistent za agente nekretnina · 10 besplatnih generacija
        </div>

        {/* Tone badges */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'Profesionalno', bg: 'rgba(59,130,246,0.2)', border: 'rgba(59,130,246,0.5)', color: '#93c5fd' },
            { label: 'Prijateljski', bg: 'rgba(34,197,94,0.2)', border: 'rgba(34,197,94,0.5)', color: '#86efac' },
            { label: 'Direktno', bg: 'rgba(251,191,36,0.2)', border: 'rgba(251,191,36,0.5)', color: '#fde68a' },
          ].map((badge) => (
            <div
              key={badge.label}
              style={{
                padding: '10px 24px',
                borderRadius: '999px',
                background: badge.bg,
                border: `1.5px solid ${badge.border}`,
                color: badge.color,
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              {badge.label}
            </div>
          ))}
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: 'absolute',
            bottom: '28px',
            right: '40px',
            fontSize: '16px',
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.5px',
          }}
        >
          replypro.hr
        </div>
      </div>
    ),
    { ...size }
  )
}

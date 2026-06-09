function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 2l9 5-9 5V2Z" fill="currentColor"/>
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1.5 7.5L8 1.5l6.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.5 6v7a.5.5 0 0 0 .5.5h2.5v-3.5h3V13.5H12a.5.5 0 0 0 .5-.5V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SoundOnIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path d="M2.5 6h2L8 3v11l-3.5-2.5H2.5A.5.5 0 0 1 2 11V7a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M11 5.5a3.5 3.5 0 0 1 0 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M12.5 7.5a1.5 1.5 0 0 1 0 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path d="M2.5 6h2L8 3v11l-3.5-2.5H2.5A.5.5 0 0 1 2 11V7a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M11 6.5l4 4M15 6.5l-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

export default function PauseModal({ onResume, onGoHome, muted, onToggleMute }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 150,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 28px',
      background: 'rgba(4,0,14,0.78)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      animation: 'nukko-fade-in 0.18s ease-out',
    }}>
      <div style={{
        width: '100%', maxWidth: 340,
        background: 'linear-gradient(160deg, #1a0b32 0%, #0f0520 100%)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 24,
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(123,47,255,0.15)',
        animation: 'nukko-score-pop 0.22s cubic-bezier(.22,1,.36,1)',
        overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '28px 24px 20px', gap: 6,
        }}>
          {/* Icon */}
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: 'rgba(123,47,255,0.15)',
            border: '1px solid rgba(123,47,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 4,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="3.5" y="2.5" width="4" height="13" rx="1.5" fill="rgba(167,139,255,0.9)"/>
              <rect x="10.5" y="2.5" width="4" height="13" rx="1.5" fill="rgba(167,139,255,0.9)"/>
            </svg>
          </div>
          <div style={{
            fontFamily: '"Nunito", system-ui', fontWeight: 900,
            fontSize: 22, color: '#fff', letterSpacing: '-0.01em',
          }}>
            Game Paused
          </div>
          <div style={{
            fontFamily: '"Nunito", system-ui', fontSize: 12,
            color: 'rgba(255,255,255,0.35)', letterSpacing: '0.03em',
          }}>
            Your progress is saved
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 20px' }} />

        {/* ── Actions ── */}
        <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Resume */}
          <button onClick={onResume} style={{
            width: '100%', height: 54, borderRadius: 14,
            background: 'linear-gradient(135deg, #7b2fff 0%, #00d4ff 100%)',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 16, color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(123,47,255,0.4)',
          }}>
            <PlayIcon />
            Resume
          </button>

          {/* Sound toggle */}
          <button onClick={onToggleMute} style={{
            width: '100%', height: 54, borderRadius: 14,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 16px',
            fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 15,
            color: muted ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)',
            cursor: 'pointer',
            transition: 'color 0.15s',
          }}>
            {/* Icon */}
            <span style={{ opacity: muted ? 0.4 : 0.9, flexShrink: 0 }}>
              {muted ? <SoundOffIcon /> : <SoundOnIcon />}
            </span>

            {/* Label */}
            <span style={{ flex: 1, textAlign: 'left' }}>
              Sound Effects
            </span>

            {/* Toggle pill */}
            <div style={{
              width: 44, height: 24, borderRadius: 12, flexShrink: 0,
              background: muted ? 'rgba(255,255,255,0.12)' : 'rgba(0,212,255,0.3)',
              border: `1.5px solid ${muted ? 'rgba(255,255,255,0.15)' : 'rgba(0,212,255,0.55)'}`,
              position: 'relative',
              transition: 'background 0.2s, border-color 0.2s',
            }}>
              <div style={{
                position: 'absolute',
                top: 3, left: muted ? 3 : 19,
                width: 16, height: 16, borderRadius: '50%',
                background: muted ? 'rgba(255,255,255,0.3)' : '#00d4ff',
                boxShadow: muted ? 'none' : '0 0 8px rgba(0,212,255,0.7)',
                transition: 'left 0.2s ease, background 0.2s',
              }} />
            </div>
          </button>

          {/* Back to Home */}
          <button onClick={onGoHome} style={{
            width: '100%', height: 54, borderRadius: 14,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 15,
            color: 'rgba(255,255,255,0.45)',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s',
          }}>
            <HomeIcon />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

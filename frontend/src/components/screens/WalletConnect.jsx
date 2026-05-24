import CosmicBackground from '../ui/CosmicBackground.jsx';
import NukkoMascot      from '../ui/NukkoMascot.jsx';
import NukkoWordmark    from '../ui/NukkoWordmark.jsx';

export default function WalletConnect({ onConnect, isMiniPay, error }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0015' }}>
      <CosmicBackground intensity="medium">
        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '60px 24px 36px', boxSizing: 'border-box',
        }}>
          {/* Logo + tagline */}
          <div style={{ textAlign: 'center' }}>
            <NukkoWordmark size={56} />
            <div style={{
              marginTop: 8, fontFamily: '"Nunito", system-ui', fontSize: 14,
              color: 'rgba(255,255,255,0.7)', letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}>Drop · Merge · Evolve</div>
          </div>

          {/* Mascot */}
          <NukkoMascot size={200} pose="idle" />

          {/* CTA */}
          <div style={{ width: '100%' }}>
            {!isMiniPay && (
              <button onClick={onConnect} style={{
                width: '100%', height: 56, borderRadius: 16,
                background: 'linear-gradient(135deg, #7b2fff 0%, #00d4ff 100%)',
                border: 'none', color: '#fff',
                fontFamily: '"Nunito", system-ui', fontWeight: 800,
                fontSize: 17, letterSpacing: '0.02em', cursor: 'pointer',
                boxShadow: '0 10px 30px -8px rgba(123,47,255,0.6), inset 0 1px 0 rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}>
                🔗 Connect Wallet
              </button>
            )}

            {isMiniPay && !error && (
              <div style={{
                textAlign: 'center', padding: '16px',
                color: 'rgba(255,255,255,0.7)',
                fontFamily: '"Nunito", system-ui', fontSize: 14,
              }}>
                Connecting your MiniPay wallet…
              </div>
            )}

            {error && (
              <div style={{
                textAlign: 'center', marginBottom: 12,
                color: '#ff6b8a',
                fontFamily: '"Nunito", system-ui', fontSize: 14,
              }}>{error}</div>
            )}

            <div style={{
              textAlign: 'center', marginTop: 14,
              fontFamily: '"Nunito", system-ui', fontSize: 12,
              color: 'rgba(255,255,255,0.4)',
            }}>
              Powered by MiniPay · Celo
            </div>
          </div>
        </div>
      </CosmicBackground>
    </div>
  );
}

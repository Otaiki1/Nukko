const LABELS = ['Orbit', 'Galaxy', 'Supernova'];

export default function TimerPackages({ packages, onPurchase, loading, selectedToken, onSelectToken }) {
  return (
    <div>
      {/* Token selector — minimal, secondary */}
      {onSelectToken && (
        <div style={{
          display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8,
        }}>
          {['cUSD', 'USDC', 'USDT'].map((key) => (
            <button
              key={key}
              onClick={() => onSelectToken(key)}
              disabled={loading}
              style={{
                padding: '3px 10px', borderRadius: 99,
                background: selectedToken === key ? 'rgba(0,212,255,0.15)' : 'transparent',
                border: `1px solid ${selectedToken === key ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.15)'}`,
                color: selectedToken === key ? '#00d4ff' : 'rgba(255,255,255,0.45)',
                fontFamily: '"Nunito", system-ui', fontSize: 11, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all .15s ease',
              }}
            >
              {key}
            </button>
          ))}
        </div>
      )}

      {/* Boost buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        {packages.map((pkg, i) => {
          const isHighlight = i === 1;
          return (
            <button
              key={i}
              onClick={() => onPurchase(i)}
              disabled={loading}
              style={{
                flex: 1, padding: '10px 6px',
                background: isHighlight
                  ? 'linear-gradient(135deg, rgba(123,47,255,0.5), rgba(0,212,255,0.4))'
                  : 'rgba(255,255,255,0.06)',
                border: `1px solid ${isHighlight ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 14,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                minHeight: 60,
                transition: 'opacity .15s ease',
              }}
            >
              <div style={{
                fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: 18,
                color: '#fff', lineHeight: 1,
              }}>
                +{pkg.seconds}s
              </div>
              <div style={{
                fontFamily: '"Nunito", system-ui', fontSize: 10,
                color: 'rgba(255,255,255,0.6)', fontWeight: 600,
              }}>
                {LABELS[i] ?? ''}
              </div>
              <div style={{
                fontFamily: '"Nunito", system-ui', fontSize: 11,
                color: 'rgba(255,255,255,0.5)',
              }}>
                {pkg.priceUSD} {selectedToken ?? 'cUSD'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

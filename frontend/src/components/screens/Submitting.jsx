import CosmicBackground from '../ui/CosmicBackground.jsx';
import NukkoMascot      from '../ui/NukkoMascot.jsx';

export default function Submitting({ score }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0015' }}>
      <CosmicBackground intensity="medium">
        <div style={{
          position: 'relative', height: '100%', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Ripple rings */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                position: 'absolute',
                left: '50%', top: '50%',
                width: 160 + i * 40, height: 160 + i * 40,
                transform: 'translate(-50%,-50%)',
                borderRadius: '50%',
                border: '1px solid rgba(0,212,255,0.4)',
                animation: `nukko-ripple 2s ease-out ${i * 0.4}s infinite`,
              }} />
            ))}
            <NukkoMascot size={140} pose="thinking" />
          </div>

          <div style={{
            marginTop: 70, fontFamily: '"Fredoka", "Nunito", sans-serif',
            fontWeight: 500, fontSize: 22, color: '#fff', textAlign: 'center',
            maxWidth: 280,
          }}>
            Logging your score<br />to the stars…
          </div>

          <div style={{
            marginTop: 12, fontFamily: '"Nunito", system-ui', fontSize: 13,
            color: 'rgba(255,255,255,0.5)', textAlign: 'center',
          }}>
            Beaming data across the cosmos
          </div>

          {score > 0 && (
            <div style={{
              marginTop: 24, fontFamily: '"Space Mono", monospace',
              fontWeight: 700, fontSize: 36, color: '#ffd700',
              letterSpacing: '-0.03em',
            }}>
              {Number(score).toLocaleString()}
            </div>
          )}
        </div>
      </CosmicBackground>
    </div>
  );
}

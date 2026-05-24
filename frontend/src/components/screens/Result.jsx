import { useMemo } from 'react';
import CosmicBackground from '../ui/CosmicBackground.jsx';
import Planet           from '../ui/Planet.jsx';
import Leaderboard      from '../ui/Leaderboard.jsx';
import { PLANET_DATA }  from '../ui/Planet.jsx';

function Confetti() {
  const items = useMemo(() => Array.from({ length: 24 }, (_, i) => ({
    x: 10 + Math.random() * 80,
    color: ['#ffd700', '#7b2fff', '#00d4ff', '#ff6b8a'][i % 4],
    delay: Math.random() * 0.4,
    dur: 2.5 + Math.random() * 1.5,
    size: 4 + Math.random() * 4,
  })), []);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {items.map((it, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${it.x}%`, top: '-20px',
          width: it.size, height: it.size, borderRadius: 1,
          background: it.color,
          animation: `nukko-confetti ${it.dur}s ease-in ${it.delay}s forwards`,
        }} />
      ))}
    </div>
  );
}

function stageFromScore(score) {
  if (!score || score < 100)  return 2;
  if (score < 500)   return 3;
  if (score < 2000)  return 5;
  if (score < 5000)  return 7;
  if (score < 10000) return 9;
  if (score < 20000) return 11;
  if (score < 50000) return 12;
  return 13;
}

export default function Result({
  score,
  personalBest,
  isNewRecord,
  rank,
  leaderboard,
  leaderboardLoading,
  onPlayAgain,
}) {
  const highestStage = stageFromScore(score);
  const planet = PLANET_DATA[highestStage - 1];

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0015' }}>
      <CosmicBackground intensity="medium">
        {isNewRecord && <Confetti />}

        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column',
          padding: '32px 20px 20px', boxSizing: 'border-box', overflow: 'auto',
        }}>
          {/* Score headline */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: '"Nunito", system-ui', fontSize: 12, letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
            }}>Your Score</div>

            <div style={{
              marginTop: 6, fontFamily: '"Space Mono", monospace',
              fontWeight: 700, fontSize: 56, lineHeight: 1,
              background: 'linear-gradient(135deg, #fff, #ffd700 60%, #ff6b8a)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {Number(score).toLocaleString()}
            </div>

            {isNewRecord && (
              <div style={{
                display: 'inline-flex', marginTop: 10, alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 99,
                background: 'linear-gradient(90deg, rgba(255,215,0,0.25), rgba(255,107,138,0.25))',
                border: '1px solid rgba(255,215,0,0.4)',
                fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 13, color: '#ffd700',
              }}>
                ✦ New Personal Best!
              </div>
            )}

            {rank && (
              <div style={{
                marginTop: 14, fontFamily: '"Nunito", system-ui', fontSize: 14,
                color: 'rgba(255,255,255,0.7)',
              }}>
                You ranked{' '}
                <span style={{ color: '#fff', fontWeight: 800 }}>#{rank}</span>
                {' '}in the cosmos
              </div>
            )}
          </div>

          {/* Highest planet card */}
          <div style={{
            marginTop: 20, borderRadius: 20, padding: '18px 16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 72, height: 72, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Planet stage={highestStage} size={60} glow />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: '"Nunito", system-ui', fontSize: 11,
                color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.15em',
              }}>You reached</div>
              <div style={{
                marginTop: 2, fontFamily: '"Fredoka", "Nunito", sans-serif',
                fontWeight: 600, fontSize: 22, color: '#fff',
              }}>{planet.name}</div>
              <div style={{
                marginTop: 4, fontFamily: '"Nunito", system-ui', fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
              }}>Stage {highestStage} of 14</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                fontFamily: '"Space Mono", monospace', fontWeight: 700,
                fontSize: 18, color: 'rgba(255,255,255,0.5)',
                fontVariantNumeric: 'tabular-nums',
              }}>{Number(personalBest).toLocaleString()}</div>
              <div style={{
                fontFamily: '"Nunito", system-ui', fontSize: 11,
                color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>Best</div>
            </div>
          </div>

          {/* Mini leaderboard */}
          {leaderboard.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Leaderboard
                entries={leaderboard.slice(0, 5)}
                loading={leaderboardLoading}
              />
            </div>
          )}

          <div style={{ flex: 1, minHeight: 16 }} />

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
            <button onClick={onPlayAgain} style={{
              width: '100%', height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #7b2fff 0%, #00d4ff 100%)',
              border: 'none', color: '#fff',
              fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 17,
              cursor: 'pointer',
              boxShadow: '0 10px 30px -8px rgba(123,47,255,0.6), inset 0 1px 0 rgba(255,255,255,0.25)',
            }}>
              Play Again
            </button>
          </div>
        </div>
      </CosmicBackground>
    </div>
  );
}

import CosmicBackground from '../ui/CosmicBackground.jsx';
import Planet           from '../ui/Planet.jsx';
import Leaderboard      from '../ui/Leaderboard.jsx';

function stageFromScore(score) {
  if (!score || score < 100)  return 2;
  if (score < 500)   return 3;
  if (score < 2000)  return 4;
  if (score < 5000)  return 6;
  if (score < 10000) return 8;
  if (score < 20000) return 10;
  if (score < 50000) return 12;
  return 13;
}

export default function Home({ profile, leaderboard, leaderboardLoading, onStartGame }) {
  const username = profile?.username || 'Anonymous';
  const best     = profile?.personalBest ?? 0;
  const games    = profile?.gamesPlayed  ?? 0;
  const stage    = stageFromScore(best);
  const addr     = profile?.address ?? '';
  const shortAddr = addr ? `${addr.slice(0, 6)}····` : '';

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0015' }}>
      <CosmicBackground intensity="medium">
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

          {/* Top chrome */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 20px 8px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: 99,
              fontFamily: '"Nunito", system-ui', fontSize: 13, color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: 99, background: '#00e676' }} />
              {username}
            </div>
            <div style={{
              fontFamily: '"Nunito", system-ui', fontSize: 11,
              color: 'rgba(255,255,255,0.35)',
            }}>
              {shortAddr}
            </div>
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 16px' }}>

            {/* Player card */}
            <div style={{
              borderRadius: 24, padding: '20px',
              background: 'linear-gradient(140deg, rgba(123,47,255,0.35) 0%, rgba(0,212,255,0.18) 100%)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', gap: 16,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 99, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <Planet stage={stage} size={48} glow />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: '"Fredoka", "Nunito", sans-serif', fontWeight: 600,
                  fontSize: 20, color: '#fff', lineHeight: 1.2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{username}</div>
                <div style={{
                  marginTop: 4, fontFamily: '"Nunito", system-ui', fontSize: 12,
                  color: 'rgba(255,255,255,0.55)',
                }}>{shortAddr} · {games} games played</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontFamily: '"Space Mono", monospace', fontWeight: 700,
                  fontSize: 22, color: '#ffd700', letterSpacing: '-0.02em',
                  fontVariantNumeric: 'tabular-nums',
                }}>{best.toLocaleString()}</div>
                <div style={{
                  fontFamily: '"Nunito", system-ui', fontSize: 11,
                  color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>Best</div>
              </div>
            </div>

            {/* Leaderboard heading */}
            <div style={{
              marginTop: 24, marginBottom: 12,
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            }}>
              <div style={{
                fontFamily: '"Fredoka", "Nunito", sans-serif', fontWeight: 600,
                fontSize: 18, color: '#fff',
              }}>Cosmic Leaderboard</div>
              <div style={{
                fontFamily: '"Nunito", system-ui', fontSize: 11, color: 'rgba(255,255,255,0.4)',
              }}>updates 30s</div>
            </div>

            <Leaderboard
              entries={leaderboard}
              loading={leaderboardLoading}
              myUsername={username}
            />
          </div>

          {/* Sticky bottom CTA */}
          <div style={{
            padding: '12px 16px 20px',
            background: 'linear-gradient(to top, rgba(10,0,21,0.95) 50%, rgba(10,0,21,0))',
          }}>
            <button onClick={onStartGame} style={{
              width: '100%', height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #7b2fff 0%, #00d4ff 100%)',
              border: 'none', color: '#fff',
              fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 17,
              cursor: 'pointer',
              boxShadow: '0 10px 30px -8px rgba(123,47,255,0.6), inset 0 1px 0 rgba(255,255,255,0.25)',
            }}>
              Start Game
            </button>
            <div style={{
              textAlign: 'center', marginTop: 8,
              fontFamily: '"Nunito", system-ui', fontSize: 12,
              color: 'rgba(255,255,255,0.45)',
            }}>
              Free to play · 90 seconds · Unlimited games
            </div>
          </div>

        </div>
      </CosmicBackground>
    </div>
  );
}

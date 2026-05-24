import Planet from './Planet.jsx';

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

function LeaderboardRow({ entry, divider, isMe }) {
  const medal = MEDALS[entry.rank];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      background: isMe
        ? 'linear-gradient(90deg, rgba(255,215,0,0.15), rgba(255,215,0,0.02))'
        : 'transparent',
      borderBottom: divider ? '1px solid rgba(255,255,255,0.05)' : 'none',
      position: 'relative',
    }}>
      {/* "me" left accent bar */}
      {isMe && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: '#ffd700', borderRadius: '0 2px 2px 0',
        }} />
      )}

      {/* Rank */}
      <div style={{
        width: 28, textAlign: 'center', flexShrink: 0,
        fontFamily: medal ? 'system-ui' : '"Space Mono", monospace',
        fontSize: medal ? 18 : 13, fontWeight: 700,
        color: isMe ? '#ffd700' : 'rgba(255,255,255,0.7)',
      }}>
        {medal ?? entry.rank}
      </div>

      {/* Planet avatar */}
      <Planet stage={Math.min(11, Math.max(1, Math.ceil(entry.rank * 0.8)))} size={22} />

      {/* Name */}
      <div style={{
        flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontFamily: '"Nunito", system-ui', fontSize: 14,
        fontWeight: isMe ? 700 : 500,
        color: isMe ? '#fff' : 'rgba(255,255,255,0.85)',
      }}>
        {entry.username}
      </div>

      {/* Score */}
      <div style={{
        fontFamily: '"Space Mono", monospace', fontVariantNumeric: 'tabular-nums',
        fontSize: 13, fontWeight: 700, color: isMe ? '#ffd700' : '#fff',
        flexShrink: 0,
      }}>
        {Number(entry.score).toLocaleString()}
      </div>

      {/* Date */}
      {entry.date && (
        <div style={{
          width: 40, textAlign: 'right', flexShrink: 0,
          fontFamily: '"Nunito", system-ui', fontSize: 11,
          color: 'rgba(255,255,255,0.4)',
        }}>
          {entry.date}
        </div>
      )}
    </div>
  );
}

export default function Leaderboard({ entries, loading, myUsername }) {
  if (loading && entries.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '20px',
        fontFamily: '"Nunito", system-ui', fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
      }}>
        Loading leaderboard…
      </div>
    );
  }
  if (entries.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '20px',
        fontFamily: '"Nunito", system-ui', fontSize: 13,
        color: 'rgba(255,255,255,0.4)',
      }}>
        No scores yet — be the first! 🪐
      </div>
    );
  }
  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      {entries.map((e, i) => (
        <LeaderboardRow
          key={e.rank}
          entry={e}
          divider={i < entries.length - 1}
          isMe={myUsername && e.username === myUsername}
        />
      ))}
    </div>
  );
}

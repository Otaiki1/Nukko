import { GOLD, FAINT, BODY, NUM } from '../../theme/tokens.js';
import { useTheme } from '../../theme/ThemeContext.jsx';

/**
 * The pictures a bulletin explains itself with.
 *
 * Each one replaces two or three paragraphs that nobody read. They are inline
 * SVG rather than components built from kit.jsx primitives because what makes
 * them fast to read is the SHAPE — a climb that rises, three pips and a fourth
 * set apart — and a stack of divs cannot draw that at this size.
 *
 * All of them are drawn on a 300-wide viewBox and scaled to the modal, so the
 * proportions hold at any width and nothing needs measuring at runtime.
 */

const VB_W = 300;
const RUNGS = 12;
const PAD   = 12;
const BAR_W = 17;
const GAP   = (VB_W - PAD * 2 - RUNGS * BAR_W) / (RUNGS - 1);

/** Cash rungs and what they pay. Mirrors CASH_LEVELS in server/ladder/levels.js. */
const CASH = { 4: '$4', 8: '$10', 12: '$16' };

const barX = (level) => PAD + (level - 1) * (BAR_W + GAP);

/**
 * The climb, as a climb.
 *
 * Bars rise left to right so the shape itself says "further costs more", and
 * the three that pay are the only gold in the frame — which is the whole
 * message of the ladder bulletin in one glance.
 *
 * @param {number} [here]  rung to mark as the player's own, if any
 */
export function LadderTrack({ here = null, height = 104 }) {
  const { theme } = useTheme();
  const BASE = 68;
  const MIN_H = 13, MAX_H = 46;
  const barH = (i) => MIN_H + (i / (RUNGS - 1)) * (MAX_H - MIN_H);

  return (
    <svg viewBox={`0 0 ${VB_W} ${height}`} width="100%" height={height}
         role="img" aria-label={`Twelve rungs, cash at levels 4, 8 and 12${here ? `. You are on level ${here}` : ''}`}
         style={{ display: 'block', overflow: 'visible' }}>
      {Array.from({ length: RUNGS }, (_, i) => {
        const level = i + 1;
        const h = barH(i);
        const x = barX(level);
        const y = BASE - h;
        const cash = CASH[level];
        const mine = level === here;

        return (
          <g key={level}>
            <rect
              x={x} y={y} width={BAR_W} height={h} rx={2.5}
              fill={mine ? theme.secondary : cash ? GOLD : 'rgba(190,170,225,0.17)'}
            />
            {/* The player's rung gets a caret above it — a fill change alone
                is not enough to find at a glance among eleven others. */}
            {mine && (
              <>
                <path d={`M${x + BAR_W / 2 - 5} ${y - 11} L${x + BAR_W / 2 + 5} ${y - 11} L${x + BAR_W / 2} ${y - 4} Z`}
                      fill={theme.secondary} />
                <text x={x + BAR_W / 2} y={y - 16} textAnchor="middle"
                      fontFamily={BODY} fontSize="8" fontWeight="800"
                      letterSpacing="0.14em" fill={theme.secondary}>
                  YOU
                </text>
              </>
            )}
            {cash && (
              <>
                <text x={x + BAR_W / 2} y={BASE + 15} textAnchor="middle"
                      fontFamily={NUM} fontSize="12" fontWeight="700" fill={GOLD}>
                  {cash}
                </text>
                <text x={x + BAR_W / 2} y={BASE + 27} textAnchor="middle"
                      fontFamily={BODY} fontSize="8" fontWeight="800"
                      letterSpacing="0.1em" fill={FAINT}>
                  {`LV${level}`}
                </text>
              </>
            )}
          </g>
        );
      })}
      {/* Ground line: without it the bars float and stop reading as a climb. */}
      <rect x={0} y={BASE + 1} width={VB_W} height={1} fill="rgba(190,170,225,0.16)" />
    </svg>
  );
}

/**
 * Three survivable breaches and a fourth that is not.
 *
 * The fourth pip is set apart by a gap on purpose — the rule is not "four
 * breaches", it is "three, then the next one is different", and the spacing
 * is what carries that without a sentence explaining it.
 */
export function BreachMeter({ height = 96 }) {
  const AMBER = '#ff8a3d';
  const RED   = '#ff5c5c';
  const r = 20;
  const cy = 30;
  const survivable = [42, 96, 150];
  const fatal = 244;

  return (
    <svg viewBox={`0 0 ${VB_W} ${height}`} width="100%" height={height}
         role="img" aria-label="Three breaches each halve your clock; the fourth ends the run"
         style={{ display: 'block' }}>
      {survivable.map((cx, i) => (
        <g key={cx}>
          <circle cx={cx} cy={cy} r={r} fill="rgba(255,138,61,0.12)" stroke={AMBER} strokeWidth="1.5" />
          <text x={cx} y={cy + 6} textAnchor="middle"
                fontFamily={NUM} fontSize="17" fontWeight="700" fill={AMBER}>½</text>
        </g>
      ))}

      {/* The break in the sequence. */}
      <path d={`M${survivable[2] + r + 10} ${cy} H${fatal - r - 10}`}
            stroke="rgba(190,170,225,0.2)" strokeWidth="1" strokeDasharray="2 3" />

      <circle cx={fatal} cy={cy} r={r} fill="rgba(255,92,92,0.14)" stroke={RED} strokeWidth="1.5" />
      <path d={`M${fatal - 7} ${cy - 7} L${fatal + 7} ${cy + 7} M${fatal + 7} ${cy - 7} L${fatal - 7} ${cy + 7}`}
            stroke={RED} strokeWidth="2.4" strokeLinecap="round" />

      <text x={survivable[1]} y={cy + r + 20} textAnchor="middle"
            fontFamily={BODY} fontSize="9" fontWeight="800"
            letterSpacing="0.14em" fill={AMBER}>
        HALF YOUR CLOCK
      </text>
      <text x={fatal} y={cy + r + 20} textAnchor="middle"
            fontFamily={BODY} fontSize="9" fontWeight="800"
            letterSpacing="0.14em" fill={RED}>
        RUN ENDS
      </text>
    </svg>
  );
}

/**
 * Rungs with people on them.
 *
 * Deliberately unlabelled: the counts in the app are live, and putting numbers
 * on an illustration would be inventing data. The shape — crowded at the
 * bottom, thinning toward the top — is the only claim being made, and it is
 * true of every ladder.
 */
export function StandingsRungs({ height = 96 }) {
  const { theme } = useTheme();
  const BASE = 74;
  const dots = [4, 4, 3, 3, 2, 2, 2, 1, 1, 1, 0, 0];

  return (
    <svg viewBox={`0 0 ${VB_W} ${height}`} width="100%" height={height}
         role="img" aria-label="Each rung shows how many players are standing on it"
         style={{ display: 'block' }}>
      {dots.map((n, i) => {
        const level = i + 1;
        const x = barX(level);
        const cash = CASH[level];
        return (
          <g key={level}>
            <rect x={x} y={BASE} width={BAR_W} height={5} rx={2}
                  fill={cash ? GOLD : 'rgba(190,170,225,0.2)'} />
            {Array.from({ length: n }, (_, d) => (
              <circle key={d} cx={x + BAR_W / 2} cy={BASE - 9 - d * 11} r={3.6}
                      fill={theme.secondary} opacity={0.85 - d * 0.13} />
            ))}
          </g>
        );
      })}
      <text x={PAD} y={BASE + 22} fontFamily={BODY} fontSize="8.5" fontWeight="800"
            letterSpacing="0.14em" fill={FAINT}>LV1</text>
      <text x={VB_W - PAD} y={BASE + 22} textAnchor="end"
            fontFamily={BODY} fontSize="8.5" fontWeight="800"
            letterSpacing="0.14em" fill={FAINT}>LV12</text>
    </svg>
  );
}

export const VISUAL_COMPONENTS = {
  ladder:    LadderTrack,
  rung:      LadderTrack,
  breaches:  BreachMeter,
  standings: StandingsRungs,
};

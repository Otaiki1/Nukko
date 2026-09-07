import { SparkleIcon, StarIcon, CashIcon } from './Icons.jsx';
import { Modal, ModalTitle, PrimaryButton, GhostButton, Rail } from './kit.jsx';
import {
  levelProgress, titleForLevel, nextTitleAfter, titleUnlocked,
} from '../../game/progression.js';
import { INK, DIM, FAINT, RULE, GOLD, BODY, NUM } from '../../theme/tokens.js';
import { useTheme } from '../../theme/ThemeContext.jsx';

/**
 * The rank-up announcement.
 *
 * Rank is the LOCAL progression track (game/progression.js) — it is not the
 * ladder. It grants no gameplay advantage by design, so this modal must not
 * imply a payout: everything it can offer is a name and a place to put it.
 * The one honest thing to say about rewards here is where the rewards
 * actually are, which is why the ladder gets a line and a button rather than
 * an invented prize.
 *
 * Kept separate from AnnouncementModal on purpose. News is a queue read on a
 * settled home screen; a rank-up belongs to the run that earned it and lives
 * and dies with the result screen.
 */

const num = (n) => Number(n ?? 0).toLocaleString('en-US');

/** The bar toward the next rank, using the xp the run actually finished on. */
function RankBar({ xp, accent }) {
  const rank = levelProgress(xp);
  const pct = Math.round(rank.pct * 100);

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 12, marginBottom: 6,
      }}>
        <span style={{
          fontFamily: BODY, fontSize: 9, fontWeight: 800, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: FAINT,
        }}>
          To rank {rank.level + 1}
        </span>
        <span style={{
          fontFamily: NUM, fontSize: 11, fontWeight: 700, color: DIM,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {num(rank.into)} / {num(rank.needed)} XP
        </span>
      </div>
      <div style={{
        height: 6, borderRadius: 3, overflow: 'hidden',
        background: 'rgba(255,255,255,0.07)',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 3,
          background: `linear-gradient(90deg, ${accent}, ${GOLD})`,
          transition: 'width 500ms ease',
        }} />
      </div>
    </div>
  );
}

/**
 * @param {object|null} summary  the finishRun summary; null hides the modal
 * @param {function} onClose
 * @param {function} [onOpenLadder]  optional — omitted for a guest with no ladder
 */
export default function RankUpModal({ summary, onClose, onOpenLadder }) {
  const { theme } = useTheme();
  if (!summary?.leveledUp) return null;

  const { newLevel, prevLevel, gainedXp, xpAfter } = summary;
  const title    = titleForLevel(newLevel);
  const isNewTitle = titleUnlocked(prevLevel ?? newLevel - 1, newLevel);
  const upcoming = nextTitleAfter(newLevel);
  // Several ranks can land on one run when a long session settles at once.
  const climbed  = Math.max(1, newLevel - (prevLevel ?? newLevel - 1));

  return (
    <Modal onClose={onClose} zIndex={260}>
      <div style={{ padding: '26px 22px 20px' }}>
        <div className="nk-motion" style={{
          display: 'flex', justifyContent: 'center', marginBottom: 14,
          animation: 'nk-breathe 3.2s ease-in-out infinite',
        }}>
          {isNewTitle ? <SparkleIcon size={38} color={GOLD} /> : <StarIcon size={36} color={GOLD} />}
        </div>

        <div style={{
          textAlign: 'center', fontFamily: BODY, fontSize: 9, fontWeight: 800,
          letterSpacing: '0.2em', textTransform: 'uppercase', color: theme.secondary,
          marginBottom: 7,
        }}>
          {climbed > 1 ? `${climbed} ranks up` : 'Rank up'}
        </div>

        {/* The title is the headline when it changed — that is the only thing
            a rank actually hands over. Otherwise the number leads. */}
        <ModalTitle>{isNewTitle ? title : `Rank ${newLevel}`}</ModalTitle>

        <div style={{
          marginTop: 5, textAlign: 'center',
          fontFamily: NUM, fontSize: 11, color: FAINT,
        }}>
          {isNewTitle ? `Rank ${newLevel} · new title` : title}
        </div>

        <RankBar xp={xpAfter} accent={theme.secondary} />

        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <div style={{
            fontFamily: BODY, fontSize: 9, fontWeight: 800, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: FAINT, marginBottom: 10,
          }}>
            This rank gives
          </div>

          <Rail accent={GOLD}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: BODY, fontSize: 12.5, fontWeight: 700, color: INK, lineHeight: 1.7,
            }}>
              <StarIcon size={13} color={GOLD} />
              <span>+{num(gainedXp)} XP this run</span>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: BODY, fontSize: 12.5, fontWeight: 700,
              color: isNewTitle ? GOLD : INK, lineHeight: 1.7,
            }}>
              <SparkleIcon size={13} color={isNewTitle ? GOLD : INK} />
              <span>
                {isNewTitle
                  ? `The title ${title}, on your home screen and profile`
                  : `${title} — held until rank ${upcoming?.level ?? newLevel}`}
              </span>
            </div>

            {upcoming && (
              <div style={{
                marginTop: 9, paddingTop: 9, borderTop: `1px solid ${RULE}`,
                fontFamily: BODY, fontSize: 11, lineHeight: 1.5, color: DIM,
              }}>
                Next title: <strong style={{ color: INK }}>{upcoming.title}</strong> at rank {upcoming.level}.
              </div>
            )}

            {/* Said plainly, and every time. A celebration that leaves the
                question open reads as a prize the player never received. */}
            <div style={{
              marginTop: upcoming ? 7 : 9,
              paddingTop: upcoming ? 0 : 9,
              borderTop: upcoming ? 'none' : `1px solid ${RULE}`,
              fontFamily: BODY, fontSize: 11, lineHeight: 1.5, color: DIM,
            }}>
              Rank is status only — it changes nothing in a run. Bombs, expands and
              cash come from the ladder.
            </div>
          </Rail>
        </div>

        <PrimaryButton onClick={onClose} height={48}>Nice</PrimaryButton>

        {onOpenLadder && (
          <div style={{ marginTop: 8 }}>
            <GhostButton onClick={onOpenLadder}>
              <CashIcon size={13} color={DIM} />
              Open the ladder
            </GhostButton>
          </div>
        )}
      </div>
    </Modal>
  );
}

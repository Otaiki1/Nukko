import { CashIcon, GiftIcon } from './Icons.jsx';
import { Modal, ModalTitle, PrimaryButton, GhostButton, Sheet } from './kit.jsx';
import { VISUAL_COMPONENTS } from './NewsGraphics.jsx';
import { INK, DIM, FAINT, RULE, GOLD, BODY, NUM } from '../../theme/tokens.js';
import { useTheme } from '../../theme/ThemeContext.jsx';

/**
 * The news modal.
 *
 * One announcement at a time. Static product news and the "you are on a new
 * rung" bulletin are the same shape by construction (see news/announcements.js),
 * so this renders one thing rather than branching on where the entry came from.
 *
 * The layout is fixed and short by design: chip, headline, one line, picture,
 * figures, reward strip, button. A bulletin that needs more than that is a
 * bulletin whose CTA should be doing the work instead.
 */

const ICONS = { cash: CashIcon, gift: GiftIcon };

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** The tag chip and dateline that make an entry read as a bulletin. */
function Dateline({ entry, accent }) {
  const date = formatDate(entry.date);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      marginBottom: 8, flexWrap: 'wrap',
    }}>
      <span style={{
        padding: '3px 8px', borderRadius: 99,
        border: `1px solid ${accent}55`, background: `${accent}14`,
        fontFamily: BODY, fontSize: 8.5, fontWeight: 800,
        letterSpacing: '0.18em', textTransform: 'uppercase', color: accent,
      }}>
        {entry.tag}
      </span>
      {date && (
        <span style={{ fontFamily: NUM, fontSize: 10, color: FAINT }}>{date}</span>
      )}
    </div>
  );
}

/**
 * The four targets, as four figures.
 *
 * This was a labelled table, which is read a row at a time. Four chips are
 * taken in as one shape, and the number is what a player is actually
 * checking — so the number is what gets the size.
 */
function StatRow({ stats }) {
  return (
    <div style={{
      display: 'flex', gap: 6, marginTop: 18,
      borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`,
      padding: '12px 0 11px',
    }}>
      {stats.map(({ value, label }, i) => (
        <div key={label} style={{
          flex: 1, minWidth: 0, textAlign: 'center',
          borderLeft: i === 0 ? 'none' : `1px solid ${RULE}`,
        }}>
          <div style={{
            fontFamily: NUM, fontWeight: 700, fontSize: 19, color: INK,
            letterSpacing: '-0.03em', lineHeight: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {value}
          </div>
          <div style={{
            marginTop: 5, fontFamily: BODY, fontSize: 8, fontWeight: 800,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: FAINT,
          }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * What the rung pays, on one line.
 *
 * Was a left-railed block of full sentences; the reward is two short facts
 * and reads faster side by side than stacked.
 */
function RewardStrip({ rewards, heading }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{
        fontFamily: BODY, fontSize: 8.5, fontWeight: 800, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: FAINT, marginBottom: 8, textAlign: 'center',
      }}>
        {heading}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        flexWrap: 'wrap', gap: 8,
      }}>
        {rewards.map(({ kind, text }) => {
          const Icon = ICONS[kind] ?? GiftIcon;
          const gold = kind === 'cash';
          return (
            <span key={text} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 11px', borderRadius: 99,
              background: gold ? `${GOLD}16` : 'rgba(190,170,225,0.07)',
              border: `1px solid ${gold ? `${GOLD}4d` : RULE}`,
              fontFamily: BODY, fontSize: 12, fontWeight: 800,
              color: gold ? GOLD : INK, whiteSpace: 'nowrap',
            }}>
              <Icon size={12} color={gold ? GOLD : INK} />
              {text}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** The body of an entry — shared by the modal and the archive. */
export function AnnouncementBody({ entry, accent }) {
  const Visual = VISUAL_COMPONENTS[entry.visual] ?? null;

  return (
    <>
      <Dateline entry={entry} accent={accent} />

      <ModalTitle>{entry.title}</ModalTitle>

      {entry.lede && (
        <div style={{
          marginTop: 7, textAlign: 'center',
          fontFamily: BODY, fontSize: 13, color: DIM, lineHeight: 1.5,
        }}>
          {entry.lede}
        </div>
      )}

      {/* The picture, doing the job the paragraphs used to do badly. */}
      {Visual && (
        <div style={{ marginTop: 18 }}>
          <Visual here={entry.kind === 'level' ? entry.level : null} />
        </div>
      )}

      {entry.stats?.length > 0 && <StatRow stats={entry.stats} />}

      {entry.rewards?.length > 0 && (
        <RewardStrip rewards={entry.rewards} heading={entry.rewardsHeading ?? 'What it gives'} />
      )}

      {/* The one caveat a bulletin is allowed. It is small and last because
          it qualifies the offer rather than making it — but it is never
          dropped, because the graphic above it is the thing it qualifies. */}
      {entry.note && (
        <div style={{
          marginTop: 14, textAlign: 'center',
          fontFamily: BODY, fontSize: 10.5, lineHeight: 1.5, color: FAINT,
        }}>
          {entry.note}
        </div>
      )}
    </>
  );
}

/**
 * @param {object}   entry       the announcement, or null for nothing queued
 * @param {number}   remaining   how many more are behind this one
 * @param {Function} onDismiss   mark read and advance
 * @param {Function} onAction    run the entry's CTA (and dismiss)
 */
export default function AnnouncementModal({ entry, remaining = 0, onDismiss, onAction }) {
  const { theme } = useTheme();
  if (!entry) return null;

  const accent = entry.kind === 'level' ? GOLD : theme.secondary;
  const more   = Math.max(0, remaining);

  return (
    <Modal onClose={onDismiss} zIndex={280}>
      <div style={{ padding: '24px 22px 20px' }}>
        <AnnouncementBody entry={entry} accent={accent} />

        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <PrimaryButton onClick={onDismiss} height={48}>
            {more > 0 ? 'Next' : 'Got it'}
          </PrimaryButton>
          {entry.cta && onAction && (
            <GhostButton onClick={() => onAction(entry)} height={42}>
              {entry.cta.label}
            </GhostButton>
          )}
        </div>

        {more > 0 && (
          <div style={{
            marginTop: 10, textAlign: 'center',
            fontFamily: NUM, fontSize: 10, color: FAINT,
          }}>
            {more} more {more === 1 ? 'update' : 'updates'}
          </div>
        )}
      </div>
    </Modal>
  );
}

/** The archive — every bulletin, newest first, for re-reading at will. */
export function NewsSheet({ isOpen, entries = [], onClose, onAction }) {
  const { theme } = useTheme();
  if (!isOpen) return null;

  return (
    <Sheet title="What's new" subtitle="Nukko dispatches" onClose={onClose}>
      {entries.length === 0 && (
        <div style={{
          padding: '24px 0', textAlign: 'center',
          fontFamily: BODY, fontSize: 12, color: FAINT,
        }}>
          Nothing to report yet.
        </div>
      )}
      {entries.map((entry, i) => (
        <div key={entry.id} style={{
          paddingBottom: 20, marginBottom: 20,
          borderBottom: i === entries.length - 1 ? 'none' : `1px solid ${RULE}`,
        }}>
          <AnnouncementBody
            entry={entry}
            accent={entry.kind === 'level' ? GOLD : theme.secondary}
          />
          {entry.cta && onAction && (
            <div style={{ marginTop: 14 }}>
              <GhostButton onClick={() => onAction(entry)} height={40}>
                {entry.cta.label}
              </GhostButton>
            </div>
          )}
        </div>
      ))}
    </Sheet>
  );
}

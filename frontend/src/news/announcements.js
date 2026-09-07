/**
 * The news feed and the rules for who sees what.
 *
 * Everything here is pure — no React, no storage, no network — so the queue
 * logic can be unit-tested without standing up a wallet or a ladder sync.
 *
 * Two kinds of announcement flow through one queue:
 *
 *   STATIC   hand-written product news, authored in FEED below.
 *   LEVEL    generated from live ladder state when a player arrives on a
 *            rung, so it can name that rung's badge, objectives and rewards.
 *
 * Both carry the same shape, which is the point: the modal renders one thing
 * and the queue tracks one kind of id.
 */

// ── Entry shape ──────────────────────────────────────────────────────────────
//
//   id       stable; doubles as the seen-state key, so NEVER reuse or renumber
//   date     ISO day, for ordering and the dateline
//   tag      short uppercase chip — 'NEW', 'UPDATE', 'RULE CHANGE'
//   title    the headline — three or four words
//   lede     ONE short line. If it needs a second, it belongs in the ladder.
//   visual   which graphic carries the explanation: see VISUALS below
//   stats    optional compact figures — { value, label }, label one word
//   rewards  optional list of { kind: 'cash'|'gift', text } — short phrases
//   note     optional single-line caveat
//   cta      optional { label, action } — action is handled by the caller
//
// A level entry adds `level` and `maxLevel` so the track can mark the rung.
//
// THE RULE FOR THIS FILE: a bulletin is a signpost, not a rulebook. It has to
// land in about three seconds, which is roughly a headline, a picture and one
// line. Everything a player might want NEXT is one tap away behind the CTA,
// where the ladder explains itself properly and has the room to do it. Prose
// added here is prose nobody reads, and it pushes the button off the screen.

/** The graphics an entry can hang its explanation on. */
export const VISUALS = {
  LADDER:    'ladder',     // the 12-rung climb, cash marked at 4/8/12
  RUNG:      'rung',       // the same track with the player's rung marked
  BREACHES:  'breaches',   // three survivable strikes, then one that is not
  STANDINGS: 'standings',  // rungs with players on them
};

/**
 * Hand-written product news, oldest first.
 *
 * Dates are the day the change reached players, not the day it was written —
 * the dateline is the only thing telling a returning player whether they have
 * already lived through this.
 */
export const FEED = [
  {
    id: 'ladder-2026-09',
    date: '2026-09-01',
    tag: 'NEW',
    title: 'The Ladder is live',
    lede: '12 rungs. One week each. Cash on three of them.',
    visual: VISUALS.LADDER,
    // The one thing that cannot be left to the graphic: a fixed number of
    // links is funded per milestone each season and paid in clearing order
    // (MILESTONE_SLOTS, server/ladder/levels.js). Without this the chart
    // reads as "reach level 4, get $4" — a promise the ladder does not make.
    note: 'Limited links each season — first to clear, first paid.',
    cta: { label: 'Open the ladder', action: 'ladder' },
  },
  {
    id: 'collapse-three-strikes-2026-09',
    date: '2026-09-04',
    tag: 'RULE CHANGE',
    title: 'Three strikes',
    lede: 'The danger line no longer ends your run outright.',
    visual: VISUALS.BREACHES,
  },
  {
    id: 'ladder-standings-2026-09',
    date: '2026-09-06',
    tag: 'UPDATE',
    title: 'See who is where',
    lede: 'Every rung now carries a live head count.',
    visual: VISUALS.STANDINGS,
    cta: { label: 'Open the ladder', action: 'ladder' },
  },
];

export const LEVEL_PREFIX = 'level-';

/**
 * Fallback objective labels — the SHORT form, matching the `short` field the
 * server ships in OBJECTIVES. A chip has room for one word, and four one-word
 * chips are read at a glance where four labelled table rows are read line by
 * line. The server's own metadata still wins when it loads.
 */
const OBJECTIVE_LABELS = {
  runs:       'Runs',
  points:     'Points',
  activeDays: 'Days',
  shopItems:  'Shop',
};

/**
 * Figures for a chip: big enough to read across the room, short enough not to
 * wrap. Thousands collapse to K because "16K" and "16,000" say the same thing
 * and only one of them survives at 19px in a quarter-width chip.
 */
function figure(n) {
  const v = Number(n ?? 0);
  if (v >= 1000) {
    const k = v / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}K`;
  }
  return String(v);
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** The reward lines for a rung, in the order the ladder advertises them. */
function rewardLines(reward, { pays = true, cashSoldOut = false } = {}) {
  const out = [];
  if (reward?.bombs)   out.push({ kind: 'gift', text: `+${plural(reward.bombs, 'bomb')}` });
  if (reward?.expands) out.push({ kind: 'gift', text: `+${plural(reward.expands, 'expand')}` });
  // Cash is never folded in with the power-ups when it is gone or already
  // earned — advertising money this clear will not pay is a broken promise.
  if (reward?.cash && pays && !cashSoldOut) {
    out.push({ kind: 'cash', text: `$${reward.cash.amount} ${reward.cash.token}` });
  }
  return out;
}

/**
 * Build the announcement for the rung a player is standing on.
 *
 * Returns null when there is no ladder yet — the caller has nothing to show
 * until the first sync lands.
 *
 * @param {object} ladder         the ladder sync view
 * @param {Array}  objectiveMeta  server objective metadata, when loaded
 */
export function levelAnnouncement(ladder, objectiveMeta = null) {
  if (!ladder?.level) return null;

  const labels = new Map((objectiveMeta ?? []).map(o => [o.key, o.short ?? o.label]));
  const labelFor = (key) => labels.get(key) ?? OBJECTIVE_LABELS[key] ?? key;

  const pays    = ladder.currentCardPays !== false;
  const soldOut = Boolean(ladder.currentCardCashSoldOut);
  const rewards = rewardLines(ladder.reward, { pays, cashSoldOut: soldOut });
  const atMax   = ladder.level === ladder.maxLevel;

  // The rung track shows the position and the deadline is one line. The rules
  // this used to spell out — absolute targets, Monday's demotion — are on the
  // card the CTA opens, stated once and properly.
  let note = null;
  if (!pays)        note = 'Earned before — re-clearing restores rank, pays nothing.';
  else if (soldOut) note = 'This milestone’s cash is gone for the season.';

  return {
    id: `${LEVEL_PREFIX}${ladder.level}`,
    kind: 'level',
    level: ladder.level,
    maxLevel: ladder.maxLevel,
    date: (ladder.levelStartedAt ?? '').slice(0, 10) || null,
    tag: atMax ? 'TOP RUNG' : 'NEW LEVEL',
    title: ladder.badge,
    lede: atMax ? 'Clear it weekly to hold the top.' : 'Clear all four before Monday.',
    visual: VISUALS.RUNG,
    stats: (ladder.objectives ?? []).map(o => ({
      value: o.target === 0 ? '—' : figure(o.target),
      label: labelFor(o.key),
    })),
    rewards,
    rewardsHeading: rewards.some(r => r.kind === 'cash') ? 'Clearing this pays' : 'Clearing this gives',
    note,
    cta: { label: 'Open the ladder', action: 'ladder' },
  };
}

/** Parse the rung out of a level announcement id. Null for static news. */
export function levelFromId(id) {
  if (typeof id !== 'string' || !id.startsWith(LEVEL_PREFIX)) return null;
  const level = Number(id.slice(LEVEL_PREFIX.length));
  return Number.isInteger(level) && level > 0 ? level : null;
}

// ── Seen state ───────────────────────────────────────────────────────────────

export function emptySeen() {
  return {
    // Ids already dismissed, static and level alike.
    seen: [],
  };
}

/**
 * How many bulletins may interrupt a player at once.
 *
 * The cap is not about today's three entries — it is about the player who
 * comes back after a season away. Four modals is a read; twelve is a wall,
 * and a wall gets tapped through without being read at all. Anything older
 * than the cap is dropped as stale rather than held back, because news that
 * has been overtaken by four newer bulletins is no longer news.
 */
export const MAX_QUEUE = 4;

/**
 * Everything unread, oldest first, so a player reads forward in time.
 *
 * Deliberately uncapped and pure: the caller slices it to MAX_QUEUE and
 * retires whatever falls off the front. Nothing is suppressed on a player's
 * first look — the seeded bulletins are how a player finds out the ladder
 * pays at all, so hiding them from everyone who was already installed hides
 * the feature from every player there is.
 *
 * @param {object} opts
 * @param {object} opts.state          seen state for this wallet
 * @param {object} opts.ladder         ladder sync view, or null
 * @param {Array}  opts.objectiveMeta  server objective metadata, or null
 * @param {Array}  opts.feed           static feed (injectable for tests)
 */
export function pendingAnnouncements({ state = emptySeen(), ladder = null, objectiveMeta = null, feed = FEED } = {}) {
  const seen = new Set(state.seen ?? []);
  const out = feed
    .filter(e => !seen.has(e.id))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  // The rung the player is standing on, announced once. A player who has
  // held level 5 for three weeks gets nothing: they have already read it.
  const level = levelAnnouncement(ladder, objectiveMeta);
  if (level && !seen.has(level.id)) out.push(level);

  return out;
}

/**
 * Everything worth keeping in the archive: the static feed plus the rung the
 * player is on, newest first. Read state is not part of it — the archive is
 * for re-reading, so a dismissed entry has to stay there.
 */
export function archive({ ladder = null, objectiveMeta = null, feed = FEED } = {}) {
  const level = levelAnnouncement(ladder, objectiveMeta);
  return [...(level ? [level] : []), ...[...feed].sort((a, b) => String(b.date).localeCompare(String(a.date)))];
}

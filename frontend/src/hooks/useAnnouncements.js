import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  emptySeen, pendingAnnouncements, archive, MAX_QUEUE,
} from '../news/announcements.js';

/**
 * The news queue.
 *
 * Read state is localStorage, keyed per wallet, for the same reason the codex
 * is (see useProgress): it is cosmetic state with no economic value, so it
 * does not justify a table or a round trip. Two accounts on one device keep
 * separate read state — a shared one would mark a wallet's level
 * announcement read before it ever saw it.
 */

// v2: the first cut baselined every seeded bulletin to "read" before it could
// be shown, so any state written under the old key is a record of a decision
// that was wrong rather than of anything a player actually saw. Bumping the
// key retires it instead of trying to repair it.
const KEY_PREFIX = 'nk_news_v2_';

function storageKey(address) {
  return `${KEY_PREFIX}${address ? address.toLowerCase() : 'guest'}`;
}

function load(address) {
  try {
    const raw = localStorage.getItem(storageKey(address));
    if (!raw) return emptySeen();
    const parsed = JSON.parse(raw);
    return { ...emptySeen(), ...parsed, seen: Array.isArray(parsed.seen) ? parsed.seen : [] };
  } catch {
    return emptySeen();
  }
}

function save(address, state) {
  try {
    localStorage.setItem(storageKey(address), JSON.stringify(state));
  } catch { /* quota / private mode — read state is best-effort */ }
}

/**
 * @param {object} opts
 * @param {string} opts.address        connected wallet, or null for a guest
 * @param {object} opts.ladder         ladder sync view, or null until it lands
 * @param {Array}  opts.objectiveMeta  server objective metadata, or null
 * @param {boolean} opts.ready         gate the queue until the app is settled
 */
export function useAnnouncements({ address, ladder = null, objectiveMeta = null, ready = true } = {}) {
  const [state, setState] = useState(() => load(address));
  const [archiveOpen, setArchiveOpen] = useState(false);

  // Re-load on connect / disconnect / account switch.
  useEffect(() => { setState(load(address)); }, [address]);

  useEffect(() => { save(address, state); }, [address, state]);

  // Everything unread, oldest first. `ready` gates only whether the queue may
  // INTERRUPT — the archive and the unread dot read from `all`, so a player
  // can always go and find the news even while it is not allowed to pop.
  const all = useMemo(
    () => pendingAnnouncements({ state, ladder, objectiveMeta }),
    [state, ladder, objectiveMeta],
  );

  // Bulletins that fell off the front of the cap are retired unread: they have
  // been overtaken, and holding them back only delays the same wall.
  const stale = all.length > MAX_QUEUE ? all.slice(0, all.length - MAX_QUEUE) : [];
  const staleKey = stale.map(e => e.id).join(',');
  useEffect(() => {
    if (!staleKey) return;
    const ids = staleKey.split(',');
    setState(s => ({ ...s, seen: [...new Set([...s.seen, ...ids])] }));
  }, [staleKey]);

  const queue = useMemo(
    () => (ready ? all.slice(-MAX_QUEUE) : []),
    [ready, all],
  );

  const current = queue[0] ?? null;

  // Dismissing marks read and lets the next one through on the following
  // render — the modal is deliberately one-at-a-time rather than a stack.
  const dismiss = useCallback((id) => {
    if (!id) return;
    setState(s => (s.seen.includes(id) ? s : { ...s, seen: [...s.seen, id] }));
  }, []);

  const dismissCurrent = useCallback(() => dismiss(current?.id), [dismiss, current]);

  const entries = useMemo(
    () => archive({ ladder, objectiveMeta }),
    [ladder, objectiveMeta],
  );

  // The unread dot on the home footer. Counts everything unread, NOT the
  // interruptible queue — a bulletin held back by `ready` is still unread,
  // and the dot is the only way a player learns it is waiting.
  const unreadCount = Math.min(all.length, MAX_QUEUE);

  // Read through a ref so closing the archive does not need this as a
  // dependency — it changes on every ladder sync.
  //
  // `all`, not `queue`: the archive shows everything unread regardless of
  // whether it was allowed to interrupt, so leaving it has to clear all of it.
  const allRef = useRef(all);
  allRef.current = all;

  const openArchive = useCallback(() => setArchiveOpen(true), []);
  const closeArchive = useCallback(() => {
    setArchiveOpen(false);
    // Opening the archive IS reading the news: nothing that was waiting should
    // still interrupt the player after they have just been through it.
    const ids = allRef.current.map(e => e.id);
    if (ids.length) setState(s => ({ ...s, seen: [...new Set([...s.seen, ...ids])] }));
  }, []);

  return {
    current,
    queue,
    unreadCount,
    dismiss,
    dismissCurrent,
    entries,
    archiveOpen,
    openArchive,
    closeArchive,
  };
}

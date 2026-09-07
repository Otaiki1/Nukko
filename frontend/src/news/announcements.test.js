import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emptySeen, pendingAnnouncements, levelAnnouncement, levelFromId, archive, MAX_QUEUE,
  FEED as SHIPPED_FEED,
} from './announcements.js';

const FEED = [
  { id: 'b', date: '2026-02-01', tag: 'NEW',    title: 'Second' },
  { id: 'a', date: '2026-01-01', tag: 'UPDATE', title: 'First'  },
];

const ladderOn = (level, over = {}) => ({
  level,
  maxLevel: 12,
  badge: 'COMET CHASER',
  reward: { bombs: 3, expands: 0, cash: null },
  objectives: [
    { key: 'runs', target: 50 },
    { key: 'shopItems', target: 11 },
  ],
  currentCardPays: true,
  ...over,
});

// The bug this suite exists to prevent: the first cut marked every seeded
// bulletin read before it could be shown, so no player ever saw the news.
test('a player who has never read the news gets all of it, oldest first', () => {
  const ids = pendingAnnouncements({ state: emptySeen(), ladder: ladderOn(5), feed: FEED })
    .map(e => e.id);
  assert.deepEqual(ids, ['a', 'b', 'level-5']);
});

test('an existing player is not treated as having read anything', () => {
  // No baseline, no install date, no wallet age — nothing silently absorbs
  // the feed on first contact.
  const veteran = { seen: [] };
  assert.equal(pendingAnnouncements({ state: veteran, ladder: ladderOn(12), feed: FEED }).length, 3);
});

test('reading a bulletin retires it and nothing else', () => {
  const state = { seen: ['a'] };
  assert.deepEqual(
    pendingAnnouncements({ state, ladder: ladderOn(5), feed: FEED }).map(e => e.id),
    ['b', 'level-5'],
  );
});

test('climbing a rung queues that rung; standing still queues nothing', () => {
  const read = { seen: ['a', 'b', 'level-5'] };

  assert.deepEqual(
    pendingAnnouncements({ state: read, ladder: ladderOn(6), feed: FEED }).map(e => e.id),
    ['level-6'],
  );

  const caughtUp = { seen: [...read.seen, 'level-6'] };
  assert.deepEqual(pendingAnnouncements({ state: caughtUp, ladder: ladderOn(6), feed: FEED }), []);
});

test('the queue is returned uncapped and in order, for the caller to slice', () => {
  const many = Array.from({ length: MAX_QUEUE + 3 }, (_, i) => ({
    id: `n${i}`, date: `2026-01-0${i + 1}`, title: `News ${i}`,
  }));
  const ids = pendingAnnouncements({ state: emptySeen(), ladder: null, feed: many }).map(e => e.id);
  assert.equal(ids.length, MAX_QUEUE + 3);
  assert.deepEqual(ids, many.map(e => e.id));
  // The newest survive the caller's slice; the overtaken ones fall off.
  assert.deepEqual(ids.slice(-MAX_QUEUE), ids.slice(3));
});

test('a level bulletin carries the rung targets as one-word figures', () => {
  const entry = levelAnnouncement(ladderOn(5), [{ key: 'runs', short: 'Runs' }]);
  assert.equal(entry.id, 'level-5');
  assert.equal(entry.title, 'COMET CHASER');
  assert.equal(entry.visual, 'rung');
  assert.deepEqual(entry.stats, [
    { label: 'Runs', value: '50' },
    { label: 'Shop', value: '11' },   // falls back when the metadata is short
  ]);
  assert.deepEqual(entry.rewards, [{ kind: 'gift', text: '+3 bombs' }]);
});

test('thousands collapse so a figure never wraps its chip', () => {
  const entry = levelAnnouncement(ladderOn(5, {
    objectives: [{ key: 'points', target: 16000 }, { key: 'runs', target: 40 }],
  }));
  assert.deepEqual(entry.stats.map(s => s.value), ['16K', '40']);
});

// A bulletin is a signpost, not a rulebook: it must stay short enough to read
// before the button, with the detail one tap away behind the CTA.
test('no bulletin carries prose', () => {
  for (const entry of [...SHIPPED_FEED, levelAnnouncement(ladderOn(4))]) {
    assert.equal(entry.body, undefined, `${entry.id} still has a body`);
    assert.ok(entry.lede.length <= 60, `${entry.id} lede is ${entry.lede.length} chars`);
    assert.ok(entry.visual, `${entry.id} has no graphic to explain it`);
    if (entry.note) assert.ok(entry.note.length <= 70, `${entry.id} note is ${entry.note.length} chars`);
  }
});

test('cash is advertised only on a rung that will actually pay it', () => {
  const cash = { bombs: 0, expands: 2, cash: { amount: '4.00', token: 'USDT' } };

  const pays = levelAnnouncement(ladderOn(4, { reward: cash }));
  assert.deepEqual(pays.rewards.find(r => r.kind === 'cash'), { kind: 'cash', text: '$4.00 USDT' });
  assert.equal(pays.rewardsHeading, 'Clearing this pays');

  // Re-cleared after a demotion: the rung pays nothing, so it promises nothing.
  const reclear = levelAnnouncement(ladderOn(4, { reward: cash, currentCardPays: false }));
  assert.ok(!reclear.rewards.some(r => r.kind === 'cash'));
  assert.match(reclear.note, /pays nothing/);

  // The season's funded links are gone.
  const soldOut = levelAnnouncement(ladderOn(4, { reward: cash, currentCardCashSoldOut: true }));
  assert.ok(!soldOut.rewards.some(r => r.kind === 'cash'));
  assert.match(soldOut.note, /gone for the season/);
});

test('the top rung is framed as holding rank, not climbing', () => {
  const entry = levelAnnouncement(ladderOn(12));
  assert.equal(entry.tag, 'TOP RUNG');
  assert.match(entry.lede, /hold the top/);
});

test('levelFromId reads level ids and ignores static ones', () => {
  assert.equal(levelFromId('level-7'), 7);
  assert.equal(levelFromId('ladder-2026-09'), null);
  assert.equal(levelFromId(undefined), null);
});

test('the archive keeps read entries and leads with the current rung', () => {
  const entries = archive({ ladder: ladderOn(5), feed: FEED });
  assert.deepEqual(entries.map(e => e.id), ['level-5', 'b', 'a']);
});

test('no ladder yet means no level bulletin, but the news still flows', () => {
  assert.equal(levelAnnouncement(null), null);
  assert.deepEqual(
    pendingAnnouncements({ state: emptySeen(), ladder: null, feed: FEED }).map(e => e.id),
    ['a', 'b'],
  );
});

-- ============================================================
-- Nukko — mark a grant that arrived after the season's links ran out
--
-- TARGET: this game's GAMEPLAY Supabase project (SUPABASE_URL).
--
-- This lived as an APPEND to 003, which had already been applied. Re-running
-- an applied file is easy to skip, and skipping it took the whole ladder down
-- with "column ladder_grants.cash_unfunded_at does not exist" on every sync.
-- It is its own numbered file now, like every other change.
-- ============================================================

-- ─── An exhausted pool is not a debt ─────────────────────────
-- Cash is a fixed-slot race: a set number of funded links per milestone,
-- handed out in the order players clear the level. When they run out, the
-- next player gets nothing — the links were the whole offer.
--
-- Writing a pending grant for an admin to settle by hand would be a promise
-- nobody made, and would turn a fixed seasonal budget into an open one. So
-- "pool empty" is recorded here and cleared out of cash_pending, which stays
-- for genuine debts only: the rewards store unreachable, or a link drawn from
-- the pool but never delivered.
ALTER TABLE ladder_grants
  ADD COLUMN IF NOT EXISTS cash_unfunded_at TIMESTAMPTZ;

COMMENT ON COLUMN ladder_grants.cash_unfunded_at IS
  'Set when the milestone pool was exhausted at grant time. Not owed: the slots were the offer.';

-- ════════════════════════════════════════════════════════════════════════
-- FYB Hive — RESET the awards
--
-- ⚠ DESTRUCTIVE. This deletes every vote, every nominee and every category.
--   There is no undo. Run it only to start the award season over.
--
-- Run in the Supabase SQL editor, after every numbered migration has been applied.
--
-- Why it is safe to delete the categories outright: categories are no longer
-- created by hand. They are derived from `src/constants/award-standard.jsonrc`
-- and re-provisioned automatically the next time an admin opens the awards
-- dashboard — one row per documented award, in file order, unarchived. So this
-- does not leave you with an empty ballot to rebuild; it leaves you with the
-- standard's own list, fresh.
--
-- Provisioning is on the admin path rather than the public ballot, deliberately:
-- a page every member loads should not carry a write. That costs nothing here,
-- because this reset also closes voting, and only the dashboard can reopen it.
--
-- What it does NOT touch: registrations, profiles, pairings, consent tokens.
-- Only the four `fyb_award_*` tables and the two award settings flags.
-- ════════════════════════════════════════════════════════════════════════

-- ── Before ──────────────────────────────────────────────────────────────
-- Run this on its own first, so you know exactly what you are about to lose.
select
    (select count(*) from public.fyb_award_categories)        as categories,
    (select count(*) from public.fyb_award_candidates)        as nominees,
    (select count(*) from public.fyb_award_candidate_members) as group_members,
    (select count(*) from public.fyb_award_votes)             as votes;


-- ── The reset ───────────────────────────────────────────────────────────
-- One transaction: a half-applied reset would leave votes pointing at
-- nominees that no longer exist, which the tally views would happily count.
begin;

-- Deleting the categories alone would cascade through all three tables below.
-- They are spelled out anyway, deepest first: an explicit delete states the
-- intent, and it does not depend on every FK still carrying `on delete
-- cascade` in a database somebody has since edited by hand.
delete from public.fyb_award_votes;
delete from public.fyb_award_candidate_members;
delete from public.fyb_award_candidates;
delete from public.fyb_award_categories;

-- Voting closed and results sealed, so the fresh ballot cannot be live before
-- anybody has been screened onto it.
update public.fyb_settings
   set value = 'false'::jsonb,
       updated_at = now()
 where key in ('awards_enabled', 'awards_results_public');

commit;


-- ── After ───────────────────────────────────────────────────────────────
-- All four counts should be 0. The categories come back — one per award in
-- the jsonrc — the next time an admin opens the awards dashboard.
select
    (select count(*) from public.fyb_award_categories)        as categories,
    (select count(*) from public.fyb_award_candidates)        as nominees,
    (select count(*) from public.fyb_award_candidate_members) as group_members,
    (select count(*) from public.fyb_award_votes)             as votes;

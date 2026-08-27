-- ════════════════════════════════════════════════════════════════════════
-- FYB Hive — committee tie-breaks
-- Run in the Supabase SQL editor, after 007_awards-stats-migration.sql.
-- Idempotent; safe to re-run.
--
-- THE PROBLEM: `tallyCategory` refuses to crown anybody when two candidates
-- finish level, because picking whichever sorted first would be a lie the UI
-- then repeats confidently. That was the right call for a dashboard. It is the
-- wrong call for a hall with a screen and an envelope: an award has one winner,
-- and "it's a tie" is not something you can hand to two people at a podium.
--
-- THE RULE: a dead heat in the members' vote is broken by the awards committee
-- — every admin in `fyb_admins` gets one vote, and only among the candidates
-- who actually tied. Nobody who lost the members' vote can be promoted by it;
-- the committee chooses between people the room already put level, which is the
-- narrowest power that still produces one name.
--
-- WHAT THIS IS NOT: a veto. There is no way here to overturn a clear winner,
-- and there should never be one — the tie-break rows are keyed to a category
-- and counted only against candidates already tied at the top, so a committee
-- vote for anyone else counts for nothing.
-- ════════════════════════════════════════════════════════════════════════

-- ── One vote per admin per category ─────────────────────────────────────
-- `updated_at` matters here: an admin changing their mind is an update, not a
-- second row, so the count can never exceed the number of admins.
create table if not exists public.fyb_award_tiebreaks (
    id               uuid primary key default gen_random_uuid(),
    category_id      uuid not null references public.fyb_award_categories(id) on delete cascade,
    candidate_id     uuid not null references public.fyb_award_candidates(id) on delete cascade,
    admin_profile_id uuid not null references public.profiles(id),
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now(),
    unique (category_id, admin_profile_id)
);

create index if not exists fyb_award_tiebreaks_category_idx
    on public.fyb_award_tiebreaks (category_id);

drop trigger if exists fyb_award_tiebreaks_set_updated_at on public.fyb_award_tiebreaks;
create trigger fyb_award_tiebreaks_set_updated_at
    before update on public.fyb_award_tiebreaks
    for each row execute function public.set_updated_at();

-- ── Committee tally ─────────────────────────────────────────────────────
-- Counted in Postgres for the same reason every other tally here is: a REST
-- select is capped at 1000 rows, and a truncated count looks right.
create or replace view public.fyb_award_tiebreak_tally as
select
    category_id,
    candidate_id,
    count(*)::int as votes
from public.fyb_award_tiebreaks
group by category_id, candidate_id;

-- ── How many admins there are ───────────────────────────────────────────
-- The denominator behind "4 of 7 have voted". A view rather than a count in
-- the app so the number cannot drift from the table it describes.
create or replace view public.fyb_award_committee_size as
select count(*)::int as admins from public.fyb_admins;

-- ── RLS: enabled, no policies (service role bypasses) ───────────────────
alter table public.fyb_award_tiebreaks enable row level security;

-- ════════════════════════════════════════════════════════════════════════
-- Season markers: `awards_ran` and `pairing_ran`
--
-- A feature flag answers "can someone use this right now". A nav link answers
-- a different question — is there anything at that address worth opening — and
-- the two come apart the moment a season ends. Voting closes and the awards
-- link vanishes, taking the winners screen with it on the one night it
-- matters; pairing closes and the page that would tell somebody they've missed
-- the deadline becomes the one page they can no longer reach.
--
-- The app stamps these the first time each feature is switched on. Seeded here
-- from the data, so a season already underway is marked correctly today rather
-- than waiting for the next time an admin happens to save that screen.
-- ════════════════════════════════════════════════════════════════════════

insert into public.fyb_settings (key, value) values
    ('awards_ran',  'false'::jsonb),
    ('pairing_ran', 'false'::jsonb)
on conflict (key) do nothing;

-- Candidates standing, or voting currently open, means the season happened.
update public.fyb_settings
   set value = 'true'::jsonb
 where key = 'awards_ran'
   and (
        exists (select 1 from public.fyb_award_candidates)
     or coalesce((select value from public.fyb_settings where key = 'awards_enabled'), 'false'::jsonb) = 'true'::jsonb
   );

update public.fyb_settings
   set value = 'true'::jsonb
 where key = 'pairing_ran'
   and (
        exists (select 1 from public.fyb_pairings)
     or coalesce((select value from public.fyb_settings where key = 'pairing_enabled'), 'false'::jsonb) = 'true'::jsonb
   );

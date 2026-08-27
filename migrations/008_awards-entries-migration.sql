-- ════════════════════════════════════════════════════════════════════════
-- FYB Hive — award entry kinds (individual / clique / brand)
-- Run in the Supabase SQL editor, after 007_awards-stats-migration.sql.
-- Idempotent; safe to re-run.
--
-- SCOPE: this touches `fyb_award_candidates` and adds one join table. It does
-- NOT touch categories, votes, or any view — and deliberately adds nothing for
-- the award standard itself, which lives in `src/constants/award-standard.jsonrc`
-- and is bound to a category by its existing `slug`. There is no criteria
-- column here and there should never be one: criteria are reviewed and
-- deployed, not edited in a settings screen.
--
-- What changes and why:
--
--   Until now a candidacy was always a person: `registration_id` NOT NULL, and
--   the ballot card was their face. Two categories break that assumption —
--   Clique of the Year stands a group of friends, and Brand of the Year stands
--   a business. Neither is "a row in fyb_registrations", but both must still be
--   one votable entry with one share code.
--
--   So a candidacy becomes (kind, what it is called, who is behind it):
--     • individual — registration_id set, display_name null. Unchanged.
--     • clique     — display_name is the clique's name, members are the friends.
--     • brand      — display_name is the business, logo_url is its mark,
--                    members are the founder and co-founders.
-- ════════════════════════════════════════════════════════════════════════

-- ── Candidate shape ─────────────────────────────────────────────────────
alter table public.fyb_award_candidates
    add column if not exists entry_kind   text not null default 'individual',
    add column if not exists display_name text,
    -- A pasted, publicly reachable image URL. Brands arrive with a logo that
    -- already lives somewhere; making admin re-upload it would be busywork,
    -- and a logo needs no face detection the way a portrait does.
    add column if not exists logo_url     text;

-- Existing rows are all individuals, and the default above already said so.
-- Stated explicitly anyway: a re-run after a partial apply must not leave a
-- null kind behind, and `set not null` below would fail on one.
update public.fyb_award_candidates
   set entry_kind = 'individual'
 where entry_kind is null;

-- A clique and a brand have nobody in `registration_id`.
alter table public.fyb_award_candidates
    alter column registration_id drop not null;

do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'fyb_award_candidate_kind'
    ) then
        alter table public.fyb_award_candidates
            add constraint fyb_award_candidate_kind
            check (entry_kind in ('individual', 'clique', 'brand'));
    end if;

    -- The shape rule, in the database rather than only in the action: an
    -- individual is a person and nothing else, a group is a name and nothing
    -- else. Without this a bad write produces a candidate that renders as a
    -- blank card on a live ballot, and no application check survives a fix
    -- applied from the SQL editor at 11pm.
    if not exists (
        select 1 from pg_constraint where conname = 'fyb_award_candidate_identity'
    ) then
        alter table public.fyb_award_candidates
            add constraint fyb_award_candidate_identity
            check (
                (entry_kind = 'individual'
                    and registration_id is not null
                    and display_name is null)
                or
                (entry_kind in ('clique', 'brand')
                    and registration_id is null
                    and display_name is not null
                    and length(btrim(display_name)) > 0)
            );
    end if;
end
$$;

-- Two cliques called "The Upper Room" in one category would be indistinguishable
-- on the ballot. Nulls don't collide, so individuals are unaffected.
create unique index if not exists fyb_award_candidates_display_name_idx
    on public.fyb_award_candidates (category_id, lower(btrim(display_name)))
    where display_name is not null;

-- ── Who is behind a group entry ─────────────────────────────────────────
-- Every member is a registered finalist, so every member has a photo — which
-- is what lets a clique render as a mosaic of real faces rather than initials.
-- The FK enforces that; there is no free-text member name on purpose.
create table if not exists public.fyb_award_candidate_members (
    id              uuid primary key default gen_random_uuid(),
    candidate_id    uuid not null
        references public.fyb_award_candidates(id) on delete cascade,
    registration_id uuid not null
        references public.fyb_registrations(id) on delete cascade,
    -- 'founder' / 'co-founder' for a brand, null for a plain clique member.
    role            text,
    sort_order      integer not null default 0,
    created_at      timestamptz not null default now(),

    -- Nobody is in the same clique twice.
    constraint fyb_award_candidate_member_unique unique (candidate_id, registration_id)
);

create index if not exists fyb_award_candidate_members_candidate_idx
    on public.fyb_award_candidate_members (candidate_id, sort_order, created_at);

-- Answers "which cliques and brands is this person part of" in one index seek —
-- the read behind the one-win-per-person check.
create index if not exists fyb_award_candidate_members_registration_idx
    on public.fyb_award_candidate_members (registration_id);

alter table public.fyb_award_candidate_members enable row level security;

-- ── Check ───────────────────────────────────────────────────────────────
-- Should show every existing candidacy as 'individual' and zero members.
select entry_kind, count(*) as candidates
  from public.fyb_award_candidates
 group by entry_kind
 order by entry_kind;

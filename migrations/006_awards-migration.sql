-- ════════════════════════════════════════════════════════════════════════
-- FYB Hive — awards & voting
-- Run in the Supabase SQL editor, after 004_pairing-migration.sql. Idempotent;
-- safe to re-run.
--
-- Categories are curated by admin. Candidates are finalists who registered for
-- the dinner (`fyb_registrations`), added by email with a nickname that belongs
-- to that one category. Voters are anyone with a `profiles` row — any level —
-- and each of them gets exactly one vote per category, changeable until voting
-- closes.
-- ════════════════════════════════════════════════════════════════════════

-- ── Categories ──────────────────────────────────────────────────────────
-- `slug` exists so a category can be linked to and referred to in copy without
-- exposing a uuid. `sort_order` drives the vertical stack on the ballot.
create table if not exists public.fyb_award_categories (
    id          uuid primary key default gen_random_uuid(),
    slug        text not null unique,
    title       text not null,
    description text,
    sort_order  integer not null default 0,
    -- Archived categories keep their votes but leave the ballot. Deleting is
    -- also possible; archiving is what you want mid-poll.
    is_archived boolean not null default false,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index if not exists fyb_award_categories_order_idx
    on public.fyb_award_categories (is_archived, sort_order, created_at);

-- ── Candidates ──────────────────────────────────────────────────────────
-- A candidacy is (person, category, nickname). The nickname lives here rather
-- than on the registration because it is category flavour, not identity: the
-- same finalist can be "The Encourager" in one category and something else
-- entirely in the next.
create table if not exists public.fyb_award_candidates (
    id              uuid primary key default gen_random_uuid(),
    category_id     uuid not null
        references public.fyb_award_categories(id) on delete cascade,
    registration_id uuid not null
        references public.fyb_registrations(id) on delete cascade,
    nickname        text not null,
    sort_order      integer not null default 0,
    created_at      timestamptz not null default now(),

    -- Nobody stands twice in the same category.
    constraint fyb_award_candidate_unique unique (category_id, registration_id)
);

create index if not exists fyb_award_candidates_category_idx
    on public.fyb_award_candidates (category_id, sort_order, created_at);
create index if not exists fyb_award_candidates_registration_idx
    on public.fyb_award_candidates (registration_id);

-- ── Votes ───────────────────────────────────────────────────────────────
-- The unique constraint below IS the ballot rule. It is the conflict target
-- the vote upsert rides on, which makes "I changed my mind" and "I voted
-- twice" the same write — and only one of them can survive. Enforcing this in
-- application code instead would lose a double-submit race.
create table if not exists public.fyb_award_votes (
    id               uuid primary key default gen_random_uuid(),
    category_id      uuid not null
        references public.fyb_award_categories(id) on delete cascade,
    candidate_id     uuid not null
        references public.fyb_award_candidates(id) on delete cascade,
    -- The voter is a member profile, not a registration: you do not have to be
    -- a finalist, or registered for the dinner, to have a say in who wins.
    voter_profile_id uuid not null
        references public.profiles(id) on delete cascade,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now(),

    constraint fyb_award_one_vote_per_category unique (category_id, voter_profile_id)
);

create index if not exists fyb_award_votes_candidate_idx
    on public.fyb_award_votes (candidate_id);
create index if not exists fyb_award_votes_voter_idx
    on public.fyb_award_votes (voter_profile_id);

-- A vote must point at a candidate standing in the category it was cast in.
-- The FKs alone allow a mismatched pair, so this is checked by trigger.
create or replace function public.fyb_award_vote_category_guard()
returns trigger
language plpgsql
as $$
begin
    if not exists (
        select 1 from public.fyb_award_candidates c
        where c.id = new.candidate_id and c.category_id = new.category_id
    ) then
        raise exception 'candidate % is not standing in category %',
            new.candidate_id, new.category_id;
    end if;
    return new;
end;
$$;

drop trigger if exists fyb_award_votes_category_guard on public.fyb_award_votes;
create trigger fyb_award_votes_category_guard
    before insert or update on public.fyb_award_votes
    for each row execute function public.fyb_award_vote_category_guard();

-- ── updated_at triggers ─────────────────────────────────────────────────
drop trigger if exists fyb_award_categories_set_updated_at on public.fyb_award_categories;
create trigger fyb_award_categories_set_updated_at
    before update on public.fyb_award_categories
    for each row execute function public.set_updated_at();

drop trigger if exists fyb_award_votes_set_updated_at on public.fyb_award_votes;
create trigger fyb_award_votes_set_updated_at
    before update on public.fyb_award_votes
    for each row execute function public.set_updated_at();

-- ── Settings ────────────────────────────────────────────────────────────
-- Awards ship OFF, and results ship hidden. Admin opens voting when the
-- categories are populated, and publishes the tally when they are ready to —
-- typically on the night, not before.
insert into public.fyb_settings (key, value) values
    ('awards_enabled',        'false'::jsonb),
    ('awards_results_public', 'false'::jsonb)
on conflict (key) do nothing;

-- ── RLS: enabled, no policies (service role bypasses) ───────────────────
alter table public.fyb_award_categories enable row level security;
alter table public.fyb_award_candidates enable row level security;
alter table public.fyb_award_votes      enable row level security;

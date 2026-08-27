-- ════════════════════════════════════════════════════════════════════════
-- FYB Hive — awards stats + campaign links
-- Run after 006_awards-migration.sql. Idempotent; safe to re-run.
--
-- Two things here:
--
--   1. Aggregate views. The first cut of the stats page fetched every vote row
--      and counted them in JavaScript. Supabase caps a REST select at 1000 rows
--      by default (Settings → API → Max rows), so at 10 categories × a few
--      hundred voters the tally would have silently truncated and reported
--      confident, wrong numbers. Counting in Postgres returns a few dozen rows
--      instead of thousands, and cannot truncate.
--
--   2. `share_code` — the short, URL-safe id behind each candidate's campaign
--      link, so a candidate can be shared without exposing a uuid.
-- ════════════════════════════════════════════════════════════════════════

-- ── Per-candidate tally ─────────────────────────────────────────────────
-- LEFT joined so a candidate with no votes still appears as a zero rather than
-- vanishing — "nobody has voted for them yet" is a fact the stats page needs.
create or replace view public.fyb_award_tally as
select
    c.id          as candidate_id,
    c.category_id as category_id,
    count(v.id)::int as votes
from public.fyb_award_candidates c
left join public.fyb_award_votes v on v.candidate_id = c.id
group by c.id, c.category_id;

-- ── Per-category totals ─────────────────────────────────────────────────
-- votes_cast doubles as the voter count for a category: one vote per voter is
-- enforced by a unique index, so the two can never diverge.
create or replace view public.fyb_award_category_totals as
select
    cat.id           as category_id,
    count(v.id)::int as votes_cast
from public.fyb_award_categories cat
left join public.fyb_award_votes v on v.category_id = cat.id
group by cat.id;

-- ── Overall turnout ─────────────────────────────────────────────────────
create or replace view public.fyb_award_turnout as
select
    count(distinct voter_profile_id)::int as voters,
    count(*)::int                         as total_votes
from public.fyb_award_votes;

-- ── Who is actually turning out, by level ───────────────────────────────
-- Mirrors the app's rule: level = (sessionYear − entryYear + 1) × 100, 600+
-- reads as Alumni. Answers the question the organizers will ask on the night —
-- "is anyone below 400 level voting?"
create or replace view public.fyb_award_voter_levels as
select
    case
        when l.sy is null or coalesce(cs.entry_year, p.entry_year) is null then 'Unknown'
        when (l.sy - coalesce(cs.entry_year, p.entry_year) + 1) * 100 >= 600 then 'Alumni'
        when (l.sy - coalesce(cs.entry_year, p.entry_year) + 1) * 100 <= 0   then 'Unknown'
        else ((l.sy - coalesce(cs.entry_year, p.entry_year) + 1) * 100)::text || 'L'
    end                                   as level,
    count(distinct v.voter_profile_id)::int as voters
from public.fyb_award_votes v
join public.profiles p on p.id = v.voter_profile_id
left join public.class_sets cs on cs.id = p.class_set_id
left join lateral (
    select (split_part(t.session, '/', 1))::int as sy
    from public.tenures t where t.is_active limit 1
) l on true
group by 1;

-- ── Vote velocity ───────────────────────────────────────────────────────
-- Bucketed in Lagos time, not UTC: a vote cast at 11pm belongs to that night,
-- which is exactly the evening whose push the organizers are measuring.
create or replace view public.fyb_award_timeline as
select
    (created_at at time zone 'Africa/Lagos')::date as day,
    count(*)::int                                  as votes
from public.fyb_award_votes
group by 1
order by 1;

-- ── How far voters get down the ballot ──────────────────────────────────
-- With 10+ categories the interesting number is not how many voted, but how
-- many finished. This is the drop-off curve.
create or replace view public.fyb_award_completion as
select
    voted_categories,
    count(*)::int as voters
from (
    select voter_profile_id, count(*)::int as voted_categories
    from public.fyb_award_votes
    group by voter_profile_id
) per_voter
group by voted_categories
order by voted_categories;

-- ── These views carry the sealed tally. Nobody but the service role. ────
-- Views created by the `postgres` role are not covered by the base tables' RLS,
-- so without these revokes an anon key could read the standings straight out of
-- the API while the results are still meant to be hidden.
revoke all on public.fyb_award_tally            from anon, authenticated;
revoke all on public.fyb_award_category_totals  from anon, authenticated;
revoke all on public.fyb_award_turnout          from anon, authenticated;
revoke all on public.fyb_award_voter_levels     from anon, authenticated;
revoke all on public.fyb_award_timeline         from anon, authenticated;
revoke all on public.fyb_award_completion       from anon, authenticated;


-- ── Campaign share codes ────────────────────────────────────────────────
-- Six characters from the same lookalike-free alphabet the consent token uses
-- (no 0/O, no 1/I/L), because these get typed off a WhatsApp status by someone
-- squinting at a cracked screen. 31^6 ≈ 887M, and the unique index is the real
-- guarantee.
create or replace function public.fyb_share_code()
returns text
language plpgsql
as $$
declare
    alphabet text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    result   text := '';
    i        int;
begin
    for i in 1..6 loop
        result := result || substr(alphabet, 1 + floor(random() * 31)::int, 1);
    end loop;
    return result;
end;
$$;

alter table public.fyb_award_candidates
    add column if not exists share_code text;

-- Backfill anything that predates this column, one code per row.
update public.fyb_award_candidates
   set share_code = public.fyb_share_code()
 where share_code is null;

alter table public.fyb_award_candidates
    alter column share_code set default public.fyb_share_code();

create unique index if not exists fyb_award_candidates_share_code_idx
    on public.fyb_award_candidates (share_code);

alter table public.fyb_award_candidates
    alter column share_code set not null;

-- ════════════════════════════════════════════════════════════════════════
-- FYB Hive — table assignment, tightened
-- Run in the Supabase SQL editor, after 010_checkin-migration.sql.
-- Idempotent; safe to re-run.
--
-- 010 introduced `table_number` as a loose label that any number of pairs
-- could share. Three rules land here instead, and all three are enforced by
-- the database rather than by the gate app — several organizers work the door
-- at once on the night, so the last word has to belong to something that sees
-- all of them:
--
--   1. A table is UPPERCASE ALPHANUMERIC — 'A4', 'VIP2', '12'.
--   2. A table belongs to exactly ONE pair. Two couples sent to one table is
--      the failure this whole file exists to prevent.
--   3. Nobody is checked in without a table. The couple at the door has to be
--      told where to sit, and an admitted pair with no seat is a problem
--      discovered in the middle of the hall.
--
-- Rules 2 and 3 are the race-condition guards. Two gates assigning A4 at the
-- same instant, or one clearing a table while another admits that couple, both
-- end as a constraint error the app turns into a sentence — never as two
-- couples at one table, or a seatless guest inside.
-- ════════════════════════════════════════════════════════════════════════

-- ── Existing labels, brought to the new shape ───────────────────────────
-- 010 allowed spaces and mixed case, so 'a 4' may already be on a row. Strip
-- everything that is not alphanumeric and upper-case what remains; a label that
-- was nothing but punctuation becomes unassigned rather than an empty string.
update public.fyb_pair_intents
set table_number = nullif(
        upper(regexp_replace(table_number, '[^A-Za-z0-9]', '', 'g')),
        ''
    )
where table_number is not null
  and table_number <> nullif(upper(regexp_replace(table_number, '[^A-Za-z0-9]', '', 'g')), '');

-- ── Refuse to apply over a seating plan that already double-books ───────
-- Nulling the duplicates automatically would unseat couples nobody chose, on
-- the day it matters most. This stops instead and names the tables, so an
-- organizer decides who keeps A4 and re-runs.
do $$
declare
    clashes text;
begin
    select string_agg(table_number || ' (' || count || ' pairs)', ', ')
    into clashes
    from (
        select table_number, count(*) as count
        from public.fyb_pair_intents
        where table_number is not null
        group by table_number
        having count(*) > 1
    ) duplicated;

    if clashes is not null then
        raise exception
            'Tables assigned to more than one pair: %. Clear the duplicates in the admin, then run this migration again.',
            clashes;
    end if;
end $$;

-- ── Rule 1: the shape of a label ────────────────────────────────────────
-- Replaces the length-only check from 010.
alter table public.fyb_pair_intents
    drop constraint if exists fyb_pair_table_number_chk;

do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'fyb_pair_table_format_chk'
    ) then
        alter table public.fyb_pair_intents
            add constraint fyb_pair_table_format_chk
            check (table_number is null or table_number ~ '^[A-Z0-9]{1,12}$');
    end if;
end $$;

-- ── Rule 2: one pair per table ──────────────────────────────────────────
-- Partial, so any number of pairs may be unseated while the plan is drawn up.
-- This index is the whole answer to two gates typing A4 at once: the second
-- write fails, and the app tells that operator who is already on A4.
drop index if exists public.fyb_pair_table_number_idx;

create unique index if not exists fyb_pair_table_number_unique_idx
    on public.fyb_pair_intents (table_number)
    where table_number is not null;

-- ── Rule 3: no seat, no entry ───────────────────────────────────────────
-- Holds even when the two writes race: clearing a table under a checked-in
-- pair fails, and so does admitting a pair whose table was just cleared.
do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'fyb_pair_checkin_needs_table_chk'
    ) then
        alter table public.fyb_pair_intents
            add constraint fyb_pair_checkin_needs_table_chk
            check (checked_in_at is null or table_number is not null);
    end if;
end $$;

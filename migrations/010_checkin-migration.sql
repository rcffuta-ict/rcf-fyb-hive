-- ════════════════════════════════════════════════════════════════════════
-- FYB Hive — gate check-in
-- Run in the Supabase SQL editor, after 004_pairing-migration.sql.
-- Idempotent; safe to re-run.
--
-- An approved pairing already received its invitation email (see
-- `fyb_invitation` in 004). This adds the other end of that ticket: the moment
-- the two of them are actually admitted at the door.
--
-- Check-in lives on the intent rather than on a person because the invitation
-- says "no date, no entry" — the pair is what walks in, so the pair is what is
-- marked. One row, one arrival, no half-admitted couples.
--
-- The table number rides along for the same reason: a couple is seated
-- together, so seating is a property of the pair, not of two people who would
-- then have to be kept in step by hand.
-- ════════════════════════════════════════════════════════════════════════

alter table public.fyb_pair_intents
    add column if not exists checked_in_at timestamptz;
alter table public.fyb_pair_intents
    add column if not exists checked_in_by uuid references public.profiles(id);

-- The roster the gate page reads: approved pairs, arrived ones last-first.
create index if not exists fyb_pair_checked_in_idx
    on public.fyb_pair_intents (checked_in_at desc)
    where status = 'approved';

-- Only an approved pairing can be at the door. A cancelled or pending intent
-- carrying an arrival timestamp would mean somebody was let in without paying,
-- so the database refuses to hold that state at all.
do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'fyb_pair_checkin_approved_chk'
    ) then
        alter table public.fyb_pair_intents
            add constraint fyb_pair_checkin_approved_chk
            check (checked_in_at is null or status = 'approved');
    end if;
end $$;

-- ── Seating ─────────────────────────────────────────────────────────────
-- NOTE: superseded by 011_table-assignment-migration.sql, which makes a table
-- unique, uppercase-alphanumeric, and required before check-in. Kept as it ran.
-- Text, not an integer: rooms get laid out as "A4" and "VIP 2" as often as
-- "12", and a number would force the organizers to fight the schema on the
-- afternoon they are least able to. Deliberately NOT unique — a table seats
-- several couples — and nullable, since seating is assigned when the plan
-- exists, which may be after the pairing was approved.
alter table public.fyb_pair_intents
    add column if not exists table_number text;

do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'fyb_pair_table_number_chk'
    ) then
        alter table public.fyb_pair_intents
            add constraint fyb_pair_table_number_chk
            check (table_number is null or char_length(table_number) between 1 and 12);
    end if;
end $$;

-- "Who is on table 7" — the question asked from the floor, not the door.
create index if not exists fyb_pair_table_number_idx
    on public.fyb_pair_intents (table_number)
    where table_number is not null;

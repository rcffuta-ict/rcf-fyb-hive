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

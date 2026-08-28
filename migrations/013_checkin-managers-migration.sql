-- ════════════════════════════════════════════════════════════════════════
-- FYB Hive — check-in managers
-- Run in the Supabase SQL editor, after 012_table-label-spaces-migration.sql.
-- Idempotent; safe to re-run.
--
-- The registration team works the door, not the organizers. This is the list of
-- who may admit a couple — a role deliberately narrower than admin:
--
--   • a check-in manager admits couples that already have a table
--   • a check-in manager NEVER assigns or edits a table
--
-- Seating stays with the admins, so the plan cannot be rewritten at the door by
-- whoever is holding the phone. The split is enforced in the server actions:
-- `checkInPair` accepts a manager, `assignTableNumber` does not.
--
-- Attribution needs no new column. `checked_in_by` (migration 010) already
-- references `profiles`, and a manager is a profile like anyone else — so the
-- name against an arrival is whoever actually pressed the button.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.fyb_checkin_managers (
    id         uuid primary key default gen_random_uuid(),
    -- Same rule as `fyb_admins`: they must already exist in the member
    -- directory. Nobody is invented at the door.
    profile_id uuid not null unique references public.profiles(id) on delete cascade,
    -- Who added them, for the same audit reason arrivals carry a name.
    added_by   uuid references public.profiles(id),
    created_at timestamptz not null default now()
);

create index if not exists fyb_checkin_managers_created_idx
    on public.fyb_checkin_managers (created_at desc);

alter table public.fyb_checkin_managers enable row level security;

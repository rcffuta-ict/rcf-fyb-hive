-- ════════════════════════════════════════════════════════════════════════
-- FYB Hive — department → unit
-- Run in the Supabase SQL editor, after 002_consent-token-migration.sql.
--
-- This app cares about a member's RCF unit (Bible Study, Media, Choir…), not
-- their FUTA academic department. The column held the wrong thing entirely, so
-- this renames it and re-derives every value from actual unit membership.
-- ════════════════════════════════════════════════════════════════════════

-- ── Rename ──────────────────────────────────────────────────────────────
-- Guarded so re-running after a partial apply doesn't error.
do $$
begin
    if exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'fyb_registrations'
          and column_name = 'department'
    ) then
        alter table public.fyb_registrations rename column department to unit;
    end if;
end $$;

alter table public.fyb_registrations add column if not exists unit text;

-- ── Re-derive ───────────────────────────────────────────────────────────
-- Existing rows hold FUTA department names, which are meaningless here — clear
-- them rather than leaving wrong data that merely looks plausible.
update public.fyb_registrations set unit = null;

-- Backfill from unit membership in the active tenure. A member can serve in
-- several units; we take one deterministically (alphabetical) so re-running
-- this cannot shuffle values around. Matches getPrimaryUnitName() in
-- src/actions/registration.action.ts, which takes the first unit returned.
--
-- `u.type = 'UNIT'` is load-bearing: units.type is 'UNIT' | 'TEAM', and teams
-- are not units — a member on the Ushering team is not thereby in a unit.
update public.fyb_registrations r
set unit = u.name
from public.membership_units mu
join public.units u on u.id = mu.unit_id and u.type = 'UNIT'
join public.tenures t on t.id = mu.tenure_id and t.is_active
where mu.profile_id = r.profile_id
  and u.name = (
      select min(u2.name)
      from public.membership_units mu2
      join public.units u2 on u2.id = mu2.unit_id and u2.type = 'UNIT'
      join public.tenures t2 on t2.id = mu2.tenure_id and t2.is_active
      where mu2.profile_id = r.profile_id
  );

-- Sanity check — how many registrations still have no unit (members not
-- assigned to any unit in the active tenure). These show as "—" in admin.
-- select count(*) from public.fyb_registrations where unit is null;

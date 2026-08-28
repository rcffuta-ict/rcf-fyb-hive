-- ════════════════════════════════════════════════════════════════════════
-- FYB Hive — table labels with spaces
-- Run in the Supabase SQL editor, after 011_table-assignment-migration.sql.
-- Idempotent; safe to re-run.
--
-- 011 required labels to be a solid run of characters, so the seating plan the
-- organizers actually wrote — "VIP 1", "R 1", "T 1" — could not be typed as
-- written. A label is now allowed one space between runs.
--
-- Uniqueness moves with it, onto the label with its spaces removed: "VIP 1" and
-- "VIP1" are one table written two ways, and the whole point of the unique
-- index is that one table cannot hold two couples. Spelling must not be a way
-- around it.
-- ════════════════════════════════════════════════════════════════════════

-- ── Existing labels: tidy, but never merged ─────────────────────────────
-- 011 already stripped spacing out, so nothing here should change. It runs
-- anyway for a database that skipped straight to this file.
update public.fyb_pair_intents
set table_number = nullif(upper(btrim(regexp_replace(table_number, '\s+', ' ', 'g'))), '')
where table_number is not null
  and table_number <> nullif(upper(btrim(regexp_replace(table_number, '\s+', ' ', 'g'))), '');

-- ── Refuse to apply where two spellings already collide ─────────────────
-- Deciding that "VIP 1" and "VIP1" are the same table can unseat a couple, so
-- the migration names them and stops rather than picking a winner.
do $$
declare
    clashes text;
begin
    select string_agg(squashed || ' (' || count || ' pairs)', ', ')
    into clashes
    from (
        select replace(table_number, ' ', '') as squashed, count(*) as count
        from public.fyb_pair_intents
        where table_number is not null
        group by replace(table_number, ' ', '')
        having count(*) > 1
    ) duplicated;

    if clashes is not null then
        raise exception
            'These tables are held by more than one pair once spacing is ignored: %. Clear the duplicates in the admin, then run this migration again.',
            clashes;
    end if;
end $$;

-- ── The new shape: runs of letters and digits, single-spaced ────────────
alter table public.fyb_pair_intents
    drop constraint if exists fyb_pair_table_format_chk;

do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'fyb_pair_table_label_chk'
    ) then
        alter table public.fyb_pair_intents
            add constraint fyb_pair_table_label_chk
            check (
                table_number is null
                or (
                    table_number ~ '^[A-Z0-9]+( [A-Z0-9]+)*$'
                    and char_length(table_number) <= 14
                )
            );
    end if;
end $$;

-- ── One table, one pair — however it was spaced ─────────────────────────
-- `replace` is immutable, so it can carry a unique index.
drop index if exists public.fyb_pair_table_number_unique_idx;

create unique index if not exists fyb_pair_table_squashed_unique_idx
    on public.fyb_pair_intents (replace(table_number, ' ', ''))
    where table_number is not null;

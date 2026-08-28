# Database migrations

Every SQL file this project has ever needed, in the order it must be run.

These used to live in `.temp/`, which is gitignored — so the order existed only
in the file headers and in whoever last ran them. It is tracked now, and the
number in the filename is the order. Nothing here is applied automatically:
each file is pasted into the **Supabase SQL editor** and run by hand.

## Order

Run these top to bottom on a fresh database. Every one is idempotent — re-running
an already-applied migration is safe and does nothing.

| #   | File                              | What it adds                                              |
| --- | --------------------------------- | --------------------------------------------------------- |
| 001 | `001_fyb-migration.sql`           | Registrations, admins, the pairings table                  |
| 002 | `002_consent-token-migration.sql` | Consent tokens, email templates, the email outbox, `set_updated_at()` |
| 003 | `003_unit-migration.sql`          | Renames department → unit and re-derives every value       |
| 004 | `004_pairing-migration.sql`       | Pairing proper, plus the `fyb_settings` runtime flags      |
| 005 | `005_pairing-gender-guard.sql`    | The brother/sister rule, as a trigger                      |
| 006 | `006_awards-migration.sql`        | Categories, candidates, votes                              |
| 007 | `007_awards-stats-migration.sql`  | Tally views and `share_code` campaign links                |
| 008 | `008_awards-entries-migration.sql`| Entry kinds: individual / clique / brand                   |
| 009 | `009_awards-tiebreak-migration.sql` | Committee tie-breaks, and the `awards_ran` / `pairing_ran` season markers |
| 010 | `010_checkin-migration.sql`        | Gate check-in: when an approved pair was admitted, by whom, and their table |
| 011 | `011_table-assignment-migration.sql` | Tables become unique, uppercase alphanumeric, and required before check-in |
| 012 | `012_table-label-spaces-migration.sql` | Table labels may hold spaces ("VIP 1"); uniqueness ignores them |

`002` defines `set_updated_at()`, which several later files attach as a trigger.
It is the one dependency that is not obvious from the table names, so nothing
after it can be skipped.

## Not migrations

Kept apart because they are not part of the sequence and must never be run as
though they were.

- **`ops/`** — one-off operational scripts.
  - `email-cron.sql` — schedules the email-queue sweep. **Replace `<REF>` and
    `<SECRET>` before running**, and run it only after the edge function is
    deployed. Running it with the placeholders in place schedules a job that
    fails every five minutes.
  - `awards-reset.sql` — ⚠ **destructive**. Deletes every vote, nominee and
    category so an award season can be started over. No undo.
- **`seeds/`** — test data for a staging project or a Supabase branch.
  `test-members-seed.sql` writes to `profiles`, which is the *real* member
  directory shared with the ICT portal. Read its header before running it
  anywhere that matters.
- **`reference/schema.sql`** — a dump for reading, not for running. Its table
  order and constraints are not valid for execution; it exists so you can see
  the shape of the database without opening Supabase.

## Adding one

Take the next number, state the dependency in the header, and make it
idempotent — `create table if not exists`, `add column if not exists`, a `do $$`
guard around anything that would error on a second run. Someone will run it
twice; that should be boring when they do.

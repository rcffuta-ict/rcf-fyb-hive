-- ════════════════════════════════════════════════════════════════════════
-- FYB Hive — pairing
-- Run in the Supabase SQL editor, after 002_consent-token-migration.sql and
-- 003_unit-migration.sql. Idempotent; safe to re-run.
--
-- Two finalists redeem consent tokens against each other, or a finalist
-- registers an "associate" (someone outside the fellowship). Either creates a
-- pair intent. Payment — confirmed by an admin against the bank statement — is
-- what validates a pairing. There are no refunds, so the moment of approval is
-- the moment that must be airtight.
-- ════════════════════════════════════════════════════════════════════════

-- ── Replace the unused original table ───────────────────────────────────
-- `fyb_pairings` was defined in 001_fyb-migration.sql and never written to. Its
-- shape assumed one pairing per finalist and no concept of an intent, so it is
-- replaced rather than migrated.
drop table if exists public.fyb_pairings;

create table if not exists public.fyb_pair_intents (
    id            uuid primary key default gen_random_uuid(),
    -- Narration code the payer puts on the transfer, e.g. 'FYB PAIR PR7K2M'.
    code          text not null unique,
    kind          text not null check (kind in ('finalist', 'associate')),

    initiator_registration_id uuid not null
        references public.fyb_registrations(id) on delete cascade,
    partner_registration_id   uuid
        references public.fyb_registrations(id) on delete cascade,

    -- Associate fields (kind='associate'). No photo is collected — the UI shows
    -- a gender placeholder. Gender is derived as the opposite of the finalist's
    -- and never entered by hand.
    associate_name         text,
    associate_email        text,
    associate_phone        text,
    associate_gender       text check (associate_gender in ('male', 'female')),
    associate_relationship text,

    amount        integer not null,
    status        text not null default 'pending'
                  check (status in ('pending', 'approved', 'cancelled')),
    approved_at   timestamptz,
    approved_by   uuid references public.profiles(id),
    cancel_reason text,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),

    -- A finalist intent needs a partner registration; an associate intent needs
    -- the associate's details. Neither shape can be inserted incomplete.
    constraint fyb_pair_shape_chk check (
        (kind = 'finalist'
            and partner_registration_id is not null
            and associate_name is null)
        or
        (kind = 'associate'
            and partner_registration_id is null
            and associate_name is not null
            and associate_gender is not null)
    ),
    -- Nobody pairs with themselves.
    constraint fyb_pair_not_self_chk check (
        partner_registration_id is null
        or partner_registration_id <> initiator_registration_id
    )
);

-- ── The invariants that actually matter ─────────────────────────────────
-- Pending intents are deliberately NOT exclusive: several people may pair with
-- the same person, and whoever's payment is confirmed first wins. Approval is
-- the exclusive, irreversible step — so approval is what the database guards.
-- Losing a race here would mean two paid pairings for one person, which no
-- amount of application-level checking can safely prevent.
create unique index if not exists fyb_pair_approved_initiator_idx
    on public.fyb_pair_intents (initiator_registration_id)
    where status = 'approved';

create unique index if not exists fyb_pair_approved_partner_idx
    on public.fyb_pair_intents (partner_registration_id)
    where status = 'approved' and partner_registration_id is not null;

-- ── A pair is a pair, whichever way round it's entered ──────────────────
-- (A, B) and (B, A) are the same two people. Normalising the ids into
-- low/high generated columns lets a unique index enforce that, so the same two
-- finalists can never end up with two live intents — no matter who typed whose
-- token first, or how simultaneously.
--
-- Partial on live statuses only: once an intent is cancelled the pair is free
-- to try again.
alter table public.fyb_pair_intents
    add column if not exists pair_low uuid
        generated always as (least(initiator_registration_id, partner_registration_id)) stored;
alter table public.fyb_pair_intents
    add column if not exists pair_high uuid
        generated always as (greatest(initiator_registration_id, partner_registration_id)) stored;

create unique index if not exists fyb_pair_unique_live_idx
    on public.fyb_pair_intents (pair_low, pair_high)
    where kind = 'finalist' and status in ('pending', 'approved');

-- One live associate per finalist. This index *is* the associate lock: it takes
-- effect the moment the intent is submitted, which is what stops someone
-- holding an associate while entertaining finalist offers.
create unique index if not exists fyb_pair_active_associate_idx
    on public.fyb_pair_intents (initiator_registration_id)
    where kind = 'associate' and status in ('pending', 'approved');

-- Admin listing and per-registration status lookups.
create index if not exists fyb_pair_status_created_idx
    on public.fyb_pair_intents (status, created_at desc);
create index if not exists fyb_pair_initiator_idx
    on public.fyb_pair_intents (initiator_registration_id);
create index if not exists fyb_pair_partner_idx
    on public.fyb_pair_intents (partner_registration_id);

drop trigger if exists fyb_pair_intents_set_updated_at on public.fyb_pair_intents;
create trigger fyb_pair_intents_set_updated_at
    before update on public.fyb_pair_intents
    for each row execute function public.set_updated_at();

-- ── Runtime settings ────────────────────────────────────────────────────
-- site.config.json is baked in at build time, so an admin toggle cannot live
-- there. The DB is the authority; the JSON supplies defaults when a key is
-- absent, which keeps the app working before this migration is applied.
create table if not exists public.fyb_settings (
    key        text primary key,
    value      jsonb not null,
    updated_at timestamptz not null default now(),
    updated_by text
);

drop trigger if exists fyb_settings_set_updated_at on public.fyb_settings;
create trigger fyb_settings_set_updated_at
    before update on public.fyb_settings
    for each row execute function public.set_updated_at();

-- Pairing ships OFF. Admin flips it on when ready.
-- Bank details live here rather than site.config.json so the organizers can
-- correct an account number without a redeploy — this is where money goes, and
-- a typo baked into a bundle is the worst kind.
insert into public.fyb_settings (key, value) values
    ('pairing_enabled', 'false'::jsonb),
    ('pair_amount',     '6000'::jsonb),
    ('pay_bank_name',      '"UBA"'::jsonb),
    ('pay_account_name',   '"AMUSAN Elizabeth Oluwatoyin"'::jsonb),
    ('pay_account_number', '"2369244361"'::jsonb)
on conflict (key) do nothing;

-- ── Consent token lookup throttle ───────────────────────────────────────
-- A token is 4 characters from a 31-character alphabet (~923k combinations) and
-- a hit returns someone's photo and full name, so the lookup endpoint is worth
-- brute-forcing. Serverless rules out in-memory counters, hence a table.
create table if not exists public.fyb_token_attempts (
    id           bigserial primary key,
    ip           text not null,
    succeeded    boolean not null default false,
    attempted_at timestamptz not null default now()
);

create index if not exists fyb_token_attempts_ip_time_idx
    on public.fyb_token_attempts (ip, attempted_at desc);

-- ── RLS: enabled, no policies (service role bypasses) ───────────────────
alter table public.fyb_pair_intents   enable row level security;
alter table public.fyb_settings       enable row level security;
alter table public.fyb_token_attempts enable row level security;

-- ── Seed: the invitation ticket email ───────────────────────────────────
-- Sent to BOTH parties only once an admin approves the pairing. Dollar-quoted:
-- single quotes need no escaping inside this block.
insert into public.fyb_email_templates (template_key, label, subject, body_html, is_active)
values (
    'fyb_invitation',
    'FYB Dinner — invitation (ticket)',
    'It is official, {{first_name}} — your FYB Dinner invitation',
    $html$
<p style="margin:0 0 20px;">Hey <b>{{first_name}}</b> 🤍</p>

<p style="margin:0 0 26px;">Payment confirmed. You and your date are officially on the list for the <strong>{{event_name}}</strong> — this email is your entry pass, so keep it somewhere you can find it on the night.</p>

{{ticket_block}}

<p style="margin:0 0 9px;font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:26px;color:#301D21;">At the door</p>

<p style="margin:0 0 26px;">Show this email. No date, no entry — you two come in together, so plan your arrival with that in mind.</p>

{{event_block}}

<p style="margin:0 0 20px;">Anything you are unsure about is answered here.</p>

{{guide_button}}

<p style="margin:0;font-size:14px;line-height:23px;color:#746367;">See you in your finest. 🖤<br />{{signature}}</p>
    $html$,
    true
)
on conflict (template_key) do nothing;

-- ════════════════════════════════════════════════════════════════════════
-- FYB Hive — consent tokens + transactional email outbox
-- Run in the Supabase SQL editor (same as migrations/001_fyb-migration.sql).
-- Idempotent: safe to re-run. Seeds never clobber edited copy.
--
-- Adds:
--   • fyb_consent_tokens  — the FYB-XXXX token, one per registration.
--                           Deliberately NOT a column on fyb_registrations so
--                           that admin queries doing select('*') on that table
--                           can never leak a token.
--   • fyb_email_templates — admin-editable copy (no redeploy to fix a typo)
--   • fyb_email_queue     — the durable outbox
--   • fyb_email_logs      — audit trail, one row per send attempt
-- ════════════════════════════════════════════════════════════════════════

-- ── updated_at helper ───────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- ── Consent tokens ──────────────────────────────────────────────────────
-- registration_id is the PK: one token per finalist, forever. Re-issuing
-- would invalidate a token already shared with a date, so the app treats
-- issuing as idempotent and this constraint enforces it.
-- `token` is UNIQUE and that constraint is the sole authority on uniqueness:
-- the app generates randomly and retries on 23505 rather than checking-then-
-- inserting, so two concurrent registrations can never race into the same
-- token. (The unique constraint creates index fyb_consent_tokens_token_key,
-- which also serves the pairing lookup — no second index needed.)
create table if not exists public.fyb_consent_tokens (
    registration_id uuid primary key
        references public.fyb_registrations(id) on delete cascade,
    token           text not null unique,
    issued_at       timestamptz not null default now(),
    last_sent_at    timestamptz
);

-- Belt and braces: tokens are stored canonical (uppercase, FYB- prefixed), so
-- a stray lowercase insert can never create a second token that *looks* the
-- same to a human but passes the unique check.
alter table public.fyb_consent_tokens
    drop constraint if exists fyb_consent_tokens_format_chk;
alter table public.fyb_consent_tokens
    add constraint fyb_consent_tokens_format_chk
    check (token ~ '^FYB-[2-9A-HJ-NP-Z]{4}$');

-- ── Editable copy ───────────────────────────────────────────────────────
create table if not exists public.fyb_email_templates (
    id           uuid primary key default gen_random_uuid(),
    template_key text not null unique,
    label        text not null,
    subject      text not null,
    body_html    text not null,
    is_active    boolean not null default true,
    updated_at   timestamptz not null default now(),
    updated_by   text
);

-- ── The outbox ──────────────────────────────────────────────────────────
create table if not exists public.fyb_email_queue (
    id              uuid primary key default gen_random_uuid(),
    created_at      timestamptz not null default now(),

    mode            text not null default 'template',   -- 'template' | 'custom'
    template_key    text,                               -- required when mode='template'
    subject         text,                               -- required when mode='custom'
    body_html       text,                               -- required when mode='custom'

    -- What the message is about. For consent mail this is a fyb_registrations.id;
    -- the worker resolves the token from it at render time, so no token value is
    -- ever stored on a queue row.
    context_id      uuid,
    context_ids     jsonb,
    context_type    text,

    recipient_email text,
    recipient_name  text,

    status          text not null default 'pending',    -- pending|sending|sent|failed
    attempts        integer not null default 0,
    max_attempts    integer not null default 5,
    last_error      text,
    sent_at         timestamptz,
    updated_at      timestamptz not null default now()
);

-- Drives both the drain query and the stuck-row reaper.
create index if not exists fyb_email_queue_status_idx
    on public.fyb_email_queue (status, created_at);

-- Lets the admin dashboard find the latest consent mail per registration.
create index if not exists fyb_email_queue_context_idx
    on public.fyb_email_queue (context_id, created_at desc);

-- ── Audit trail ─────────────────────────────────────────────────────────
create table if not exists public.fyb_email_logs (
    id              uuid primary key default gen_random_uuid(),
    queue_id        uuid references public.fyb_email_queue(id) on delete set null,
    context_id      uuid,
    template_key    text,
    recipient_email text not null,
    subject         text,
    success         boolean not null default false,
    error_message   text,
    sent_at         timestamptz not null default now()
);

create index if not exists fyb_email_logs_context_idx on public.fyb_email_logs (context_id);
create index if not exists fyb_email_logs_sent_at_idx on public.fyb_email_logs (sent_at desc);

-- ── updated_at triggers ─────────────────────────────────────────────────
drop trigger if exists fyb_email_templates_set_updated_at on public.fyb_email_templates;
create trigger fyb_email_templates_set_updated_at
    before update on public.fyb_email_templates
    for each row execute function public.set_updated_at();

drop trigger if exists fyb_email_queue_set_updated_at on public.fyb_email_queue;
create trigger fyb_email_queue_set_updated_at
    before update on public.fyb_email_queue
    for each row execute function public.set_updated_at();

-- ── RLS: enabled with NO policies ───────────────────────────────────────
-- Both the app and the Edge Function use the service role, which bypasses RLS.
-- Every other client — including a leaked anon key — gets nothing. This is the
-- whole access-control story for the consent token; do not add policies.
alter table public.fyb_consent_tokens  enable row level security;
alter table public.fyb_email_templates enable row level security;
alter table public.fyb_email_queue     enable row level security;
alter table public.fyb_email_logs      enable row level security;

-- ── Seed: the consent token email ───────────────────────────────────────
-- Only the inner body lives here; the worker wraps it in the branded shell.
-- `on conflict do nothing` so re-running never overwrites edited copy.
insert into public.fyb_email_templates (template_key, label, subject, body_html, is_active)
values (
    'fyb_consent',
    'FYB Dinner — consent token',
    'You''re in, {{first_name}} — your FYB consent token',
    -- Dollar-quoted: single quotes inside need NO escaping. Writing '' here
    -- would land two literal apostrophes in the delivered email.
    $html$
<p style="margin:0 0 20px;">Hey <b>{{first_name}}</b> 😀</p>

<p style="margin:0 0 26px;">Registration done — verified, photo and all. Your seat at the <strong>{{event_name}}</strong> is yours. One thing left, and it's the good part.</p>

{{token_block}}

<p style="margin:0 0 9px;font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:26px;color:#301D21;">What this is</p>

<p style="margin:0 0 26px;">Those four characters are your <strong>consent</strong>, in a form someone else can carry. When pairing opens, you'll give it to that {{partner_term}} you'd love to walk in with — they enter it, and that's how we know you said yes. No token, no pairing. That's the whole system.</p>

<p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:26px;color:#301D21;">What happens next</p>

{{next_steps_block}}

{{safety_block}}

{{event_block}}

<p style="margin:0 0 20px;">Questions about how any of this works? It's all laid out here.</p>

{{guide_button}}

<p style="margin:0;font-size:14px;line-height:23px;color:#746367;">See you in your finest. 🖤<br />{{signature}}</p>
    $html$,
    true
)
on conflict (template_key) do nothing;

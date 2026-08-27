-- ════════════════════════════════════════════════════════════════════════
-- FYB Hive — schema migration (run in the Supabase SQL editor)
-- Adds the FYB Dinner tables. Reuses existing public.profiles / class_sets /
-- tenures for member lookup + level. RLS is enabled with NO anon policies:
-- the app reaches these tables only via the service-role key in server actions.
-- ════════════════════════════════════════════════════════════════════════

-- ── Finalist registrations (one row per member) ─────────────────────────
create table if not exists public.fyb_registrations (
    id              uuid primary key default gen_random_uuid(),
    profile_id      uuid not null unique references public.profiles(id),
    first_name      text not null,
    last_name       text not null,
    email           text,
    phone_number    text,
    gender          text check (gender in ('male', 'female')),
    level           text not null,                 -- snapshot: '400L' | '500L'
    entry_year      integer,
    department      text,
    photo_url       text not null,
    photo_public_id text,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

create index if not exists fyb_registrations_created_at_idx
    on public.fyb_registrations (created_at desc);

-- ── Admins (must map to an existing profile) ────────────────────────────
create table if not exists public.fyb_admins (
    id         uuid primary key default gen_random_uuid(),
    profile_id uuid not null unique references public.profiles(id),
    role       text not null default 'ADMIN' check (role in ('ADMIN', 'MODERATOR')),
    created_at timestamptz not null default now()
);

-- ── Pairings (defined now; UI ships later) ──────────────────────────────
create table if not exists public.fyb_pairings (
    id                       uuid primary key default gen_random_uuid(),
    finalist_registration_id uuid not null references public.fyb_registrations(id),
    partner_registration_id  uuid references public.fyb_registrations(id), -- if partner is also a finalist
    partner_name             text,
    partner_email            text,
    partner_phone            text,
    partner_gender           text check (partner_gender in ('male', 'female')),
    partner_photo_url        text,
    pair_token               text unique,
    amount                   integer not null default 6000,
    paid                     boolean not null default false,
    confirmed                boolean not null default false,
    confirmed_by             uuid references public.profiles(id),
    created_at               timestamptz not null default now(),
    updated_at               timestamptz not null default now()
);

-- ── Row Level Security (locked down; service role bypasses RLS) ──────────
alter table public.fyb_registrations enable row level security;
alter table public.fyb_admins       enable row level security;
alter table public.fyb_pairings     enable row level security;

-- ── Seed the first admin (edit the email to an existing profile) ─────────
insert into public.fyb_admins (profile_id, role)
select id, 'ADMIN' from public.profiles
where email = 'preciousbusiness10@gmail.com'
on conflict (profile_id) do nothing;

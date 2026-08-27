-- ════════════════════════════════════════════════════════════════════════
-- FYB Hive — TEST MEMBERS for awards testing
--
-- Creates 60 members and registers the finalists among them for the dinner, so
-- you can test the awards end to end without registering anyone by hand.
--
-- It does NOT create tenures or class sets. It reads the one live tenure and
-- derives every level from it, and it fails loudly rather than guessing if that
-- tenure is missing or ambiguous.
--
-- ⚠️  `profiles` is the REAL member directory, shared with the ICT portal —
-- these rows appear there too. Prefer a staging project or a Supabase branch.
-- Everything created here is marked and §8 deletes exactly it:
--     • uuid starts  `fbfbfbfb-`   ← what every cleanup statement keys on
--     • email ends   `@fyb-test.local`
--     • matric runs  AAA/99/90xx   (real shape, 9xxx serial to avoid collisions)
--
-- `@fyb-test.local` is not a real domain, so do NOT run the admin's "send
-- pending consent emails" backfill while these exist.
--
-- Order: fyb-migration → consent-token-migration → unit-migration →
--        pairing-migration → awards-migration → awards-stats-migration →
--        THIS → awards-seed.
-- ════════════════════════════════════════════════════════════════════════


-- ── §1. Guard: exactly one live tenure ──────────────────────────────────
-- Level is (sessionYear − entryYear + 1) × 100, so the live tenure decides who
-- is a finalist. Two active tenures, or none, means every level below would be
-- a guess — so this stops here instead.
do $$
declare
    live_count int;
    live_session text;
begin
    select count(*) into live_count from public.tenures where is_active;

    if live_count = 0 then
        raise exception 'No live tenure. Set one active in public.tenures before running this.';
    elsif live_count > 1 then
        raise exception 'There are % live tenures. Exactly one must be active.', live_count;
    end if;

    select session into live_session from public.tenures where is_active;

    if split_part(live_session, '/', 1) !~ '^[0-9]{4}$' then
        raise exception 'Live tenure session "%" is not in YYYY/YYYY form — levels cannot be derived.', live_session;
    end if;

    raise notice 'Live session %: 500L entered %, 400L entered %.',
        live_session,
        split_part(live_session, '/', 1)::int - 4,
        split_part(live_session, '/', 1)::int - 3;
end $$;


-- ── §2. Sixty members, levels derived from the live session ─────────────
-- Spread on purpose: ~40 finalists to stand as candidates, and 20 juniors so
-- you can prove any level may VOTE while only finalists may be voted for.
--
-- `entry_year` is set on the profile directly, and `class_set_id` is linked
-- only where that generation already exists — nothing is created in
-- `class_sets`. The app reads `class_sets.entry_year ?? profiles.entry_year`,
-- so the level resolves correctly either way.
--
-- uuids are deterministic, so this is safe to re-run and exact to delete.

-- 2a. auth.users — FK anchors only (profiles.id references it). No password,
--     no login; these accounts cannot authenticate anywhere.
insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
)
select
    '00000000-0000-0000-0000-000000000000',
    ('fbfbfbfb-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid,
    'authenticated',
    'authenticated',
    'member' || lpad(i::text, 3, '0') || '@fyb-test.local',
    'no-login-test-account',
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"seed":"fyb-test"}'::jsonb
from generate_series(1, 60) as i
on conflict (id) do nothing;

-- 2b. profiles
with live as (
    select (split_part(session, '/', 1))::int as session_year
    from public.tenures where is_active
),
people as (
    select
        i,
        (array['Ada','Chiamaka','Temitope','Blessing','Ifeoma','Oluwaseun','Grace','Zainab',
               'Faith','Damilola','Nneka','Adaeze','Emeka','Tobi','Chinedu','Ayomide',
               'Samuel','Ibrahim','Daniel','Kelechi'])[1 + (i % 20)]              as first_name,
        (array['Okafor','Adeyemi','Balogun','Eze','Okonkwo','Adebayo','Nwosu','Lawal',
               'Oyelaran','Ibrahim','Chukwu','Afolabi','Ogunleye','Uche','Bello',
               'Adewale','Nnamdi','Olatunji','Obi','Salami'])[1 + ((i * 7) % 20)] as last_name,
        -- Names 1–12 in the array above are feminine and 13–20 masculine, so
        -- gender follows the name rather than contradicting it on the card.
        case when (i % 20) between 1 and 12 then 'female' else 'male' end         as gender,
        (array['CSC','MEE','EEE','AGE','BCH','MCB','STA','PHY','FST','ARC'])[1 + (i % 10)] as dept,
        -- 1–20 → 500L, 21–40 → 400L, 41–50 → 300L, 51–55 → 200L, 56–60 → 100L
        case
            when i <= 20 then 4
            when i <= 40 then 3
            when i <= 50 then 2
            when i <= 55 then 1
            else 0
        end as years_back
    from generate_series(1, 60) as i
),
rows as (
    -- Everything derived once, so the id, matric and entry year can't drift
    -- apart between the insert and the collision guard below.
    select
        ('fbfbfbfb-0000-4000-8000-' || lpad(p.i::text, 12, '0'))::uuid  as id,
        p.first_name,
        p.last_name,
        p.gender,
        'member' || lpad(p.i::text, 3, '0') || '@fyb-test.local'        as email,
        '0700' || lpad(p.i::text, 7, '0')                               as phone_number,
        l.session_year - p.years_back                                   as entry_year,
        -- AAA/99/9999, the real matric shape — e.g. CSC/21/9007. The 9xxx
        -- serial is what keeps these clear of genuine matric numbers.
        p.dept || '/'
            || lpad(((l.session_year - p.years_back) % 100)::text, 2, '0')
            || '/' || (9000 + p.i)::text                                as matric_number
    from people p
    cross join live l
)
insert into public.profiles (
    id, first_name, last_name, gender, email, phone_number,
    matric_number, entry_year, class_set_id
)
select
    r.id, r.first_name, r.last_name, r.gender, r.email, r.phone_number,
    r.matric_number,
    r.entry_year,
    -- Linked only where that generation already exists; nothing is created in
    -- class_sets. The app falls back to profiles.entry_year when it's null.
    (select cs.id from public.class_sets cs where cs.entry_year = r.entry_year)
from rows r
-- Skip anyone whose matric would collide with a real member's, rather than
-- failing the whole insert on one unlucky number.
where not exists (
    select 1 from public.profiles x
    where x.matric_number = r.matric_number and x.id <> r.id
)
on conflict (id) do nothing;

-- The matric pattern, as stored — check one before going further:
select matric_number, first_name, last_name, gender, entry_year
from public.profiles where id::text like 'fbfbfbfb-%' order by matric_number limit 5;


-- ── §3. Unit membership, so cards aren't unitless ───────────────────────
-- Uses units that ALREADY exist. Creates none. If your `units` table is empty
-- this inserts nothing and registrations simply carry a null unit, which the
-- UI already handles.
with t as (select id from public.tenures where is_active),
u as (
    select id, row_number() over (order by name) as n,
           count(*) over () as total
    from public.units where type = 'UNIT'
),
p as (
    select id, ('x' || substr(md5(id::text), 1, 4))::bit(16)::int as hash
    from public.profiles where id::text like 'fbfbfbfb-%'
)
insert into public.membership_units (profile_id, unit_id, tenure_id, role)
select p.id, u.id, t.id, 'Member'
from p
cross join t
join u on u.n = 1 + (p.hash % greatest(u.total, 1))
where not exists (
    select 1 from public.membership_units m
    where m.profile_id = p.id and m.unit_id = u.id and m.tenure_id = t.id
);


-- ── §4. Register the finalists — this is the manual work you're skipping ─
-- Every 400/500L test member is registered except every 5th, which leaves a
-- handful to walk through the real registration flow by hand (and to test the
-- admin's "no dinner registration for that email" refusal).
--
-- Photos come from Cloudinary's public `demo` cloud — already an allowed image
-- host in next.config.mjs — picked to match each member's gender and cropped to
-- the face like a real upload. The demo cloud carries only two male portraits,
-- so brothers repeat more than sisters do.
--
-- If this errors on the `unit` column, run `migrations/003_unit-migration.sql` first.
with live as (
    select (split_part(session, '/', 1))::int as session_year
    from public.tenures where is_active
),
t as (select id from public.tenures where is_active),
finalists as (
    select
        p.*,
        ((l.session_year - coalesce(cs.entry_year, p.entry_year) + 1) * 100)::text || 'L' as level,
        ('x' || substr(md5(p.id::text), 5, 4))::bit(16)::int as hash,
        (split_part(p.matric_number, '/', 3))::int - 9000    as seq
    from public.profiles p
    cross join live l
    left join public.class_sets cs on cs.id = p.class_set_id
    where p.id::text like 'fbfbfbfb-%'
      and (l.session_year - coalesce(cs.entry_year, p.entry_year) + 1) * 100 in (400, 500)
)
insert into public.fyb_registrations (
    profile_id, first_name, last_name, email, phone_number, gender,
    level, entry_year, unit, photo_url, photo_public_id
)
select
    f.id, f.first_name, f.last_name, f.email, f.phone_number, f.gender,
    f.level, f.entry_year,
    (select u.name
       from public.membership_units mu
       join public.units u on u.id = mu.unit_id
       join t on t.id = mu.tenure_id
      where mu.profile_id = f.id
      order by u.name
      limit 1),
    'https://res.cloudinary.com/demo/image/upload/w_600,h_600,c_fill,g_face/'
        || case f.gender
               when 'male' then (array['smiling_man','businessman'])[1 + (f.hash % 2)]
               else (array['woman','lady','model','face_left',
                           'face_top','cld-sample'])[1 + (f.hash % 6)]
           end
        || '.jpg',
    null
from finalists f
where f.seq % 5 <> 0
on conflict (profile_id) do nothing;


-- ── §5. Consent tokens ──────────────────────────────────────────────────
-- The same FYB-XXXX shape the app issues, from the same lookalike-free
-- alphabet, derived from the registration id so re-running is a no-op. Not
-- needed for awards — this is what makes pairing testable too. §7 prints them.
with alphabet as (select '23456789ABCDEFGHJKMNPQRSTUVWXYZ' as s)
insert into public.fyb_consent_tokens (registration_id, token)
select
    r.id,
    'FYB-'
    || substr(a.s, 1 + (('x' || substr(md5(r.id::text), 1, 2))::bit(8)::int % 31), 1)
    || substr(a.s, 1 + (('x' || substr(md5(r.id::text), 3, 2))::bit(8)::int % 31), 1)
    || substr(a.s, 1 + (('x' || substr(md5(r.id::text), 5, 2))::bit(8)::int % 31), 1)
    || substr(a.s, 1 + (('x' || substr(md5(r.id::text), 7, 2))::bit(8)::int % 31), 1)
from public.fyb_registrations r
cross join alphabet a
where r.profile_id::text like 'fbfbfbfb-%'
on conflict (registration_id) do nothing;


-- ── §6. Admins for testing the dashboard (optional) ─────────────────────
insert into public.fyb_admins (profile_id, role)
select id, 'ADMIN' from public.profiles
where email in ('member001@fyb-test.local', 'member002@fyb-test.local')
on conflict (profile_id) do nothing;


-- ── §7. What you just made ──────────────────────────────────────────────
select 'members'              as kind, count(*) from public.profiles where id::text like 'fbfbfbfb-%'
union all
select 'registered finalists', count(*) from public.fyb_registrations where profile_id::text like 'fbfbfbfb-%'
union all
select 'consent tokens',       count(*) from public.fyb_consent_tokens c
    join public.fyb_registrations r on r.id = c.registration_id
    where r.profile_id::text like 'fbfbfbfb-%';

-- Levels actually produced — confirm you have 400L and 500L before seeding
-- awards, because candidates come only from registered finalists:
with live as (select (split_part(session,'/',1))::int as sy from public.tenures where is_active)
select ((l.sy - coalesce(cs.entry_year, p.entry_year) + 1) * 100)::text || 'L' as level,
       count(*), count(r.id) as registered
from public.profiles p
cross join live l
left join public.class_sets cs on cs.id = p.class_set_id
left join public.fyb_registrations r on r.profile_id = p.id
where p.id::text like 'fbfbfbfb-%'
group by 1 order by 1;

-- Candidates you can stand, with their tokens (a token normally only ever
-- exists in an inbox — this is a test-data convenience, not a feature):
select r.first_name, r.last_name, r.email, r.gender, r.level, r.unit, c.token
from public.fyb_registrations r
left join public.fyb_consent_tokens c on c.registration_id = r.id
where r.profile_id::text like 'fbfbfbfb-%'
order by r.level, r.first_name;

-- Juniors — these prove any level can vote:
with live as (select (split_part(session,'/',1))::int as sy from public.tenures where is_active)
select p.first_name, p.last_name, p.email, p.phone_number,
       ((l.sy - coalesce(cs.entry_year, p.entry_year) + 1) * 100)::text || 'L' as level
from public.profiles p
cross join live l
left join public.class_sets cs on cs.id = p.class_set_id
where p.id::text like 'fbfbfbfb-%'
  and (l.sy - coalesce(cs.entry_year, p.entry_year) + 1) * 100 not in (400, 500)
order by level;

-- Finalists left unregistered on purpose — walk these through /register:
select p.first_name, p.last_name, p.email, p.phone_number
from public.profiles p
where p.id::text like 'fbfbfbfb-%'
  and not exists (select 1 from public.fyb_registrations r where r.profile_id = p.id)
  and exists (
      select 1 from public.tenures t
      where t.is_active
        and ((split_part(t.session,'/',1))::int - p.entry_year + 1) * 100 in (400, 500)
  );

-- ➜ Now run `migrations/seeds/awards-seed.sql` to create the categories, stand these
--   finalists as candidates and open voting.


-- ── §8. FULL CLEANUP ────────────────────────────────────────────────────
-- Keyed entirely on the `fbfbfbfb-` uuid prefix, so it cannot reach a real
-- member. Run as one transaction, top to bottom.
--
-- begin;
--
-- delete from public.fyb_email_queue
--  where context_id in (select id from public.fyb_registrations
--                        where profile_id::text like 'fbfbfbfb-%');
--
-- delete from public.fyb_award_votes where voter_profile_id::text like 'fbfbfbfb-%';
--
-- delete from public.fyb_award_candidates
--  where registration_id in (select id from public.fyb_registrations
--                             where profile_id::text like 'fbfbfbfb-%');
--
-- delete from public.fyb_pair_intents
--  where initiator_registration_id in (select id from public.fyb_registrations
--                                       where profile_id::text like 'fbfbfbfb-%')
--     or partner_registration_id  in (select id from public.fyb_registrations
--                                       where profile_id::text like 'fbfbfbfb-%');
--
-- -- consent tokens cascade with the registration
-- delete from public.fyb_registrations where profile_id::text like 'fbfbfbfb-%';
-- delete from public.fyb_admins         where profile_id::text like 'fbfbfbfb-%';
-- delete from public.membership_units   where profile_id::text like 'fbfbfbfb-%';
-- delete from public.leadership         where profile_id::text like 'fbfbfbfb-%';
-- delete from public.profiles           where id::text like 'fbfbfbfb-%';
-- delete from auth.users                where id::text like 'fbfbfbfb-%';
--
-- commit;

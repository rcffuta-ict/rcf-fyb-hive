-- ════════════════════════════════════════════════════════════════════════
-- FYB Hive — awards TEST SEED
--
-- Run AFTER 006_awards-migration.sql AND 007_awards-stats-migration.sql, in the
-- Supabase SQL editor. The stats migration adds `share_code`, and running this
-- first would leave every candidate without a campaign link.
--
-- This is test data. It writes only to the three `fyb_award_*` tables and to
-- `fyb_settings` — it never touches profiles, registrations or pairings. Every
-- block is idempotent, and §7 deletes everything it created.
--
-- Read §0 first: it tells you whether there is anything to stand as a
-- candidate at all.
-- ════════════════════════════════════════════════════════════════════════

-- ── §0. Sanity check — run this on its own first ────────────────────────
-- Candidates come from real dinner registrations. If `registrations` is 0,
-- nothing below will have anyone to stand, and §2 will insert zero rows —
-- run `migrations/seeds/test-members-seed.sql` first to create some.
select
    (select count(*) from public.fyb_registrations)        as registrations,
    (select count(*) from public.profiles)                 as members_who_can_vote,
    (select count(*) from public.fyb_award_categories)     as categories_now,
    (select count(*) from public.fyb_award_candidates)     as candidates_now,
    (select count(*) from public.fyb_award_votes)          as votes_now;


-- ── §1. Categories ──────────────────────────────────────────────────────
-- Eight, deliberately: enough that the vertical stack scrolls and the progress
-- bar means something. Edit the titles freely — they are what voters read.
insert into public.fyb_award_categories (slug, title, description, sort_order) values
    ('best-dressed',      'Best Dressed',                  'The one who has never once been caught underdressed. Not on a Wednesday. Not ever.', 1),
    ('most-likely-preach','Most Likely to Preach a 3-Hour Sermon', 'Started at "just a short word." Ended at 9:47pm. Nobody left.',                 2),
    ('life-of-the-party', 'Life of the Party',             'The room changes temperature when they walk in.',                                     3),
    ('quiet-storm',       'Quiet Storm',                   'Says the least, carries the most. You only notice when they are absent.',            4),
    ('gbedu-minister',    'Gbedu Minister',                'One hand on the keys, one foot already dancing.',                                     5),
    ('most-punctual',     'Most Punctual',                 'Arrives before the person who has the key.',                                          6),
    ('the-encourager',    'The Encourager',                'The text that arrived on exactly the day you needed it.',                             7),
    ('future-ceo',        'Future CEO',                    'Already runs three things you did not know about.',                                   8)
on conflict (slug) do nothing;


-- ── §2. Candidates ──────────────────────────────────────────────────────
-- Stands 6 registered finalists in each category, chosen deterministically per
-- category (hash of registration + slug), so the categories genuinely differ
-- from each other but re-running gives the same line-up rather than a new one.
--
-- Nicknames are drawn from a pool and combined with the person's first name.
-- Replace them by hand in the admin dashboard — the point of the seed is that
-- there is something on screen to click, not that the jokes land.
with cats as (
    select id, slug from public.fyb_award_categories where is_archived = false
),
picks as (
    select
        c.id  as category_id,
        r.id  as registration_id,
        r.first_name,
        row_number() over (
            partition by c.id order by md5(r.id::text || c.slug)
        ) as pick_no
    from cats c
    cross join public.fyb_registrations r
),
pool as (
    select array[
        'The Encourager', 'Gbedu Minister', 'Chief Vibes Officer', 'The Quiet Storm',
        'Sunday Best', 'Prayer Warrior', 'The Punctual One', 'Auntie of the Set',
        'Uncle of the Set', 'Certified Blesser'
    ] as names
)
insert into public.fyb_award_candidates (category_id, registration_id, nickname, sort_order)
select
    p.category_id,
    p.registration_id,
    (select names[((p.pick_no - 1) % 10) + 1] from pool),
    p.pick_no
from picks p
where p.pick_no <= 6
on conflict (category_id, registration_id) do nothing;


-- ── §3. Open voting (results stay hidden) ───────────────────────────────
-- This is exactly what the admin dashboard's Awards → Settings toggles write,
-- so you can equally do it there. `awards_results_public` stays false on
-- purpose — flip it later and watch what changes.
--
-- Run this AFTER §2, always: the dashboard refuses to open voting when no
-- candidate is standing, and setting the flag here with an empty ballot would
-- walk around that guard rather than test it.
insert into public.fyb_settings (key, value, updated_by) values
    ('awards_enabled',        'true'::jsonb,  'seed'),
    ('awards_results_public', 'false'::jsonb, 'seed')
on conflict (key) do update set value = excluded.value, updated_by = 'seed';


-- ── §4. OPTIONAL — fake votes, so the stats page has a shape ────────────
-- Casts one vote per category for 40 random members. Skip this block if you
-- would rather watch the numbers climb from zero as your testers vote; run it
-- if you want to see bars, percentages and a leader immediately.
--
-- These are real profile ids, so a tester whose profile was picked will find a
-- pick already made when they open the ballot. That is worth seeing once — it
-- is what a returning voter experiences.
with voters as (
    select id from public.profiles order by random() limit 40
),
choices as (
    select
        v.id as voter_profile_id,
        c.category_id,
        c.id as candidate_id,
        row_number() over (partition by v.id, c.category_id order by random()) as rn
    from voters v
    cross join public.fyb_award_candidates c
)
insert into public.fyb_award_votes (category_id, candidate_id, voter_profile_id)
select category_id, candidate_id, voter_profile_id
from choices
where rn = 1
on conflict (category_id, voter_profile_id) do nothing;


-- ── §5. Admins for your testers ─────────────────────────────────────────
-- There is no password anywhere in this app. Admin access is: the email must
-- belong to an existing `profiles` row AND be listed here. Add your testers by
-- editing the list, then they log in at /admin with just that email.
insert into public.fyb_admins (profile_id, role)
select id, 'ADMIN'
from public.profiles
where lower(email) in (
    'preciousbusiness10@gmail.com'
    -- , 'tester-two@example.com'
    -- , 'tester-three@example.com'
)
on conflict (profile_id) do nothing;

-- Confirm they landed (anyone missing here has no profile with that email):
select p.email, a.role
from public.fyb_admins a
join public.profiles p on p.id = a.profile_id;


-- ── §6. Emails your testers can vote with ───────────────────────────────
-- Any member profile can vote — level is irrelevant. Hand these out, or let
-- people use their own. Phone numbers work too.
select first_name, last_name, email, phone_number
from public.profiles
where email is not null
order by random()
limit 25;

-- And who is currently standing, so you can check a card against the person:
select c.title, r.first_name, r.last_name, r.email, cd.nickname
from public.fyb_award_candidates cd
join public.fyb_award_categories c on c.id = cd.category_id
join public.fyb_registrations r    on r.id = cd.registration_id
order by c.sort_order, cd.sort_order;


-- ── §7. RESET — undo everything above ───────────────────────────────────
-- Deleting the categories cascades to candidates and votes. Registrations,
-- profiles and pairings are untouched.
--
-- delete from public.fyb_award_votes;
-- delete from public.fyb_award_categories;
-- update public.fyb_settings set value = 'false'::jsonb
--   where key in ('awards_enabled', 'awards_results_public');

-- Or, to clear only the fake votes from §4 and keep the ballot standing:
-- delete from public.fyb_award_votes;

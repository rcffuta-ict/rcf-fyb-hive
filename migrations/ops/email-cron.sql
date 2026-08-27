-- ════════════════════════════════════════════════════════════════════════
-- FYB Hive — email queue sweep
-- Run once in the Supabase SQL editor. Replace <REF> and <SECRET> first.
--
-- WHY THIS EXISTS
-- The app pings the worker after every enqueue, but that ping is best-effort:
-- `after()` fires once the response is flushed and nothing retries it, so a
-- cold start, a network blip or a 401 leaves rows at `pending` indefinitely.
-- That is exactly the symptom of "22 registrations queued and nothing sending".
--
-- This is the safety net: every 5 minutes, poke the worker. It is a dumb
-- periodic sweep — not per-row delivery logic — which is the one legitimate
-- use of pg_net here. With this scheduled, a lost ping costs at most 5 minutes
-- instead of sitting there until somebody notices.
-- ════════════════════════════════════════════════════════════════════════

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Idempotent: drop any previous schedule before creating it.
select cron.unschedule('drain-fyb-email-queue')
where exists (select 1 from cron.job where jobname = 'drain-fyb-email-queue');

select cron.schedule(
    'drain-fyb-email-queue',
    '*/5 * * * *',
    $$
    select net.http_post(
        url     := 'https://<REF>.supabase.co/functions/v1/send-fyb-email',
        headers := '{"Content-Type":"application/json","x-drain-secret":"<SECRET>"}'::jsonb,
        body    := '{"drain":true}'::jsonb
    );
    $$
);

-- Verify it registered:
--   select jobname, schedule, active from cron.job;
--
-- Recent runs (check this if mail is still not moving):
--   select status, return_message, start_time
--   from cron.job_run_details
--   where jobid = (select jobid from cron.job where jobname = 'drain-fyb-email-queue')
--   order by start_time desc limit 10;
--
-- To stop it:
--   select cron.unschedule('drain-fyb-email-queue');

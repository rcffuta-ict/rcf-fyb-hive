-- ════════════════════════════════════════════════════════════════════════
-- FYB Hive — brother/sister rule, enforced in the database
-- Run in the Supabase SQL editor AFTER 004_pairing-migration.sql. Idempotent.
--
-- The app already refuses a same-gender pairing in two places (the pairing
-- screen, and `canPair` in src/services/pairing.service.ts). This adds the
-- third: a trigger, so the rule holds even if a check is skipped, a future
-- code path forgets it, or someone reaches the table directly with the service
-- key. Same reasoning as the approval and pair-uniqueness indexes — the rules
-- that must never break are enforced where they cannot be bypassed.
--
-- A CHECK constraint can't do this: gender lives on fyb_registrations, and a
-- CHECK may not read another table. Hence a trigger.
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.fyb_pair_gender_guard()
returns trigger as $$
declare
    initiator_gender text;
    partner_gender   text;
begin
    select gender into initiator_gender
    from public.fyb_registrations
    where id = new.initiator_registration_id;

    if initiator_gender is null then
        raise exception 'Pairing blocked: the initiator has no gender on record'
            using errcode = 'check_violation';
    end if;

    if new.kind = 'finalist' then
        select gender into partner_gender
        from public.fyb_registrations
        where id = new.partner_registration_id;

        if partner_gender is null then
            raise exception 'Pairing blocked: the partner has no gender on record'
                using errcode = 'check_violation';
        end if;

        if initiator_gender = partner_gender then
            raise exception
                'Pairing blocked: the dinner pairs a brother with a sister (both are %)',
                initiator_gender
                using errcode = 'check_violation';
        end if;

    elsif new.kind = 'associate' then
        -- The app derives the associate's gender as the opposite of the
        -- finalist's, so a match here means something upstream is wrong.
        if new.associate_gender is null or new.associate_gender = initiator_gender then
            raise exception
                'Pairing blocked: an associate must be the opposite gender to the finalist'
                using errcode = 'check_violation';
        end if;
    end if;

    return new;
end;
$$ language plpgsql;

drop trigger if exists fyb_pair_gender_guard_trg on public.fyb_pair_intents;
create trigger fyb_pair_gender_guard_trg
    before insert or update of
        initiator_registration_id, partner_registration_id, associate_gender, kind
    on public.fyb_pair_intents
    for each row execute function public.fyb_pair_gender_guard();

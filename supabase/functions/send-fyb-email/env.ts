/**
 * Environment access, namespaced.
 *
 * Supabase Edge Function secrets are **project-wide**, not per-function: every
 * function in the project sees the same variables. This project already has a
 * `send-order-email` function using plain `ZEPTO_FROM`, `ZEPTO_TOKEN` and
 * friends, so if this worker read those names too, configuring one would
 * silently reconfigure the other — and FYB mail would go out with the orders
 * sender identity, or vice versa.
 *
 * So everything this function owns is read with an `FYB_` prefix.
 */

/** A secret owned exclusively by this function. Must be set as `FYB_<name>`. */
export const fybEnv = (name: string): string | undefined =>
    Deno.env.get(`FYB_${name}`);

/**
 * A secret that is genuinely account-level and identical for every function —
 * the ZeptoMail API credential and endpoint. Prefers `FYB_<name>` but falls
 * back to the unprefixed value, so a shared ZeptoMail account doesn't have to
 * be configured twice.
 *
 * Deliberately NOT used for anything identity-shaped (from address, from name,
 * site URL, event copy): silently inheriting the orders sender would be worse
 * than a loud missing-config error.
 */
export const sharedEnv = (name: string): string | undefined =>
    Deno.env.get(`FYB_${name}`) ?? Deno.env.get(name);

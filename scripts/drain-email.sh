#!/usr/bin/env bash
# Force a drain of fyb_email_queue.
#
# The app pings the worker after every enqueue, but that ping is best-effort:
# if it is lost (cold start, network blip, a 401 from a mismatched secret) the
# rows sit at `pending` until something else drains them. This is that
# something else, by hand.
#
#   ./scripts/drain-email.sh
#   ./scripts/drain-email.sh --until-empty
#
# Away from a laptop? The same thing lives at /ops/<OPS_KEY> — queue counts,
# stuck rows with their errors, and a Flush button, on a phone.
#
# Reads SUPABASE_URL and EMAIL_DRAIN_SECRET from .env.local, or the
# environment. Prints the worker's own tally, which is also the diagnosis:
#
#   {"processed":22,"sent":22,"failed":0,"throttled":false}  → all good
#   {"error":"unauthorized"}                                 → secret mismatch
#   {"...,"throttled":true}                                  → ZeptoMail credits
#   {"processed":0,...}                                      → nothing pending
#
# Note: the worker takes 25 rows per run, so with a big backlog run it a few
# times (or use --until-empty).

set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -f .env.local ]]; then
    # shellcheck disable=SC1091
    set -a; source .env.local; set +a
fi

: "${SUPABASE_URL:?Set SUPABASE_URL in .env.local}"
: "${EMAIL_DRAIN_SECRET:?Set EMAIL_DRAIN_SECRET in .env.local}"

FUNCTION_URL="${SUPABASE_URL%/}/functions/v1/send-fyb-email"

drain_once() {
    curl -sS -X POST "$FUNCTION_URL" \
        -H "Content-Type: application/json" \
        -H "x-drain-secret: ${EMAIL_DRAIN_SECRET}" \
        -d '{"drain":true}'
}

if [[ "${1:-}" == "--until-empty" ]]; then
    # Keep draining while rows are still being processed. Stops on an empty
    # batch, on throttling (more calls would fail identically), or after 20
    # rounds so a bug can never spin here forever.
    for _ in $(seq 1 20); do
        response="$(drain_once)"
        echo "$response"

        if [[ "$response" == *'"throttled":true'* ]]; then
            echo "→ Provider throttled (ZeptoMail credits). Rows stay pending; top up and re-run." >&2
            exit 1
        fi
        if [[ "$response" == *'"processed":0'* ]]; then
            echo "→ Queue empty." >&2
            exit 0
        fi
        sleep 2
    done
    echo "→ Stopped after 20 rounds; run again if rows remain." >&2
else
    drain_once
    echo
fi

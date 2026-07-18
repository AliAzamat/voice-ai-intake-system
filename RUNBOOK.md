# Voice Intake — Runbook

## Environment
- `DATABASE_URL` — Postgres connection string (apply `db/schema.sql` first).
- `OPENAI_API_KEY` — for Whisper transcription and LLM extraction.
- `PORT` — defaults to 8080.

## Endpoints
- `POST /webhooks/call` — telephony posts call.completed here; returns 202.
- `GET  /review/queue` — pending intakes, worst confidence first.
- `POST /review/:id` — body `{ "outcome": "approved" | "rejected" }`.
- `GET  /healthz` — load-balancer probe.

## Deploy
1. `docker build -t voice-intake .`
2. Run with `DATABASE_URL` and `OPENAI_API_KEY` set.
3. Point the load balancer's health check at `/healthz`.
4. Configure the telephony provider's webhook to `POST /webhooks/call`.

## Operating
- Watch logs for `confidence` values; a drop in average confidence signals
  an upstream change (worse audio, a provider format change). Run `eval/`.
- The review queue should trend toward empty; a growing queue means low
  extraction quality or too few reviewers.

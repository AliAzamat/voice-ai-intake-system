# Voice AI Intake System

An advanced, end-to-end voice intake pipeline. A telephony provider posts a call webhook; the recording is transcribed with Whisper, structured intake fields are extracted with an LLM, the model's output validated against a strict schema, persisted and surfaced in a prioritized human-review queue. Then the pipeline hardened with guardrails (idempotency, PII redaction, retries), extraction quality evaluated against a labeled gold set, and shipped behind a typed Fastify service ready to deploy. TypeScript, Whisper STT, LLM structured extraction, and webhook-driven processing throughout.

## Stack
- TypeScript
- Node.js
- Fastify
- Whisper
- OpenAI
- Zod
- Webhooks
- PostgreSQL

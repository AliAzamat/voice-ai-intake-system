# Voice AI Intake System

An advanced, end-to-end voice intake pipeline. A telephony provider posts a call webhook; you transcribe the recording with Whisper, extract structured intake fields with an LLM, validate the model's output against a strict schema, persist it, and surface it in a prioritized human-review queue. Then you harden the pipeline with guardrails (idempotency, PII redaction, retries), evaluate extraction quality against a labeled gold set, and ship it behind a typed Fastify service ready to deploy. TypeScript, Whisper STT, LLM structured extraction, and webhook-driven processing throughout.

Built step-by-step with [KhwajaLabs Build](https://khwajalabs.com).

## Stack
- TypeScript
- Node.js
- Fastify
- Whisper
- OpenAI
- Zod
- Webhooks
- PostgreSQL

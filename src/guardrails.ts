import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Idempotency at the START: if we already stored this call, skip the expensive
// transcribe+extract entirely. The UNIQUE constraint is the backstop; this is
// the cheap early exit.
export async function alreadyProcessed(callId: string): Promise<boolean> {
  const res = await pool.query('SELECT 1 FROM intakes WHERE call_id = $1', [callId]);
  return (res.rowCount ?? 0) > 0;
}

// Never log raw transcripts or numbers. Redact phone-like and email-like spans.
export function redact(text: string): string {
  return text
    .replace(/\b\d[\d\s().-]{7,}\d\b/g, '[redacted-number]')
    .replace(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/gi, '[redacted-email]');
}

// Retry a transient async operation (e.g. a 429/500 from the model) with
// exponential backoff. Deterministic failures should NOT be retried by callers.
export async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 200 * 2 ** i)); // 200ms, 400ms, 800ms
    }
  }
  throw lastErr;
}

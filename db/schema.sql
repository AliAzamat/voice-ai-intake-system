-- One row per processed call. We store the structured fields, the confidence,
-- and a status the review queue advances. created_at lets us age the queue.
CREATE TABLE IF NOT EXISTS intakes (
    id              BIGSERIAL PRIMARY KEY,
    call_id         TEXT        NOT NULL UNIQUE,
    full_name       TEXT,
    callback_number TEXT,
    reason          TEXT,
    urgency         TEXT,
    preferred_time  TEXT,
    confidence      REAL        NOT NULL,
    issues          JSONB       NOT NULL DEFAULT '[]',
    status          TEXT        NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The review queue pulls PENDING rows worst-confidence first; index both.
CREATE INDEX IF NOT EXISTS idx_intakes_queue
    ON intakes (status, confidence);

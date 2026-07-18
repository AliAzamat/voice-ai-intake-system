import { Pool } from 'pg';
import { ValidatedIntake } from './validate';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Returns true if a row was inserted, false if this call_id already existed.
export async function saveIntake(callId: string, v: ValidatedIntake): Promise<boolean> {
  const { intake, issues, confidence } = v;
  const res = await pool.query(
    `INSERT INTO intakes
       (call_id, full_name, callback_number, reason, urgency,
        preferred_time, confidence, issues)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (call_id) DO NOTHING`,
    [
      callId,
      intake.full_name,
      intake.callback_number,
      intake.reason,
      intake.urgency,
      intake.preferred_time,
      confidence,
      JSON.stringify(issues),
    ],
  );
  return (res.rowCount ?? 0) > 0;
}

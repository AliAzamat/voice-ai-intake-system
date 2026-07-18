import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export type QueueItem = {
  id: number;
  call_id: string;
  confidence: number;
  issues: { field: string; message: string }[];
  reason: string | null;
};

// Worst confidence first, then oldest — the riskiest, stalest calls surface.
export async function listQueue(limit = 20): Promise<QueueItem[]> {
  const res = await pool.query(
    `SELECT id, call_id, confidence, issues, reason
       FROM intakes
      WHERE status = 'pending'
      ORDER BY confidence ASC, created_at ASC
      LIMIT $1`,
    [limit],
  );
  return res.rows as QueueItem[];
}

// Resolve a reviewed intake. Only a still-pending row can be resolved, so two
// reviewers cannot both close the same item.
export async function resolveIntake(id: number, outcome: 'approved' | 'rejected'): Promise<boolean> {
  const res = await pool.query(
    `UPDATE intakes SET status = $2
      WHERE id = $1 AND status = 'pending'
      RETURNING id`,
    [id, outcome],
  );
  return (res.rowCount ?? 0) > 0;
}

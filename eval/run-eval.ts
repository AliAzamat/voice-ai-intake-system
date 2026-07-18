import fs from 'fs';
import path from 'path';
import { extractIntake } from '../src/extract';
import { validateIntake } from '../src/validate';
import { Intake } from '../src/extract';

type Case = { transcript: string; expected: Intake };
const FIELDS: (keyof Intake)[] = [
  'full_name', 'callback_number', 'reason', 'urgency', 'preferred_time',
];

// Exact match per field; both-null counts as correct (the model rightly
// abstained). reason is fuzzy: a substring match counts (free text varies).
function fieldCorrect(field: keyof Intake, got: string | null, want: string | null): boolean {
  if (got === null || want === null) return got === want;
  if (field === 'reason') return got.toLowerCase().includes(want.toLowerCase());
  return got.trim().toLowerCase() === want.trim().toLowerCase();
}

async function main() {
  const cases: Case[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'gold.json'), 'utf8'),
  );
  let correct = 0;
  const total = cases.length * FIELDS.length;

  for (const c of cases) {
    const got = validateIntake(await extractIntake({ text: c.transcript })).intake;
    for (const f of FIELDS) {
      if (fieldCorrect(f, got[f] as string | null, c.expected[f] as string | null)) {
        correct++;
      } else {
        console.log(`MISS ${f}: got=${JSON.stringify(got[f])} want=${JSON.stringify(c.expected[f])}`);
      }
    }
  }
  console.log(`field accuracy: ${correct}/${total} = ${(correct / total).toFixed(3)}`);
}

main();

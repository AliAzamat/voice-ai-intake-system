import { IntakeJob } from './types';
import { fetchRecording } from './audio';
import { transcribe } from './transcribe';
import { extractIntake } from './extract';
import { validateIntake } from './validate';
import { saveIntake } from './store';
import { alreadyProcessed, redact, withRetry } from './guardrails';

export async function processIntake(job: IntakeJob): Promise<void> {
  // Guardrail 1: skip work we have already done.
  if (await alreadyProcessed(job.call_id)) {
    console.log(`call ${job.call_id}: already processed, skipping`);
    return;
  }

  const recording = await fetchRecording(job.recording_url);
  const transcript = await withRetry(() => transcribe(recording));
  // Guardrail 2: only redacted text ever reaches the logs.
  console.log(`call ${job.call_id}: transcript "${redact(transcript.text).slice(0, 80)}"`);

  // Guardrail 3: retry the model on transient failures.
  const raw = await withRetry(() => extractIntake(transcript));
  const validated = validateIntake(raw);
  await saveIntake(job.call_id, validated);
  console.log(`call ${job.call_id}: stored at confidence ${validated.confidence.toFixed(2)}`);
}

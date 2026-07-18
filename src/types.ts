import { z } from 'zod';

// The telephony provider POSTs this when a call finishes. It is UNTRUSTED
// input from the network, so every field is parsed, never assumed.
export const CallWebhook = z.object({
  event: z.literal('call.completed'),
  call_id: z.string().min(1),
  from_number: z.string().min(1),
  to_number: z.string().min(1),
  recording_url: z.string().url(),
  duration_sec: z.number().int().nonnegative(),
});
export type CallWebhook = z.infer<typeof CallWebhook>;

// One unit of work flowing through the pipeline: transcribe -> extract ->
// validate -> store. We carry the call_id end to end for traceability.
export type IntakeJob = {
  call_id: string;
  recording_url: string;
  from_number: string;
};

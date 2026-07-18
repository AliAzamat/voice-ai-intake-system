import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { Transcript } from './transcribe';

const client = new OpenAI();

// The structured intake we want OUT of a messy transcript. Every field is
// optional because a caller may simply not say their email — and a model must
// be allowed to say "not present" rather than invent one.
export const Intake = z.object({
  full_name: z.string().nullable(),
  callback_number: z.string().nullable(),
  reason: z.string().nullable(),
  urgency: z.enum(['low', 'medium', 'high']).nullable(),
  preferred_time: z.string().nullable(),
});
export type Intake = z.infer<typeof Intake>;

const SYSTEM = `You extract intake fields from a phone-call transcript.
Rules:
- Only use information stated in the transcript.
- If a field was not stated, return null for it. Never guess or invent.
- urgency is your judgement: low, medium, or high, based on what was said.`;

export async function extractIntake(t: Transcript): Promise<Intake> {
  const res = await client.chat.completions.create({
    model: 'gpt-4o-2024-08-06',
    temperature: 0,
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: t.text },
    ],
    response_format: zodResponseFormat(Intake, 'intake'),
  });
  const raw = res.choices[0].message.content ?? '{}';
  return Intake.parse(JSON.parse(raw));
}

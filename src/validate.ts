import { Intake } from './extract';

export type ValidationIssue = { field: string; message: string };

export type ValidatedIntake = {
  intake: Intake;
  issues: ValidationIssue[];
  confidence: number; // 0..1 — drives review-queue priority
};

// A North-American number normalized to 10 digits, or null if it cannot be.
function normalizePhone(raw: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  return digits.length === 10 ? digits : null;
}

// Schema-valid is not the same as business-valid. The model returned a
// WELL-FORMED Intake; here we judge whether it is USABLE.
export function validateIntake(raw: Intake): ValidatedIntake {
  const issues: ValidationIssue[] = [];

  const normalized = normalizePhone(raw.callback_number);
  if (raw.callback_number && !normalized) {
    issues.push({ field: 'callback_number', message: 'not a usable phone number' });
  }
  if (!raw.full_name) {
    issues.push({ field: 'full_name', message: 'missing caller name' });
  }
  if (!raw.reason) {
    issues.push({ field: 'reason', message: 'no reason for the call captured' });
  }

  const intake: Intake = { ...raw, callback_number: normalized };
  // Confidence falls as required fields go missing or malformed.
  const confidence = Math.max(0, 1 - issues.length * 0.34);
  return { intake, issues, confidence };
}

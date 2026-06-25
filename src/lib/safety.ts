export interface SafetyMessage {
  title: string;
  body: string;
  action: string;
  emergency: string;
}

export const CRISIS_SUPPORT: SafetyMessage = {
  title: 'You deserve support right now',
  body: 'You noted thoughts of being better off dead or hurting yourself. This app cannot provide emergency care, but this is a moment to involve a real person.',
  action: 'Reach out to someone you trust now. If you may act on these thoughts or cannot stay safe, contact emergency services immediately.',
  emergency: 'In the US, call or text 988 for the Suicide & Crisis Lifeline. If there is immediate danger, call emergency services.',
};

export function screenerSafetyMessage(flagged?: boolean): SafetyMessage | null {
  return flagged ? CRISIS_SUPPORT : null;
}

export function wellnessDisclaimer(): string {
  return 'MoodSignal is for wellness, self-reflection, and guided practice. It does not diagnose, treat, or replace professional care.';
}

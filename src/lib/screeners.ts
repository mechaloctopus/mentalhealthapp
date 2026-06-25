// Optional, validated self-report screeners (PHQ-9, GAD-7). These are widely-used
// research instruments, included for self-reflection and longitudinal tracking — NOT
// a diagnosis. Item 9 of PHQ-9 touches self-harm; we surface crisis resources if endorsed.

export interface Screener {
  id: 'phq9' | 'gad7';
  title: string;
  subtitle: string;
  lead: string;
  options: { label: string; value: number }[];
  items: string[];
  bands: { max: number; label: string }[];
  sensitiveItem?: number; // index of an item that should trigger care messaging if > 0
}

const FREQ = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
];

export const PHQ9: Screener = {
  id: 'phq9',
  title: 'PHQ-9',
  subtitle: 'Depression check-in',
  lead: 'Over the last 2 weeks, how often have you been bothered by…',
  options: FREQ,
  items: [
    'Little interest or pleasure in doing things',
    'Feeling down, depressed, or hopeless',
    'Trouble falling or staying asleep, or sleeping too much',
    'Feeling tired or having little energy',
    'Poor appetite or overeating',
    'Feeling bad about yourself — or that you are a failure',
    'Trouble concentrating on things',
    'Moving or speaking slowly, or being restless',
    'Thoughts that you would be better off dead, or of hurting yourself',
  ],
  bands: [
    { max: 4, label: 'Minimal' },
    { max: 9, label: 'Mild' },
    { max: 14, label: 'Moderate' },
    { max: 19, label: 'Moderately severe' },
    { max: 27, label: 'Severe' },
  ],
  sensitiveItem: 8,
};

export const GAD7: Screener = {
  id: 'gad7',
  title: 'GAD-7',
  subtitle: 'Anxiety check-in',
  lead: 'Over the last 2 weeks, how often have you been bothered by…',
  options: FREQ,
  items: [
    'Feeling nervous, anxious, or on edge',
    'Not being able to stop or control worrying',
    'Worrying too much about different things',
    'Trouble relaxing',
    'Being so restless that it is hard to sit still',
    'Becoming easily annoyed or irritable',
    'Feeling afraid, as if something awful might happen',
  ],
  bands: [
    { max: 4, label: 'Minimal' },
    { max: 9, label: 'Mild' },
    { max: 14, label: 'Moderate' },
    { max: 21, label: 'Severe' },
  ],
};

export const SCREENERS: Record<'phq9' | 'gad7', Screener> = { phq9: PHQ9, gad7: GAD7 };

export function severity(s: Screener, score: number): string {
  for (const b of s.bands) if (score <= b.max) return b.label;
  return s.bands[s.bands.length - 1].label;
}

export interface ScreenerResult {
  id: 'phq9' | 'gad7';
  score: number;
  severity: string;
  at: number;
  flagged?: boolean; // sensitive item endorsed
}

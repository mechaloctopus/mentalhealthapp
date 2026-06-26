export type ReadinessStatus = 'complete' | 'blocked' | 'manual-check' | 'not-started';
export type ReadinessArea = 'build' | 'privacy' | 'safety' | 'auth' | 'qa' | 'content' | 'accessibility';

export interface ReadinessItem {
  id: string;
  area: ReadinessArea;
  title: string;
  status: ReadinessStatus;
  requiredFor: 'internal-apk' | 'external-beta' | 'store-release';
  note: string;
}

export const RELEASE_READINESS: ReadinessItem[] = [
  {
    id: 'typecheck',
    area: 'build',
    title: 'TypeScript and invariant checks pass',
    status: 'manual-check',
    requiredFor: 'internal-apk',
    note: 'Run npm run check locally or through a working CI run.',
  },
  {
    id: 'debug-apk',
    area: 'build',
    title: 'Debug APK builds',
    status: 'manual-check',
    requiredFor: 'internal-apk',
    note: 'Run npm run build:android:debug or the Android APK workflow and verify the app-debug.apk artifact.',
  },
  {
    id: 'device-smoke-test',
    area: 'qa',
    title: 'Physical Android smoke test passes',
    status: 'manual-check',
    requiredFor: 'internal-apk',
    note: 'Install the APK and test sign-in, baseline, check-ins, practices, rewards, insights, notifications, export, and reset.',
  },
  {
    id: 'privacy-architecture',
    area: 'privacy',
    title: 'Sensitive-data privacy architecture implemented',
    status: 'blocked',
    requiredFor: 'external-beta',
    note: 'Privacy plan exists, but high-sensitivity records still need private/encrypted storage or explicit secure sync.',
  },
  {
    id: 'privacy-policy',
    area: 'privacy',
    title: 'Privacy policy and terms exist',
    status: 'not-started',
    requiredFor: 'external-beta',
    note: 'Required before inviting external testers with real personal data.',
  },
  {
    id: 'safety-route',
    area: 'safety',
    title: 'Dedicated support/safety route reviewed',
    status: 'blocked',
    requiredFor: 'external-beta',
    note: 'Safety copy exists in screeners, but a reviewed route and locale strategy are still required.',
  },
  {
    id: 'auth-decision',
    area: 'auth',
    title: 'Local-only vs account-sync launch decision made',
    status: 'manual-check',
    requiredFor: 'external-beta',
    note: 'Current app is honest local-first. Account sync should remain hidden unless production Firebase is configured and tested.',
  },
  {
    id: 'accessibility-pass',
    area: 'accessibility',
    title: 'VoiceOver/TalkBack pass complete',
    status: 'manual-check',
    requiredFor: 'external-beta',
    note: 'Core labels exist, but full screen-reader, dynamic text, contrast, and reduced-motion QA remain required.',
  },
  {
    id: 'content-attribution',
    area: 'content',
    title: 'Content attribution and rights review complete',
    status: 'not-started',
    requiredFor: 'external-beta',
    note: 'Daily messages and wisdom content need quote/source review before broad distribution.',
  },
];

export function releaseItemsFor(target: ReadinessItem['requiredFor']): ReadinessItem[] {
  const order: Record<ReadinessItem['requiredFor'], number> = {
    'internal-apk': 0,
    'external-beta': 1,
    'store-release': 2,
  };
  return RELEASE_READINESS.filter((item) => order[item.requiredFor] <= order[target]);
}

export function blockingReleaseItems(target: ReadinessItem['requiredFor']): ReadinessItem[] {
  return releaseItemsFor(target).filter((item) => item.status !== 'complete');
}

export function releaseReadinessSummary(target: ReadinessItem['requiredFor']): { total: number; complete: number; blocked: number; manual: number; notStarted: number } {
  const items = releaseItemsFor(target);
  return {
    total: items.length,
    complete: items.filter((item) => item.status === 'complete').length,
    blocked: items.filter((item) => item.status === 'blocked').length,
    manual: items.filter((item) => item.status === 'manual-check').length,
    notStarted: items.filter((item) => item.status === 'not-started').length,
  };
}

import { KEYS } from './storage';

export type DataSensitivity = 'low' | 'medium' | 'high';
export type DataStorageTarget = 'plain-local' | 'private-local' | 'secure-sync';

export interface DataInventoryItem {
  id: string;
  label: string;
  storageKey: string;
  sensitivity: DataSensitivity;
  currentStorage: DataStorageTarget;
  productionTarget: DataStorageTarget;
  exportable: boolean;
  resetClears: boolean;
}

export const DATA_INVENTORY: DataInventoryItem[] = [
  {
    id: 'profile',
    label: 'Local profile',
    storageKey: KEYS.user,
    sensitivity: 'medium',
    currentStorage: 'plain-local',
    productionTarget: 'private-local',
    exportable: true,
    resetClears: true,
  },
  {
    id: 'onboarding',
    label: 'Onboarding status',
    storageKey: KEYS.onboarded,
    sensitivity: 'low',
    currentStorage: 'plain-local',
    productionTarget: 'plain-local',
    exportable: true,
    resetClears: true,
  },
  {
    id: 'baseline',
    label: 'Voice baseline metrics',
    storageKey: KEYS.baseline,
    sensitivity: 'medium',
    currentStorage: 'plain-local',
    productionTarget: 'private-local',
    exportable: true,
    resetClears: true,
  },
  {
    id: 'checkins',
    label: 'Check-ins',
    storageKey: KEYS.checkins,
    sensitivity: 'high',
    currentStorage: 'plain-local',
    productionTarget: 'private-local',
    exportable: true,
    resetClears: true,
  },
  {
    id: 'sessions',
    label: 'Practice sessions',
    storageKey: KEYS.sessions,
    sensitivity: 'medium',
    currentStorage: 'plain-local',
    productionTarget: 'private-local',
    exportable: true,
    resetClears: true,
  },
  {
    id: 'journal',
    label: 'Journal entries',
    storageKey: KEYS.journal,
    sensitivity: 'high',
    currentStorage: 'plain-local',
    productionTarget: 'private-local',
    exportable: true,
    resetClears: true,
  },
  {
    id: 'screeners',
    label: 'Self-report screeners',
    storageKey: KEYS.screeners,
    sensitivity: 'high',
    currentStorage: 'plain-local',
    productionTarget: 'private-local',
    exportable: true,
    resetClears: true,
  },
  {
    id: 'savedMessages',
    label: 'Saved messages',
    storageKey: KEYS.savedMessages,
    sensitivity: 'low',
    currentStorage: 'plain-local',
    productionTarget: 'plain-local',
    exportable: true,
    resetClears: true,
  },
  {
    id: 'preferences',
    label: 'Preferences',
    storageKey: KEYS.prefs,
    sensitivity: 'low',
    currentStorage: 'plain-local',
    productionTarget: 'plain-local',
    exportable: true,
    resetClears: true,
  },
  {
    id: 'sideState',
    label: 'Inner Path state',
    storageKey: 'sideState',
    sensitivity: 'high',
    currentStorage: 'plain-local',
    productionTarget: 'private-local',
    exportable: true,
    resetClears: true,
  },
];

export function highSensitivityItems(): DataInventoryItem[] {
  return DATA_INVENTORY.filter((item) => item.sensitivity === 'high');
}

export function needsPrivateStorage(item: DataInventoryItem): boolean {
  return item.productionTarget === 'private-local' || item.productionTarget === 'secure-sync';
}

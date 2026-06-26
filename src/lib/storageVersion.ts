import { getItem, setItem } from './storage';

export const STORAGE_SCHEMA_VERSION = 1;
const STORAGE_SCHEMA_KEY = 'storageSchemaVersion';

export interface StorageMigrationResult {
  from: number;
  to: number;
  migrated: boolean;
}

export async function ensureStorageSchema(): Promise<StorageMigrationResult> {
  const current = await getItem<number>(STORAGE_SCHEMA_KEY, 0);
  if (current === STORAGE_SCHEMA_VERSION) {
    return { from: current, to: STORAGE_SCHEMA_VERSION, migrated: false };
  }

  // Version 1 is the first declared schema. Existing local data is preserved as-is.
  // Future versions should transform data here before writing the new version marker.
  await setItem(STORAGE_SCHEMA_KEY, STORAGE_SCHEMA_VERSION);
  return { from: current, to: STORAGE_SCHEMA_VERSION, migrated: current !== STORAGE_SCHEMA_VERSION };
}

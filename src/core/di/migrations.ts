import type { SqlDatabase } from '@/shared/infrastructure/db/SqlDatabase';
import { trackingMigrations } from '@/features/tracking';
import { runMigrations } from '@/shared/infrastructure/db/runner';

/**
 * Cross-feature migration ordering lives here — the composition root — not in
 * `shared/` (architecture.md). Each feature owns its migrations' content and
 * exports them through its `index.ts`; this collects them and the generic runner
 * applies them in ascending `version` order (and rejects duplicate versions).
 */
export function bootstrapDatabase(database: SqlDatabase): Promise<void> {
  const all = [...trackingMigrations];
  return runMigrations(database, all);
}

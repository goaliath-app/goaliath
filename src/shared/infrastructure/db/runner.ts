import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * One schema migration. Features own the **content** of their migrations; the
 * **global ordering** across features (unique `version` numbers) is decided in
 * `core/di/`, the composition root — never here (architecture.md, "Database
 * migrations: centralized order, feature-owned content").
 */
export interface Migration {
  version: number; // unique across the whole app, > 0
  name: string; // human-readable, for error messages
  up(database: SQLiteDatabase): Promise<void>;
}

/**
 * Generic migration runner with zero feature knowledge. Tracks the applied
 * schema version in SQLite's `PRAGMA user_version` (0 on a fresh database) and
 * applies, in ascending order, every migration above it — each inside a
 * transaction so a failed migration rolls back whole and the version pointer
 * never advances past it.
 */
export async function runMigrations(
  database: SQLiteDatabase,
  migrations: readonly Migration[],
): Promise<void> {
  const ordered = [...migrations].sort(
    (first, second) => first.version - second.version,
  );
  assertSaneVersions(ordered);

  const row = await database.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version',
  );
  const appliedVersion = row?.user_version ?? 0;

  for (const migration of ordered) {
    if (migration.version <= appliedVersion) continue;
    await database.withTransactionAsync(async () => {
      await migration.up(database);
      // Not injectable, but safe: an integer we validated ourselves above.
      await database.execAsync(`PRAGMA user_version = ${migration.version}`);
    });
  }
}

/** Catch the "two features both claim version N" conflict loudly, not silently. */
function assertSaneVersions(ordered: readonly Migration[]): void {
  let previous: Migration | null = null;
  for (const migration of ordered) {
    if (!Number.isInteger(migration.version) || migration.version <= 0) {
      throw new Error(
        `Migration "${migration.name}" has an invalid version (${migration.version}); versions are positive integers`,
      );
    }
    if (previous !== null && previous.version === migration.version) {
      throw new Error(
        `Migrations "${previous.name}" and "${migration.name}" both claim version ${migration.version}; versions must be unique app-wide`,
      );
    }
    previous = migration;
  }
}

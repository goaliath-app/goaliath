import type { Migration } from '@/shared/infrastructure/db/runner';

/**
 * Live timer state (domain-model §11), kept in its own table outside the
 * historical model. The primary key on `activity_id` means at most one running
 * session per activity; the stricter "only one across the whole app" rule stays
 * in the use case, so relaxing it never touches this schema.
 */
export const migration: Migration = {
  version: 2,
  name: 'create-running-timers',
  async up(database) {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS running_timers (
        activity_id TEXT PRIMARY KEY REFERENCES activities(id),
        occurrence_date TEXT NOT NULL,
        started_at TEXT NOT NULL
      );
    `);
  },
};

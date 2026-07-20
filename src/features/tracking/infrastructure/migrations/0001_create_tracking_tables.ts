import type { Migration } from '@/shared/infrastructure/db/runner';

/**
 * The tracking feature's initial schema. Storage notes (domain-model §0, §5):
 *
 * - Status timelines live in **normalized tables** with a reference to their
 *   owner (`goal_status_periods`, `activity_status_periods`); the mappers
 *   reconstruct them into the aggregate's `statusPeriods` list.
 * - `activity_occurrences` is keyed by `(activity_id, date)` — at most one per
 *   activity per logical day; `save` is an upsert on that key.
 * - `recurrence_rule`, `period_goal` and `progress` are stored as JSON text:
 *   they're polymorphic value objects the schema never queries into, so
 *   flattening them into columns would buy nothing and cost a migration per new
 *   kind. Logical days (`from_day`, `start_date`, `date`) are `YYYY-MM-DD`
 *   strings — CalendarDay's wire format, which sorts chronologically as text.
 */
export const migration: Migration = {
  version: 1,
  name: 'create-tracking-tables',
  async up(database) {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        motivation TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS goal_status_periods (
        goal_id TEXT NOT NULL REFERENCES goals(id),
        status TEXT NOT NULL,
        from_day TEXT NOT NULL,
        PRIMARY KEY (goal_id, from_day)
      );

      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        goal_id TEXT NOT NULL REFERENCES goals(id),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        activity_type TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS activity_status_periods (
        activity_id TEXT NOT NULL REFERENCES activities(id),
        status TEXT NOT NULL,
        from_day TEXT NOT NULL,
        PRIMARY KEY (activity_id, from_day)
      );

      CREATE TABLE IF NOT EXISTS activity_schedules (
        id TEXT PRIMARY KEY,
        activity_id TEXT NOT NULL REFERENCES activities(id),
        recurrence_rule TEXT NOT NULL,
        day_goal INTEGER,
        period_goal TEXT,
        start_date TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_activity_schedules_by_activity
        ON activity_schedules (activity_id, start_date);

      CREATE TABLE IF NOT EXISTS activity_occurrences (
        activity_id TEXT NOT NULL REFERENCES activities(id),
        date TEXT NOT NULL,
        schedule_id TEXT REFERENCES activity_schedules(id),
        status TEXT NOT NULL,
        completed_at TEXT,
        notes TEXT,
        origin TEXT NOT NULL,
        progress TEXT NOT NULL,
        PRIMARY KEY (activity_id, date)
      );
    `);
  },
};

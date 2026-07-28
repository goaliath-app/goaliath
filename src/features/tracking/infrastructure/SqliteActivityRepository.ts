import type { SqlDatabase } from '@/shared/infrastructure/db/SqlDatabase';
import type { Activity, ActivityId } from '../domain/Activity';
import type { ActivityRepository } from '../domain/ports/ActivityRepository';
import { toActivity, type ActivityRow } from './mappers/ActivityMapper';
import type { StatusPeriodRow } from './mappers/StatusPeriodMapper';

interface ActivityStatusPeriodRow extends StatusPeriodRow {
  activity_id: string;
}

/** SQLite adapter for `ActivityRepository`. */
export class SqliteActivityRepository implements ActivityRepository {
  constructor(private readonly database: SqlDatabase) {}

  async findById(id: ActivityId): Promise<Activity | null> {
    const row = await this.database.getFirstAsync<ActivityRow>(
      'SELECT id, goal_id, title, description, activity_type FROM activities WHERE id = ?',
      id,
    );
    if (row === null) return null;

    const periodRows = await this.database.getAllAsync<StatusPeriodRow>(
      // Ascending order: the status-timeline invariant (§0), same as findAll.
      'SELECT status, from_day FROM activity_status_periods WHERE activity_id = ? ORDER BY from_day',
      id,
    );
    return toActivity(row, periodRows);
  }

  async findAll(): Promise<Activity[]> {
    const activityRows = await this.database.getAllAsync<ActivityRow>(
      'SELECT id, goal_id, title, description, activity_type FROM activities',
    );
    // One query for every activity's periods, grouped in memory — not one query
    // per activity. Ascending from_day per activity: the timeline invariant (§0).
    const periodRows = await this.database.getAllAsync<ActivityStatusPeriodRow>(
      'SELECT activity_id, status, from_day FROM activity_status_periods ORDER BY activity_id, from_day',
    );

    const periodsByActivity = new Map<string, StatusPeriodRow[]>();
    for (const periodRow of periodRows) {
      const group = periodsByActivity.get(periodRow.activity_id) ?? [];
      group.push(periodRow);
      periodsByActivity.set(periodRow.activity_id, group);
    }

    return activityRows.map((row) =>
      toActivity(row, periodsByActivity.get(row.id) ?? []),
    );
  }

  /**
   * Writes the activity **and** its status timeline (two tables, §0). Plain
   * statements: the caller owns the atomic boundary via `TransactionRunner`, and
   * SQLite can't nest transactions.
   *
   * Timeline entries are **upserted, never deleted first** — see
   * `SqliteGoalRepository.save` for the reasoning: the timeline only grows, and
   * a failed save should leave existing history intact rather than wipe it.
   */
  async save(activity: Activity): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO activities (id, goal_id, title, description, activity_type)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (id) DO UPDATE SET
         goal_id = excluded.goal_id,
         title = excluded.title,
         description = excluded.description,
         activity_type = excluded.activity_type`,
      activity.id,
      activity.goalId,
      activity.title,
      activity.description,
      activity.activityType,
    );

    for (const period of activity.statusPeriods) {
      await this.database.runAsync(
        `INSERT INTO activity_status_periods (activity_id, status, from_day) VALUES (?, ?, ?)
         ON CONFLICT (activity_id, from_day) DO UPDATE SET status = excluded.status`,
        activity.id,
        period.status,
        period.from,
      );
    }
  }
}

import type { SQLiteDatabase } from 'expo-sqlite';
import type { Activity } from '../domain/Activity';
import type { ActivityRepository } from '../domain/ports/ActivityRepository';
import { toActivity, type ActivityRow } from './mappers/ActivityMapper';
import type { StatusPeriodRow } from './mappers/StatusPeriodMapper';

interface ActivityStatusPeriodRow extends StatusPeriodRow {
  activity_id: string;
}

/** SQLite adapter for `ActivityRepository`. */
export class SqliteActivityRepository implements ActivityRepository {
  constructor(private readonly database: SQLiteDatabase) {}

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
}

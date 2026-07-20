import type { SQLiteDatabase } from 'expo-sqlite';
import type { ActivityId } from '../domain/Activity';
import type { ActivitySchedule } from '../domain/ActivitySchedule';
import type { ActivityScheduleRepository } from '../domain/ports/ActivityScheduleRepository';
import {
  toActivitySchedule,
  type ActivityScheduleRow,
} from './mappers/ActivityScheduleMapper';

/** SQLite adapter for `ActivityScheduleRepository`. */
export class SqliteActivityScheduleRepository
  implements ActivityScheduleRepository
{
  constructor(private readonly database: SQLiteDatabase) {}

  async findByActivityId(activityId: ActivityId): Promise<ActivitySchedule[]> {
    const rows = await this.database.getAllAsync<ActivityScheduleRow>(
      // Ascending start_date: the change-point invariant `scheduleOn` relies on (§3).
      `SELECT id, activity_id, recurrence_rule, day_goal, period_goal, start_date
         FROM activity_schedules WHERE activity_id = ? ORDER BY start_date`,
      activityId,
    );
    return rows.map(toActivitySchedule);
  }
}

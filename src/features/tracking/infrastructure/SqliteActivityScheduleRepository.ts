import type { SqlDatabase } from '@/shared/infrastructure/db/SqlDatabase';
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
  constructor(private readonly database: SqlDatabase) {}

  async findByActivityId(activityId: ActivityId): Promise<ActivitySchedule[]> {
    const rows = await this.database.getAllAsync<ActivityScheduleRow>(
      // Ascending start_date: the change-point invariant `scheduleOn` relies on (§3).
      `SELECT id, activity_id, recurrence_rule, day_goal, period_goal, start_date
         FROM activity_schedules WHERE activity_id = ? ORDER BY start_date`,
      activityId,
    );
    return rows.map(toActivitySchedule);
  }

  async save(schedule: ActivitySchedule): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO activity_schedules
         (id, activity_id, recurrence_rule, day_goal, period_goal, start_date)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (id) DO UPDATE SET
         activity_id = excluded.activity_id,
         recurrence_rule = excluded.recurrence_rule,
         day_goal = excluded.day_goal,
         period_goal = excluded.period_goal,
         start_date = excluded.start_date`,
      schedule.id,
      schedule.activityId,
      // The polymorphic value objects are stored as JSON: the schema never
      // queries into them, so flattening would cost a migration per new kind.
      JSON.stringify(schedule.recurrenceRule),
      schedule.dayGoal,
      schedule.periodGoal === null ? null : JSON.stringify(schedule.periodGoal),
      schedule.startDate,
    );
  }
}

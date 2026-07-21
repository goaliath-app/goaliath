import type { SQLiteDatabase } from 'expo-sqlite';
import type { ActivityId } from '../domain/Activity';
import type { RunningTimer } from '../domain/RunningTimer';
import type { RunningTimerRepository } from '../domain/ports/RunningTimerRepository';
import {
  toRunningTimer,
  toRunningTimerRow,
  type RunningTimerRow,
} from './mappers/RunningTimerMapper';

/** SQLite adapter for `RunningTimerRepository` (domain-model §11). */
export class SqliteRunningTimerRepository implements RunningTimerRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async findAll(): Promise<RunningTimer[]> {
    const rows = await this.database.getAllAsync<RunningTimerRow>(
      'SELECT activity_id, occurrence_date, started_at FROM running_timers',
    );
    return rows.map(toRunningTimer);
  }

  async findByActivityId(activityId: ActivityId): Promise<RunningTimer | null> {
    const row = await this.database.getFirstAsync<RunningTimerRow>(
      `SELECT activity_id, occurrence_date, started_at
         FROM running_timers WHERE activity_id = ?`,
      activityId,
    );
    return row === null ? null : toRunningTimer(row);
  }

  async save(timer: RunningTimer): Promise<void> {
    const row = toRunningTimerRow(timer);
    await this.database.runAsync(
      `INSERT INTO running_timers (activity_id, occurrence_date, started_at)
       VALUES (?, ?, ?)
       ON CONFLICT (activity_id) DO UPDATE SET
         occurrence_date = excluded.occurrence_date,
         started_at = excluded.started_at`,
      row.activity_id,
      row.occurrence_date,
      row.started_at,
    );
  }

  async remove(activityId: ActivityId): Promise<void> {
    await this.database.runAsync(
      'DELETE FROM running_timers WHERE activity_id = ?',
      activityId,
    );
  }
}

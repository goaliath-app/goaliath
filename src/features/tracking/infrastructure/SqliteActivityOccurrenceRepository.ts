import type { SqlDatabase } from '@/shared/infrastructure/db/SqlDatabase';
import type { ActivityId } from '../domain/Activity';
import type { ActivityOccurrence } from '../domain/ActivityOccurrence';
import type { ActivityOccurrenceRepository } from '../domain/ports/ActivityOccurrenceRepository';
import type { CalendarDay } from '@/shared/domain/time/CalendarDay';
import {
  toActivityOccurrence,
  toActivityOccurrenceRow,
  type ActivityOccurrenceRow,
} from './mappers/ActivityOccurrenceMapper';

/** SQLite adapter for `ActivityOccurrenceRepository`. */
export class SqliteActivityOccurrenceRepository
  implements ActivityOccurrenceRepository
{
  constructor(private readonly database: SqlDatabase) {}

  async findByActivityAndDate(
    activityId: ActivityId,
    date: CalendarDay,
  ): Promise<ActivityOccurrence | null> {
    const row = await this.database.getFirstAsync<ActivityOccurrenceRow>(
      `SELECT activity_id, date, schedule_id, status, completed_at, notes, origin, progress
         FROM activity_occurrences WHERE activity_id = ? AND date = ?`,
      activityId,
      date,
    );
    return row === null ? null : toActivityOccurrence(row);
  }

  async findByActivityInRange(
    activityId: ActivityId,
    from: CalendarDay,
    to: CalendarDay,
  ): Promise<ActivityOccurrence[]> {
    // `date` is a zero-padded YYYY-MM-DD string, so BETWEEN compares it
    // chronologically without any date parsing.
    const rows = await this.database.getAllAsync<ActivityOccurrenceRow>(
      `SELECT activity_id, date, schedule_id, status, completed_at, notes, origin, progress
         FROM activity_occurrences
        WHERE activity_id = ? AND date BETWEEN ? AND ?
        ORDER BY date`,
      activityId,
      from,
      to,
    );
    return rows.map(toActivityOccurrence);
  }

  async save(occurrence: ActivityOccurrence): Promise<void> {
    const row = toActivityOccurrenceRow(occurrence);
    // Upsert on the (activity_id, date) identity (§5): editing a day updates its
    // single record, never creates a second one.
    await this.database.runAsync(
      `INSERT INTO activity_occurrences
         (activity_id, date, schedule_id, status, completed_at, notes, origin, progress)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (activity_id, date) DO UPDATE SET
         schedule_id = excluded.schedule_id,
         status = excluded.status,
         completed_at = excluded.completed_at,
         notes = excluded.notes,
         origin = excluded.origin,
         progress = excluded.progress`,
      row.activity_id,
      row.date,
      row.schedule_id,
      row.status,
      row.completed_at,
      row.notes,
      row.origin,
      row.progress,
    );
  }
}

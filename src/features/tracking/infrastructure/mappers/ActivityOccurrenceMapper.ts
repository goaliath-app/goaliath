import type { ActivityId } from '@/features/tracking/domain/Activity';
import type {
  ActivityOccurrence,
  OccurrenceOrigin,
  OccurrenceProgress,
  OccurrenceStatus,
} from '@/features/tracking/domain/ActivityOccurrence';
import type { ScheduleId } from '@/features/tracking/domain/ActivitySchedule';
import type { CalendarDay } from '@/shared/domain/time/CalendarDay';

export interface ActivityOccurrenceRow {
  activity_id: string;
  date: string;
  schedule_id: string | null;
  status: string;
  completed_at: string | null; // ISO-8601 instant
  notes: string | null;
  origin: string;
  progress: string; // JSON, shape keyed by the activity's type (§5)
}

/**
 * Bidirectional: occurrences are the slice's only written aggregate, so this
 * mapper handles both directions. `completedAt` is a real instant (not a
 * logical day), stored as an ISO string; `progress` is stored as JSON because
 * its shape depends on the activityType and the schema never queries inside it.
 */
export function toActivityOccurrence(
  row: ActivityOccurrenceRow,
): ActivityOccurrence {
  return {
    activityId: row.activity_id as ActivityId,
    date: row.date as CalendarDay,
    scheduleId: row.schedule_id as ScheduleId | null,
    status: row.status as OccurrenceStatus,
    completedAt: row.completed_at === null ? null : new Date(row.completed_at),
    notes: row.notes,
    origin: row.origin as OccurrenceOrigin,
    progress: JSON.parse(row.progress) as OccurrenceProgress,
  };
}

export function toActivityOccurrenceRow(
  occurrence: ActivityOccurrence,
): ActivityOccurrenceRow {
  return {
    activity_id: occurrence.activityId,
    date: occurrence.date,
    schedule_id: occurrence.scheduleId,
    status: occurrence.status,
    completed_at:
      occurrence.completedAt === null
        ? null
        : occurrence.completedAt.toISOString(),
    notes: occurrence.notes,
    origin: occurrence.origin,
    progress: JSON.stringify(occurrence.progress),
  };
}

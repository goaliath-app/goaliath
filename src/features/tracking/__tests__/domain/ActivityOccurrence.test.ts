import type { ActivityId } from '@/features/tracking/domain/Activity';
import {
  isComplete,
  type ActivityOccurrence,
  type OccurrenceStatus,
} from '@/features/tracking/domain/ActivityOccurrence';
import type { ScheduleId } from '@/features/tracking/domain/ActivitySchedule';
import { emptyChecklistProgress } from '@/features/tracking/domain/activityTypes/checklist';
import type { CalendarDay } from '@/shared/domain/time/CalendarDay';

const activityId = (value: string): ActivityId => value as ActivityId;
const scheduleId = (value: string): ScheduleId => value as ScheduleId;
const day = (value: string): CalendarDay => value as CalendarDay;

const checklistOccurrence = (
  status: OccurrenceStatus,
): ActivityOccurrence => ({
  activityId: activityId('activity-1'),
  scheduleId: scheduleId('schedule-1'),
  date: day('2024-01-15'),
  status,
  completedAt: status === 'done' ? new Date('2024-01-15T09:00:00Z') : null,
  notes: null,
  origin: 'recurrence',
  progress: emptyChecklistProgress(),
});

describe('isComplete', () => {
  it('is true for a done occurrence', () => {
    expect(isComplete(checklistOccurrence('done'))).toBe(true);
  });

  it('is false for a pending occurrence', () => {
    expect(isComplete(checklistOccurrence('pending'))).toBe(false);
  });
});

describe('checklist progress', () => {
  it('starts empty (a checklist day tracks nothing beyond its status)', () => {
    expect(emptyChecklistProgress()).toEqual({});
  });
});

describe('manual occurrence (future-features invariant 3)', () => {
  it('can exist with no schedule on any date', () => {
    const manual: ActivityOccurrence = {
      ...checklistOccurrence('done'),
      scheduleId: null,
      origin: 'manual',
      date: day('2024-02-18'), // any date, even a Sunday a weekly recurrence never generated
    };
    expect(manual.scheduleId).toBeNull();
    expect(manual.origin).toBe('manual');
  });
});

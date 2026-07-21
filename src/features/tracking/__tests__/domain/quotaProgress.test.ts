import type { ActivityId } from '@/features/tracking/domain/Activity';
import type { ActivityOccurrence } from '@/features/tracking/domain/ActivityOccurrence';
import type { ScheduleId } from '@/features/tracking/domain/ActivitySchedule';
import {
  behaviourFor,
  isMeasurable,
} from '@/features/tracking/domain/activityTypes/registry';
import { quotaPeriodProgress } from '@/features/tracking/domain/quotaProgress';
import type { CalendarDay } from '@/shared/domain/time/CalendarDay';

const occurrence = (
  date: string,
  status: 'done' | 'pending',
  progress: object,
): ActivityOccurrence => ({
  activityId: 'activity-1' as ActivityId,
  scheduleId: 'schedule-1' as ScheduleId,
  date: date as CalendarDay,
  status,
  completedAt: status === 'done' ? new Date(`${date}T09:00:00Z`) : null,
  notes: null,
  origin: 'quotaOptIn',
  progress: progress as ActivityOccurrence['progress'],
});

const reps = (count: number) => ({
  repetitions: Array.from({ length: count }, () => ({
    at: '2024-06-15T09:00:00.000Z',
  })),
});

const loggedSeconds = (seconds: number) => ({
  intervals: [
    {
      start: '2024-06-15T07:00:00.000Z',
      end: new Date(
        Date.parse('2024-06-15T07:00:00.000Z') + seconds * 1000,
      ).toISOString(),
    },
  ],
});

describe('registry', () => {
  it('exposes each type\'s metric', () => {
    expect(behaviourFor('checklist').metric).toBe('none');
    expect(behaviourFor('counter').metric).toBe('count');
    expect(behaviourFor('timer').metric).toBe('duration');
  });

  it('identifies which types produce a measurable quantity', () => {
    expect(isMeasurable('checklist')).toBe(false);
    expect(isMeasurable('counter')).toBe(true);
    expect(isMeasurable('timer')).toBe(true);
  });
});

describe('quotaPeriodProgress — completedDays', () => {
  it('counts only the days that count as done', () => {
    const progress = quotaPeriodProgress(
      [
        occurrence('2024-06-10', 'done', {}),
        occurrence('2024-06-11', 'pending', {}),
        occurrence('2024-06-12', 'done', {}),
      ],
      { aggregate: 'completedDays', amount: 3 },
      behaviourFor('checklist'),
    );
    expect(progress).toEqual({ current: 2, target: 3 });
  });
});

describe('quotaPeriodProgress — metricSum', () => {
  it('sums a counter\'s repetitions across the period', () => {
    const progress = quotaPeriodProgress(
      [
        occurrence('2024-06-10', 'done', reps(4)),
        occurrence('2024-06-12', 'pending', reps(3)), // counts even while pending
      ],
      { aggregate: 'metricSum', amount: 12 },
      behaviourFor('counter'),
    );
    expect(progress).toEqual({ current: 7, target: 12 });
  });

  it('sums a timer\'s seconds across the period', () => {
    const progress = quotaPeriodProgress(
      [
        occurrence('2024-06-10', 'done', loggedSeconds(600)),
        occurrence('2024-06-12', 'pending', loggedSeconds(900)),
      ],
      { aggregate: 'metricSum', amount: 7200 },
      behaviourFor('timer'),
    );
    expect(progress).toEqual({ current: 1500, target: 7200 });
  });

  it('reports unscoreable (null) for a type with no metric, not a misleading 0', () => {
    const progress = quotaPeriodProgress(
      [occurrence('2024-06-10', 'done', {})],
      { aggregate: 'metricSum', amount: 10 },
      behaviourFor('checklist'),
    );
    expect(progress).toBeNull();
  });
});

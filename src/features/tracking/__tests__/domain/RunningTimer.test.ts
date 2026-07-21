import { elapsedSeconds } from '@/features/tracking/domain/RunningTimer';
import type { RunningTimer } from '@/features/tracking/domain/RunningTimer';
import type { ActivityId } from '@/features/tracking/domain/Activity';
import type { CalendarDay } from '@/shared/domain/time/CalendarDay';

const timer: RunningTimer = {
  activityId: 'activity-1' as ActivityId,
  occurrenceDate: '2024-06-15' as CalendarDay,
  startedAt: new Date('2024-06-15T07:00:00Z'),
};

describe('elapsedSeconds', () => {
  it('counts the seconds since it started', () => {
    expect(elapsedSeconds(timer, new Date('2024-06-15T07:10:00Z'))).toBe(600);
  });

  it('floors partial seconds', () => {
    expect(elapsedSeconds(timer, new Date('2024-06-15T07:00:09.900Z'))).toBe(9);
  });

  it('never reports negative time if the clock moved backwards', () => {
    expect(elapsedSeconds(timer, new Date('2024-06-15T06:59:00Z'))).toBe(0);
  });
});

import { type Activity, type ActivityId } from '@/features/tracking/domain/Activity';
import type { ActivityOccurrence } from '@/features/tracking/domain/ActivityOccurrence';
import type { ActivityOccurrenceRepository } from '@/features/tracking/domain/ports/ActivityOccurrenceRepository';
import type { ActivityRepository } from '@/features/tracking/domain/ports/ActivityRepository';
import {
  type ActivitySchedule,
  type ScheduleId,
} from '@/features/tracking/domain/ActivitySchedule';
import type { ActivityScheduleRepository } from '@/features/tracking/domain/ports/ActivityScheduleRepository';
import { emptyChecklistProgress } from '@/features/tracking/domain/activityTypes/checklist';
import type { Goal, GoalId } from '@/features/tracking/domain/Goal';
import type { GoalRepository } from '@/features/tracking/domain/ports/GoalRepository';
import type { StatusPeriod } from '@/features/tracking/domain/StatusPeriod';
import type { CalendarDay } from '@/shared/domain/time/CalendarDay';

// --- branded-id / day cast helpers -----------------------------------------
export const asGoalId = (value: string): GoalId => value as GoalId;
export const asActivityId = (value: string): ActivityId => value as ActivityId;
export const asScheduleId = (value: string): ScheduleId => value as ScheduleId;
export const asDay = (value: string): CalendarDay => value as CalendarDay;

export const activeSince = (from: string): StatusPeriod[] => [
  { status: 'active', from: asDay(from) },
];

// --- entity builders (arbitrary test data, not production creation) ---------
export const buildGoal = (over: Partial<Goal> = {}): Goal => ({
  id: asGoalId('goal-1'),
  title: 'Get fit',
  motivation: 'Feel better',
  statusPeriods: activeSince('2024-01-01'),
  ...over,
});

export const buildActivity = (over: Partial<Activity> = {}): Activity => ({
  id: asActivityId('activity-1'),
  goalId: asGoalId('goal-1'),
  title: 'Meditate',
  description: '',
  activityType: 'checklist',
  statusPeriods: activeSince('2024-01-01'),
  ...over,
});

export const buildDailyChecklistSchedule = (
  // Overrides limited to non-discriminant fields, so the result stays a valid
  // FixedSchedule (changing recurrence/periodGoal is what the union guards).
  over: Partial<Pick<ActivitySchedule, 'id' | 'activityId' | 'dayGoal' | 'startDate'>> = {},
): ActivitySchedule => ({
  id: asScheduleId('schedule-1'),
  activityId: asActivityId('activity-1'),
  recurrenceRule: { kind: 'daily' },
  dayGoal: null,
  periodGoal: null,
  startDate: asDay('2024-01-01'),
  ...over,
});

/** A weekly-quota schedule: N completed days per week, no fixed due days (§4). */
export const buildQuotaWeekSchedule = (
  completedDays: number,
  over: Partial<Pick<ActivitySchedule, 'id' | 'activityId' | 'startDate'>> = {},
): ActivitySchedule => ({
  id: asScheduleId('schedule-1'),
  activityId: asActivityId('activity-1'),
  recurrenceRule: { kind: 'quota', period: 'week' },
  dayGoal: null,
  periodGoal: { aggregate: 'completedDays', amount: completedDays },
  startDate: asDay('2024-01-01'),
  ...over,
});

/** A daily counter schedule with a numeric per-day goal (reps). */
export const buildDailyCounterSchedule = (
  dayGoal: number,
  over: Partial<Pick<ActivitySchedule, 'id' | 'activityId' | 'startDate'>> = {},
): ActivitySchedule => ({
  id: asScheduleId('schedule-1'),
  activityId: asActivityId('activity-1'),
  recurrenceRule: { kind: 'daily' },
  dayGoal,
  periodGoal: null,
  startDate: asDay('2024-01-01'),
  ...over,
});

// --- in-memory repositories (fakes implementing the domain ports) ----------
export class InMemoryGoalRepository implements GoalRepository {
  constructor(private readonly goals: Goal[] = []) {}
  async findById(id: GoalId): Promise<Goal | null> {
    return this.goals.find((goal) => goal.id === id) ?? null;
  }
}

export class InMemoryActivityRepository implements ActivityRepository {
  constructor(private readonly activities: Activity[] = []) {}
  async findAll(): Promise<Activity[]> {
    return this.activities;
  }
}

export class InMemoryActivityScheduleRepository
  implements ActivityScheduleRepository
{
  constructor(private readonly schedules: ActivitySchedule[] = []) {}
  async findByActivityId(activityId: ActivityId): Promise<ActivitySchedule[]> {
    return this.schedules.filter(
      (schedule) => schedule.activityId === activityId,
    );
  }
}

export class InMemoryActivityOccurrenceRepository
  implements ActivityOccurrenceRepository
{
  private readonly store = new Map<string, ActivityOccurrence>();

  constructor(seed: ActivityOccurrence[] = []) {
    seed.forEach((occurrence) => this.store.set(keyOf(occurrence.activityId, occurrence.date), occurrence));
  }

  async findByActivityAndDate(
    activityId: ActivityId,
    date: CalendarDay,
  ): Promise<ActivityOccurrence | null> {
    return this.store.get(keyOf(activityId, date)) ?? null;
  }

  async findByActivityInRange(
    activityId: ActivityId,
    from: CalendarDay,
    to: CalendarDay,
  ): Promise<ActivityOccurrence[]> {
    return [...this.store.values()]
      .filter(
        (occurrence) =>
          occurrence.activityId === activityId &&
          occurrence.date >= from &&
          occurrence.date <= to,
      )
      .sort((first, second) => first.date.localeCompare(second.date));
  }

  async save(occurrence: ActivityOccurrence): Promise<void> {
    this.store.set(keyOf(occurrence.activityId, occurrence.date), occurrence);
  }
}

const keyOf = (activityId: ActivityId, date: CalendarDay): string =>
  `${activityId}|${date}`;

export { emptyChecklistProgress };

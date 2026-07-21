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
import type { RunningTimer } from '@/features/tracking/domain/RunningTimer';
import type { RunningTimerRepository } from '@/features/tracking/domain/ports/RunningTimerRepository';
import type { StatusPeriod } from '@/features/tracking/domain/StatusPeriod';
import type { IdGenerator } from '@/shared/domain/ports/IdGenerator';
import type { TransactionRunner } from '@/shared/domain/ports/TransactionRunner';
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
  async findAll(): Promise<Goal[]> {
    return [...this.goals];
  }
  async save(goal: Goal): Promise<void> {
    const existing = this.goals.findIndex((candidate) => candidate.id === goal.id);
    if (existing === -1) this.goals.push(goal);
    else this.goals[existing] = goal;
  }
}

export class InMemoryActivityRepository implements ActivityRepository {
  constructor(private readonly activities: Activity[] = []) {}
  async findAll(): Promise<Activity[]> {
    return this.activities;
  }
  async save(activity: Activity): Promise<void> {
    const existing = this.activities.findIndex(
      (candidate) => candidate.id === activity.id,
    );
    if (existing === -1) this.activities.push(activity);
    else this.activities[existing] = activity;
  }
}

export class InMemoryActivityScheduleRepository
  implements ActivityScheduleRepository
{
  constructor(private readonly schedules: ActivitySchedule[] = []) {}
  async findByActivityId(activityId: ActivityId): Promise<ActivitySchedule[]> {
    return this.schedules
      .filter((schedule) => schedule.activityId === activityId)
      .sort((first, second) => first.startDate.localeCompare(second.startDate));
  }
  async save(schedule: ActivitySchedule): Promise<void> {
    const existing = this.schedules.findIndex(
      (candidate) => candidate.id === schedule.id,
    );
    if (existing === -1) this.schedules.push(schedule);
    else this.schedules[existing] = schedule;
  }
}

/** Deterministic ids so tests can assert on them: `id-1`, `id-2`, … */
export class SequentialIdGenerator implements IdGenerator {
  private issued = 0;
  constructor(private readonly prefix = 'id') {}
  newId(): string {
    this.issued += 1;
    return `${this.prefix}-${this.issued}`;
  }
}

/**
 * Runs the work directly and records that it was asked to. It can't simulate a
 * rollback (the in-memory repos have no undo) — real atomicity is SQLite's job.
 * What it *can* verify is that the use case wrapped its writes at all, and that
 * validation happens before any of them.
 */
export class PassthroughTransactionRunner implements TransactionRunner {
  transactions = 0;
  async runInTransaction<Result>(work: () => Promise<Result>): Promise<Result> {
    this.transactions += 1;
    return work();
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

export class InMemoryRunningTimerRepository implements RunningTimerRepository {
  private readonly timers = new Map<string, RunningTimer>();

  constructor(seed: RunningTimer[] = []) {
    seed.forEach((timer) => this.timers.set(timer.activityId, timer));
  }

  async findAll(): Promise<RunningTimer[]> {
    return [...this.timers.values()];
  }

  async findByActivityId(activityId: ActivityId): Promise<RunningTimer | null> {
    return this.timers.get(activityId) ?? null;
  }

  async save(timer: RunningTimer): Promise<void> {
    this.timers.set(timer.activityId, timer);
  }

  async remove(activityId: ActivityId): Promise<void> {
    this.timers.delete(activityId);
  }
}

const keyOf = (activityId: ActivityId, date: CalendarDay): string =>
  `${activityId}|${date}`;

export { emptyChecklistProgress };

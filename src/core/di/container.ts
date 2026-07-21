import type { SQLiteDatabase } from 'expo-sqlite';
import {
  SqliteActivityOccurrenceRepository,
  SqliteActivityRepository,
  SqliteActivityScheduleRepository,
  SqliteGoalRepository,
  SqliteRunningTimerRepository,
  type ActivityOccurrenceRepository,
  type ActivityRepository,
  type ActivityScheduleRepository,
  type GoalRepository,
  type RunningTimerRepository,
} from '@/features/tracking';

/**
 * The composition root's wiring (architecture.md, rule 7): the one place that
 * decides which concrete adapter implements each port. Everything else depends
 * on the interfaces only. Also carries app-level config the use cases need
 * (`now`, `dayStartHour`) so the domain/application stay pure and injectable.
 */
export interface Container {
  goalRepository: GoalRepository;
  activityRepository: ActivityRepository;
  activityScheduleRepository: ActivityScheduleRepository;
  activityOccurrenceRepository: ActivityOccurrenceRepository;
  runningTimerRepository: RunningTimerRepository;
  now: () => Date;
  dayStartHour: number;
  weekStart: number; // ISO weekday (1 = Monday … 7 = Sunday)
}

export function createContainer(database: SQLiteDatabase): Container {
  return {
    goalRepository: new SqliteGoalRepository(database),
    activityRepository: new SqliteActivityRepository(database),
    activityScheduleRepository: new SqliteActivityScheduleRepository(database),
    activityOccurrenceRepository: new SqliteActivityOccurrenceRepository(database),
    runningTimerRepository: new SqliteRunningTimerRepository(database),
    now: () => new Date(),
    dayStartHour: 0, // TODO: from a future `settings` feature; default = calendar midnight
    // TODO: seed from the device once `settings` exists (mapping its Sunday=1
    // numbering to ISO), and only ever change it forward-only — moving the
    // boundary re-buckets past quota weeks (future-features).
    weekStart: 1, // ISO Monday
  };
}

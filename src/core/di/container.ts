import type { SQLiteDatabase } from 'expo-sqlite';
import {
  SqliteActivityOccurrenceRepository,
  SqliteActivityRepository,
  SqliteActivityScheduleRepository,
  SqliteGoalRepository,
  type ActivityOccurrenceRepository,
  type ActivityRepository,
  type ActivityScheduleRepository,
  type GoalRepository,
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
  now: () => Date;
  dayStartHour: number;
}

export function createContainer(database: SQLiteDatabase): Container {
  return {
    goalRepository: new SqliteGoalRepository(database),
    activityRepository: new SqliteActivityRepository(database),
    activityScheduleRepository: new SqliteActivityScheduleRepository(database),
    activityOccurrenceRepository: new SqliteActivityOccurrenceRepository(database),
    now: () => new Date(),
    dayStartHour: 0, // TODO: from a future `settings` feature; default = calendar midnight
  };
}

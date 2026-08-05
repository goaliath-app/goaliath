/**
 * Public API of the `tracking` feature (architecture.md). Two audiences:
 *
 * - **UI-facing** (consumed by `app/` routes): screens and hooks — added with
 *   the Today screen.
 * - **DI-facing** (consumed only by `core/di/`): ports, adapters, use cases and
 *   migrations. Nothing outside the feature may deep-import past this file.
 */

// Ports (contracts the composition root wires).
export type { ActivityOccurrenceRepository } from './domain/ports/ActivityOccurrenceRepository';
export type { ActivityRepository } from './domain/ports/ActivityRepository';
export type { ActivityScheduleRepository } from './domain/ports/ActivityScheduleRepository';
export type { GoalRepository } from './domain/ports/GoalRepository';
export type { RunningTimerRepository } from './domain/ports/RunningTimerRepository';
export type { TrackingDataCleanupRepository } from './domain/ports/TrackingDataCleanupRepository';

// SQLite adapters.
export { SqliteActivityOccurrenceRepository } from './infrastructure/SqliteActivityOccurrenceRepository';
export { SqliteActivityRepository } from './infrastructure/SqliteActivityRepository';
export { SqliteActivityScheduleRepository } from './infrastructure/SqliteActivityScheduleRepository';
export { SqliteGoalRepository } from './infrastructure/SqliteGoalRepository';
export { SqliteRunningTimerRepository } from './infrastructure/SqliteRunningTimerRepository';
export { SqliteTrackingDataCleanupRepository } from './infrastructure/SqliteTrackingDataCleanupRepository';

// Use cases.
export { createActivity, type GoalSelection } from './application/createActivity';
export { createGoal } from './application/createGoal';
export { deleteAllTrackingData } from './application/deleteAllTrackingData';
export { getDayView } from './application/getDayView';
export { getGoalsOverview } from './application/getGoalsOverview';
export { listGoals } from './application/listGoals';
export { logCounterRepetition } from './application/logCounterRepetition';
export { startTimer } from './application/startTimer';
export { stopTimer } from './application/stopTimer';
export { toggleChecklistDone } from './application/toggleChecklistDone';

// View types the UI consumes.
export type { DayItem, DisplayStatus } from './domain/projection';

// Migrations (content only; global ordering is core/di's job).
export { migrations as trackingMigrations } from './infrastructure/migrations';

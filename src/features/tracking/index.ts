/**
 * Public API of the `tracking` feature (architecture.md). Two audiences:
 *
 * - **UI-facing** (consumed by `app/` routes): screens and hooks — added with
 *   the Today screen.
 * - **DI-facing** (consumed only by `core/di/`): ports, adapters, use cases and
 *   migrations. Nothing outside the feature may deep-import past this file.
 */

// Ports (contracts the composition root wires).
export type { GoalRepository } from './domain/ports/GoalRepository';
export type { ActivityRepository } from './domain/ports/ActivityRepository';
export type { ActivityScheduleRepository } from './domain/ports/ActivityScheduleRepository';
export type { ActivityOccurrenceRepository } from './domain/ports/ActivityOccurrenceRepository';
export type { RunningTimerRepository } from './domain/ports/RunningTimerRepository';

// SQLite adapters.
export { SqliteGoalRepository } from './infrastructure/SqliteGoalRepository';
export { SqliteActivityRepository } from './infrastructure/SqliteActivityRepository';
export { SqliteActivityScheduleRepository } from './infrastructure/SqliteActivityScheduleRepository';
export { SqliteActivityOccurrenceRepository } from './infrastructure/SqliteActivityOccurrenceRepository';
export { SqliteRunningTimerRepository } from './infrastructure/SqliteRunningTimerRepository';

// Use cases.
export { getDayView } from './application/getDayView';
export { toggleChecklistDone } from './application/toggleChecklistDone';
export { logCounterRepetition } from './application/logCounterRepetition';
export { startTimer } from './application/startTimer';
export { stopTimer } from './application/stopTimer';

// View types the UI consumes.
export type { DayItem, DisplayStatus } from './domain/projection';

// Migrations (content only; global ordering is core/di's job).
export { migrations as trackingMigrations } from './infrastructure/migrations';

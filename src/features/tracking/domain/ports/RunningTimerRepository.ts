import type { ActivityId } from '../Activity';
import type { RunningTimer } from '../RunningTimer';

/**
 * Port for the live running-timer records (domain-model §11). A **collection**,
 * not a single slot: the one-at-a-time rule is enforced by the use case at write
 * time, so relaxing it later (parallel timers) touches no storage.
 */
export interface RunningTimerRepository {
  /** Every timer currently running — what the single-timer rule checks. */
  findAll(): Promise<RunningTimer[]>;
  findByActivityId(activityId: ActivityId): Promise<RunningTimer | null>;
  save(timer: RunningTimer): Promise<void>;
  remove(activityId: ActivityId): Promise<void>;
}

import { useCallback, useEffect, useState } from 'react';
import { useDependencies } from '@/core/di/DependencyProvider';
import {
  useInvalidateStoredData,
  useStoredDataRevision,
} from '@/core/providers/StoredDataProvider';
import { createActivity } from '../../application/createActivity';
import type { Goal } from '../../domain/Goal';
import { statusOn } from '../../domain/StatusPeriod';
import {
  getCalendarDay,
  type CalendarDay,
} from '@/shared/domain/time/CalendarDay';
import {
  buildCreateActivityInput,
  type ActivityDraft,
} from '../format/activityDraft';

export interface GoalOption {
  goal: Goal;
  /**
   * A **paused** goal can still be picked (the use case allows it), but the new
   * activity won't show up in Today until the goal is resumed (§0 cascade), so
   * the form has to say so. **Archived** goals are a different case and are not
   * offered at all — see `isSelectableGoal`.
   */
  active: boolean;
}

/**
 * Which goals the picker offers: `active` and `paused`, never `archived`.
 *
 * Archiving is how the user says "I'm done with this", so offering it as a home
 * for something *new* contradicts the act — and unlike pausing, there is no
 * "…until you resume it" story that makes the choice sensible. Goals that have
 * no status yet on `day` (created in the future — not reachable today) are
 * excluded for the same reason: nothing can be said about them.
 */
function isSelectableGoal(goal: Goal, day: CalendarDay): boolean {
  const status = statusOn(goal.statusPeriods, day);
  return status === 'active' || status === 'paused';
}

/**
 * UI hook for the create-activity form: loads the goals the picker offers and
 * submits the draft. Like `useTodayView`, it only wires container deps into the
 * use case — the container exposes repositories, not use cases, so composing
 * `createActivity(deps)` here is the hook's job. No business logic (rule 4);
 * everything the draft needs to be valid lives in `ui/format/activityDraft`.
 */
export function useCreateActivity() {
  const deps = useDependencies();
  const invalidate = useInvalidateStoredData();
  const revision = useStoredDataRevision();
  const [goals, setGoals] = useState<GoalOption[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const today = getCalendarDay(deps.now(), deps.dayStartHour);
      const loaded = await deps.goalRepository.findAll();
      if (!active) return;
      setGoals(
        loaded
          .filter((goal) => isSelectableGoal(goal, today))
          .map((goal) => ({
            goal,
            active: statusOn(goal.statusPeriods, today) === 'active',
          })),
      );
    })();
    return () => {
      active = false;
    };
    // The picker is a reader too: a goal paused or archived elsewhere should
    // stop being offered here without the screen being remounted.
  }, [deps, revision]);

  /** Returns whether the activity was created. */
  const submit = useCallback(
    async (draft: ActivityDraft): Promise<boolean> => {
      const input = buildCreateActivityInput(draft);
      if (input === null) return false;

      setSubmitting(true);
      setFailed(false);
      try {
        await createActivity({
          goals: deps.goalRepository,
          activities: deps.activityRepository,
          schedules: deps.activityScheduleRepository,
          ids: deps.ids,
          transactions: deps.transactions,
          now: deps.now,
          dayStartHour: deps.dayStartHour,
        })(input);
        // A new activity (and possibly a new goal) changes what today looks
        // like, so every reader has to recompute — not just this screen.
        invalidate();
        return true;
      } catch (error) {
        // The form only shows a generic "failed"; without this the actual cause
        // (a transaction error, a missing goal) is lost. Dev-only so it never
        // reaches production logs.
        if (__DEV__) console.error('createActivity failed', error);
        setFailed(true);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [deps, invalidate],
  );

  return { goals, submitting, failed, submit };
}

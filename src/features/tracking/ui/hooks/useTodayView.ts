import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDependencies } from '@/core/di/DependencyProvider';
import {
  useInvalidateStoredData,
  useStoredDataRevision,
} from '@/core/providers/StoredDataProvider';
import { getCalendarDay } from '@/shared/domain/time/CalendarDay';
import { getDayView } from '../../application/getDayView';
import { logCounterRepetition } from '../../application/logCounterRepetition';
import { startTimer } from '../../application/startTimer';
import { stopTimer } from '../../application/stopTimer';
import { toggleChecklistDone } from '../../application/toggleChecklistDone';
import type { ActivityId } from '../../domain/Activity';
import type { DayItem } from '../../domain/projection';
import type { RunningTimer } from '../../domain/RunningTimer';
import type { TodayActions } from '../activityTypes/activityTypeViews';

/**
 * UI hook for the Today screen: loads the projected day plus the live running
 * timers, and exposes the per-type actions the rows call. It only wires
 * container deps into the use cases — no business logic here (rule 4).
 */
export function useTodayView() {
  const deps = useDependencies();
  const revision = useStoredDataRevision();
  const invalidate = useInvalidateStoredData();
  const [items, setItems] = useState<DayItem[] | null>(null);
  const [runningTimers, setRunningTimers] = useState<RunningTimer[]>([]);
  const [nowMs, setNowMs] = useState(() => deps.now().getTime());

  const today = useMemo(
    () => getCalendarDay(deps.now(), deps.dayStartHour),
    [deps],
  );

  const load = useCallback(async () => {
    const view = getDayView({
      activities: deps.activityRepository,
      goals: deps.goalRepository,
      schedules: deps.activityScheduleRepository,
      occurrences: deps.activityOccurrenceRepository,
      now: deps.now,
      dayStartHour: deps.dayStartHour,
      weekStart: deps.weekStart,
    });
    const [dayItems, timers] = await Promise.all([
      view(today),
      deps.runningTimerRepository.findAll(),
    ]);
    setItems(dayItems);
    setRunningTimers(timers);
    setNowMs(deps.now().getTime());
  }, [deps, today]);

  // `revision` is the dependency that makes this reload after *any* write, this
  // screen's or another's — it is read for that effect alone.
  useEffect(() => {
    void load();
  }, [load, revision]);

  // Re-render once a second so a running timer's elapsed time stays live —
  // but only while something is actually running, so an idle screen is quiet.
  const hasRunningTimer = runningTimers.length > 0;
  useEffect(() => {
    if (!hasRunningTimer) return;
    const interval = setInterval(() => setNowMs(deps.now().getTime()), 1000);
    return () => clearInterval(interval);
  }, [hasRunningTimer, deps]);

  const actions = useMemo<TodayActions>(() => {
    const writeDeps = {
      activities: deps.activityRepository,
      schedules: deps.activityScheduleRepository,
      occurrences: deps.activityOccurrenceRepository,
      now: deps.now,
    };
    const timerDeps = { ...writeDeps, runningTimers: deps.runningTimerRepository };

    const toggle = toggleChecklistDone(writeDeps);
    const increment = logCounterRepetition(writeDeps);
    const start = startTimer(timerDeps);
    const stop = stopTimer(timerDeps);

    // Each action invalidates rather than reloading directly: one rule for every
    // writer in the app, instead of each screen remembering to refresh itself.
    return {
      toggleChecklist: async (activityId: ActivityId) => {
        await toggle({ activityId, day: today });
        invalidate();
      },
      incrementCounter: async (activityId: ActivityId) => {
        await increment({ activityId, day: today });
        invalidate();
      },
      startTimer: async (activityId: ActivityId) => {
        await start({ activityId, day: today });
        invalidate();
      },
      stopTimer: async (activityId: ActivityId) => {
        await stop({ activityId });
        invalidate();
      },
    };
  }, [deps, today, invalidate]);

  const runningTimerFor = useCallback(
    (activityId: ActivityId) =>
      runningTimers.find((timer) => timer.activityId === activityId) ?? null,
    [runningTimers],
  );

  return { items, today, actions, runningTimerFor, nowMs };
}

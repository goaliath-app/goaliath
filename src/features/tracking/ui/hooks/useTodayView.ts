import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDependencies } from '@/core/di/DependencyProvider';
import { getCalendarDay } from '@/shared/domain/time/CalendarDay';
import { getDayView } from '../../application/getDayView';
import { logCounterRepetition } from '../../application/logCounterRepetition';
import { toggleChecklistDone } from '../../application/toggleChecklistDone';
import type { ActivityId } from '../../domain/Activity';
import type { DayItem } from '../../domain/projection';
import type { TodayActions } from '../activityTypes/activityTypeViews';

/**
 * UI hook for the Today screen: loads the projected day view and exposes the
 * per-type actions the rows call. It only wires container deps into the use
 * cases — no business logic here (rule 4: `ui/` calls `application/` via hooks).
 */
export function useTodayView() {
  const deps = useDependencies();
  const [items, setItems] = useState<DayItem[] | null>(null);

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
    setItems(await view(today));
  }, [deps, today]);

  useEffect(() => {
    void load();
  }, [load]);

  const actions = useMemo<TodayActions>(() => {
    const scheduleAndOccurrenceDeps = {
      schedules: deps.activityScheduleRepository,
      occurrences: deps.activityOccurrenceRepository,
      now: deps.now,
    };
    const toggle = toggleChecklistDone(scheduleAndOccurrenceDeps);
    const increment = logCounterRepetition(scheduleAndOccurrenceDeps);
    return {
      toggleChecklist: async (activityId: ActivityId) => {
        await toggle({ activityId, day: today });
        await load();
      },
      incrementCounter: async (activityId: ActivityId) => {
        await increment({ activityId, day: today });
        await load();
      },
    };
  }, [deps, today, load]);

  return { items, today, actions };
}

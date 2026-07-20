import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDependencies } from '@/core/di/DependencyProvider';
import { getCalendarDay } from '@/shared/domain/time/CalendarDay';
import { getDayView } from '../../application/getDayView';
import { toggleChecklistDone } from '../../application/toggleChecklistDone';
import type { ActivityId } from '../../domain/Activity';
import type { DayItem } from '../../domain/projection';

/**
 * UI hook for the Today screen: loads the projected day view and exposes a
 * toggle for checking a checklist item off. It only wires container deps into
 * the use cases — no business logic lives here (rule 4: `ui/` calls
 * `application/` through hooks).
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
    });
    setItems(await view(today));
  }, [deps, today]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = useCallback(
    async (activityId: ActivityId) => {
      const action = toggleChecklistDone({
        schedules: deps.activityScheduleRepository,
        occurrences: deps.activityOccurrenceRepository,
        now: deps.now,
      });
      await action({ activityId, day: today });
      await load();
    },
    [deps, today, load],
  );

  return { items, today, toggle };
}

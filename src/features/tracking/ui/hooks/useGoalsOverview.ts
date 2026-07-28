import { useEffect, useState } from 'react';
import { useDependencies } from '@/core/di/DependencyProvider';
import { useStoredDataRevision } from '@/core/providers/StoredDataProvider';
import {
  getGoalsOverview,
  type GoalOverview,
} from '../../application/getGoalsOverview';

/**
 * UI hook for the goals management screen: loads every goal with its activities
 * and their current status. Like the other read hooks it only wires container
 * deps into the use case (rule 4) and re-reads on `revision`, so a goal or
 * activity created elsewhere shows up without remounting.
 */
export function useGoalsOverview() {
  const deps = useDependencies();
  const revision = useStoredDataRevision();
  const [goals, setGoals] = useState<GoalOverview[] | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const overview = await getGoalsOverview({
        goals: deps.goalRepository,
        activities: deps.activityRepository,
        now: deps.now,
        dayStartHour: deps.dayStartHour,
      })();
      if (active) setGoals(overview);
    })();
    return () => {
      active = false;
    };
  }, [deps, revision]);

  return { goals };
}

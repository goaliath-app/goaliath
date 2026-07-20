import type {
  Activity,
  ActivityId,
  ActivityType,
} from '@/features/tracking/domain/Activity';
import type { GoalId } from '@/features/tracking/domain/Goal';
import { toStatusPeriod, type StatusPeriodRow } from './StatusPeriodMapper';

export interface ActivityRow {
  id: string;
  goal_id: string;
  title: string;
  description: string;
  activity_type: string;
}

/** Reassemble an Activity from its row plus its (ascending-ordered) period rows. */
export function toActivity(
  row: ActivityRow,
  periodRows: StatusPeriodRow[],
): Activity {
  return {
    id: row.id as ActivityId,
    goalId: row.goal_id as GoalId,
    title: row.title,
    description: row.description,
    activityType: row.activity_type as ActivityType,
    statusPeriods: periodRows.map(toStatusPeriod),
  };
}

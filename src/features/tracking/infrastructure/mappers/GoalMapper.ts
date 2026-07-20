import type { Goal, GoalId } from '@/features/tracking/domain/Goal';
import { toStatusPeriod, type StatusPeriodRow } from './StatusPeriodMapper';

export interface GoalRow {
  id: string;
  title: string;
  motivation: string;
}

/** Reassemble a Goal from its row plus its (ascending-ordered) period rows. */
export function toGoal(row: GoalRow, periodRows: StatusPeriodRow[]): Goal {
  return {
    id: row.id as GoalId,
    title: row.title,
    motivation: row.motivation,
    statusPeriods: periodRows.map(toStatusPeriod),
  };
}

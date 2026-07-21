import type { SqlDatabase } from '@/shared/infrastructure/db/SqlDatabase';
import type { Goal, GoalId } from '../domain/Goal';
import type { GoalRepository } from '../domain/ports/GoalRepository';
import { toGoal, type GoalRow } from './mappers/GoalMapper';
import type { StatusPeriodRow } from './mappers/StatusPeriodMapper';

interface OwnedStatusPeriodRow extends StatusPeriodRow {
  goal_id: string;
}

/** SQLite adapter for `GoalRepository` (normalized period rows ↔ aggregate). */
export class SqliteGoalRepository implements GoalRepository {
  constructor(private readonly database: SqlDatabase) {}

  async findById(id: GoalId): Promise<Goal | null> {
    const row = await this.database.getFirstAsync<GoalRow>(
      'SELECT id, title, motivation FROM goals WHERE id = ?',
      id,
    );
    if (row === null) return null;

    const periodRows = await this.database.getAllAsync<StatusPeriodRow>(
      // Ascending order: the change-point timeline invariant (§0).
      'SELECT status, from_day FROM goal_status_periods WHERE goal_id = ? ORDER BY from_day',
      id,
    );
    return toGoal(row, periodRows);
  }

  async findAll(): Promise<Goal[]> {
    const rows = await this.database.getAllAsync<GoalRow>(
      'SELECT id, title, motivation FROM goals ORDER BY title',
    );
    // One query for every goal's periods, grouped in memory — not one per goal.
    const periodRows = await this.database.getAllAsync<OwnedStatusPeriodRow>(
      'SELECT goal_id, status, from_day FROM goal_status_periods ORDER BY goal_id, from_day',
    );

    const periodsByGoal = new Map<string, StatusPeriodRow[]>();
    for (const periodRow of periodRows) {
      const group = periodsByGoal.get(periodRow.goal_id) ?? [];
      group.push(periodRow);
      periodsByGoal.set(periodRow.goal_id, group);
    }

    return rows.map((row) => toGoal(row, periodsByGoal.get(row.id) ?? []));
  }

  /**
   * Writes the goal **and** its status timeline, which live in two tables (§0).
   * Plain statements, no transaction of its own: the caller owns the atomic
   * boundary via `TransactionRunner`, and SQLite can't nest transactions.
   *
   * Each timeline entry is **upserted, never deleted first**. The timeline only
   * ever grows (§9 — the plan is edited forward, never rewritten), so there is
   * nothing to clean up, and this keeps one useful property: a save that fails
   * part-way leaves the existing timeline **untouched** instead of destroying it.
   * Deleting first would mean a crash mid-save could wipe a goal's history and
   * leave it with no status at all — which `statusOn` reads as "did not exist".
   *
   * The conflict clause also encodes the one-entry-per-day rule: a second status
   * change on a day already recorded replaces it, most recent wins.
   */
  async save(goal: Goal): Promise<void> {
    await this.database.runAsync(
      `INSERT INTO goals (id, title, motivation) VALUES (?, ?, ?)
       ON CONFLICT (id) DO UPDATE SET title = excluded.title, motivation = excluded.motivation`,
      goal.id,
      goal.title,
      goal.motivation,
    );

    for (const period of goal.statusPeriods) {
      await this.database.runAsync(
        `INSERT INTO goal_status_periods (goal_id, status, from_day) VALUES (?, ?, ?)
         ON CONFLICT (goal_id, from_day) DO UPDATE SET status = excluded.status`,
        goal.id,
        period.status,
        period.from,
      );
    }
  }
}

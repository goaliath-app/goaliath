import type { SQLiteDatabase } from 'expo-sqlite';
import type { Goal, GoalId } from '../domain/Goal';
import type { GoalRepository } from '../domain/ports/GoalRepository';
import { toGoal, type GoalRow } from './mappers/GoalMapper';
import type { StatusPeriodRow } from './mappers/StatusPeriodMapper';

/** SQLite adapter for `GoalRepository` (normalized period rows → aggregate). */
export class SqliteGoalRepository implements GoalRepository {
  constructor(private readonly database: SQLiteDatabase) {}

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
}

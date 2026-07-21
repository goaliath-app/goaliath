import { DatabaseSync } from 'node:sqlite';
import type {
  SqlDatabase,
  SqlParam,
} from '@/shared/infrastructure/db/SqlDatabase';

/**
 * A `SqlDatabase` backed by Node's built-in SQLite, for tests.
 *
 * `expo-sqlite` is a native module and cannot run in the `node` test
 * environment, which left every statement in the adapters unverified. This runs
 * the **same SQL** against a real SQLite engine, so schema, upserts, conflict
 * clauses and constraints are genuinely exercised. What it does *not* prove is
 * the expo binding itself — only that our SQL is correct.
 */
export function createTestDatabase(): SqlDatabase & { close(): void } {
  const database = new DatabaseSync(':memory:');
  // Match production: the connection sets these too, and foreign keys are off by
  // default in SQLite — without this, referential integrity wouldn't be tested.
  database.exec('PRAGMA foreign_keys = ON;');

  return {
    async execAsync(source: string): Promise<void> {
      database.exec(source);
    },

    async runAsync(source: string, ...params: SqlParam[]): Promise<unknown> {
      return database.prepare(source).run(...(params as never[]));
    },

    async getFirstAsync<Row>(
      source: string,
      ...params: SqlParam[]
    ): Promise<Row | null> {
      return (database.prepare(source).get(...(params as never[])) ?? null) as Row | null;
    },

    async getAllAsync<Row>(source: string, ...params: SqlParam[]): Promise<Row[]> {
      return database.prepare(source).all(...(params as never[])) as Row[];
    },

    async withExclusiveTransactionAsync(
      task: () => Promise<void>,
    ): Promise<void> {
      database.exec('BEGIN IMMEDIATE');
      try {
        await task();
        database.exec('COMMIT');
      } catch (error) {
        database.exec('ROLLBACK');
        throw error;
      }
    },

    close(): void {
      database.close();
    },
  };
}

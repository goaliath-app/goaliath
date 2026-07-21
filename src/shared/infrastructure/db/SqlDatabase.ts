/** A value SQLite can bind to a statement parameter. */
export type SqlParam = string | number | null | Uint8Array;

/**
 * The narrow slice of a SQLite driver this codebase actually uses.
 *
 * Adapters depend on **this**, not on `expo-sqlite`'s concrete `SQLiteDatabase`
 * (which satisfies it structurally, so production wiring is unchanged). Two
 * reasons:
 *
 * - **The SQL becomes testable.** `expo-sqlite` is a native module and can't run
 *   in the `node` test environment, so every query, upsert and conflict clause
 *   was previously unverified. Against this interface a plain `node:sqlite`
 *   database can be substituted in tests and the real statements exercised.
 * - It states our actual dependency: five methods, not a vendor class.
 */
export interface SqlDatabase {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, ...params: SqlParam[]): Promise<unknown>;
  getFirstAsync<Row>(source: string, ...params: SqlParam[]): Promise<Row | null>;
  getAllAsync<Row>(source: string, ...params: SqlParam[]): Promise<Row[]>;
  /** Runs `task` in a transaction, committing on success and rolling back on throw. */
  withExclusiveTransactionAsync(task: () => Promise<void>): Promise<void>;
}

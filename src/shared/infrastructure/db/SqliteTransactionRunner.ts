import type { SqlDatabase } from './SqlDatabase';
import type { TransactionRunner } from '@/shared/domain/ports/TransactionRunner';

/**
 * Runs a unit of work inside one SQLite transaction: it commits when the work
 * resolves and rolls back when it throws.
 *
 * Uses the **exclusive** variant so no other query can interleave with the work.
 * The non-exclusive one lets unrelated queries run inside the same transaction
 * window, which would make "all or nothing" a lie — an unrelated write could be
 * rolled back along with ours.
 *
 * Do not nest: SQLite has no nested transactions, which is why repositories keep
 * their `save` methods to plain statements and let the use case own the boundary.
 */
export class SqliteTransactionRunner implements TransactionRunner {
  constructor(private readonly database: SqlDatabase) {}

  async runInTransaction<Result>(work: () => Promise<Result>): Promise<Result> {
    let outcome: Result;
    await this.database.withExclusiveTransactionAsync(async () => {
      outcome = await work();
    });
    // Assigned by the callback above; if `work` threw, the transaction rolled
    // back and this line is never reached.
    return outcome!;
  }
}

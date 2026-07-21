/**
 * Runs a unit of work atomically: either everything inside commits, or nothing
 * does.
 *
 * This exists so **repositories stay per-aggregate**. Creating an activity can
 * write a goal, the activity and its first schedule — three aggregates — and the
 * alternative was one repository method that writes all of them, which drags
 * each repository across aggregate boundaries as new cases appear. Instead each
 * repository saves only its own, and the **use case** declares where the atomic
 * boundary is, which is where that knowledge belongs.
 *
 * Implementations must not nest: the adapter opens a real transaction, and
 * SQLite does not nest them.
 */
export interface TransactionRunner {
  runInTransaction<Result>(work: () => Promise<Result>): Promise<Result>;
}

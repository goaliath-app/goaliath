/**
 * Mints identities for new entities. A **port**, not a plain helper, for two
 * reasons: generating an id is non-deterministic (so tests need to control it),
 * and ids are **client-generated** on purpose — an offline-first app must be
 * able to create entities with no server round-trip, and client ids are what
 * make a future sync merge cleanly (`future-features`).
 *
 * Returns a raw string; the caller brands it (`as GoalId`, `as ActivityId`).
 * Minting is the one place that cast is legitimate.
 */
export interface IdGenerator {
  newId(): string;
}

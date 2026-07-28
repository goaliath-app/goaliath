import type { Activity, ActivityId } from '../Activity';

/**
 * Port for loading Activities. `findAll` returns every Activity regardless of
 * status — the §0 cascade and the projection (§8) decide per day what's active,
 * so filtering by status is a domain concern, not the query's. (A `findActive`
 * optimisation can come later; the slice keeps it simple.)
 */
export interface ActivityRepository {
  /** A single Activity by id, or `null` if none exists. Used by the write
   * use cases to check an occurrence is being written under the activity's real
   * type (the untagged-progress guard, domain-model §5). */
  findById(id: ActivityId): Promise<Activity | null>;
  findAll(): Promise<Activity[]>;
  save(activity: Activity): Promise<void>;
}

import type { Activity } from '../Activity';

/**
 * Port for loading Activities. `findAll` returns every Activity regardless of
 * status — the §0 cascade and the projection (§8) decide per day what's active,
 * so filtering by status is a domain concern, not the query's. (A `findActive`
 * optimisation can come later; the slice keeps it simple.)
 */
export interface ActivityRepository {
  findAll(): Promise<Activity[]>;
  save(activity: Activity): Promise<void>;
}

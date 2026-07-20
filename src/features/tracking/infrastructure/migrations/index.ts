import { migration as createTrackingTables } from './0001_create_tracking_tables';

/**
 * This feature's own migrations — content only. Which features' migrations run,
 * and in what global order, is decided in `core/di/` (architecture.md).
 */
export const migrations = [createTrackingTables];

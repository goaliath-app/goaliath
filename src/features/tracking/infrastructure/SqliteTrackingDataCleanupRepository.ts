import type { SqlDatabase } from '@/shared/infrastructure/db/SqlDatabase';
import type { TrackingDataCleanupRepository } from '../domain/ports/TrackingDataCleanupRepository';

export class SqliteTrackingDataCleanupRepository
  implements TrackingDataCleanupRepository
{
  constructor(private readonly database: SqlDatabase) {}

  async deleteAllData(): Promise<void> {
    await this.database.withExclusiveTransactionAsync(async () => {
      await this.database.execAsync(`
        DELETE FROM activity_occurrences;
        DELETE FROM activity_schedules;
        DELETE FROM activity_status_periods;
        DELETE FROM running_timers;
        DELETE FROM activities;
        DELETE FROM goal_status_periods;
        DELETE FROM goals;
      `);
    });
  }
}

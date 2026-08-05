export interface TrackingDataCleanupRepository {
  deleteAllData(): Promise<void>;
}

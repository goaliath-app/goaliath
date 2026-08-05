import type { TrackingDataCleanupRepository } from '../domain/ports/TrackingDataCleanupRepository';

export interface DeleteAllTrackingDataDeps {
  cleanup: TrackingDataCleanupRepository;
}

export function deleteAllTrackingData(deps: DeleteAllTrackingDataDeps) {
  return async (): Promise<void> => {
    await deps.cleanup.deleteAllData();
  };
}

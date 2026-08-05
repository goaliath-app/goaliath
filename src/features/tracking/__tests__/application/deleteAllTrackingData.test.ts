import { deleteAllTrackingData } from '@/features/tracking/application/deleteAllTrackingData';
import type { TrackingDataCleanupRepository } from '@/features/tracking/domain/ports/TrackingDataCleanupRepository';

class SpyCleanupRepository implements TrackingDataCleanupRepository {
  called = false;

  async deleteAllData(): Promise<void> {
    this.called = true;
  }
}

describe('deleteAllTrackingData', () => {
  it('delegates the delete request to the cleanup repository', async () => {
    const cleanup = new SpyCleanupRepository();
    const action = deleteAllTrackingData({ cleanup });

    await action();

    expect(cleanup.called).toBe(true);
  });
});

import { useDependencies } from '@/core/di/DependencyProvider';
import { useInvalidateStoredData } from '@/core/providers/StoredDataProvider';
import { deleteAllTrackingData } from '@/features/tracking';
import { useCallback } from 'react';

export function useDeleteAllData() {
  const { trackingDataCleanup } = useDependencies();
  const invalidate = useInvalidateStoredData();

  return useCallback(async (): Promise<void> => {
    await deleteAllTrackingData({ cleanup: trackingDataCleanup })();
    invalidate();
  }, [invalidate, trackingDataCleanup]);
}

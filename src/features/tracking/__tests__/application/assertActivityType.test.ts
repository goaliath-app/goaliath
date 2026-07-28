import { assertActivityType } from '@/features/tracking/application/assertActivityType';
import {
  asActivityId,
  buildActivity,
  InMemoryActivityRepository,
} from '../support/trackingFakes';

const activityId = asActivityId('activity-1');

describe('assertActivityType', () => {
  it('resolves when the activity is of the expected type', async () => {
    const activities = new InMemoryActivityRepository([
      buildActivity({ activityType: 'counter' }),
    ]);

    await expect(
      assertActivityType(activities, activityId, 'counter'),
    ).resolves.toBeUndefined();
  });

  it('throws when the activity is a different type', async () => {
    const activities = new InMemoryActivityRepository([
      buildActivity({ activityType: 'checklist' }),
    ]);

    await expect(
      assertActivityType(activities, activityId, 'timer'),
    ).rejects.toThrow(/is a "checklist", not a "timer"/);
  });

  it('throws when no such activity exists', async () => {
    const activities = new InMemoryActivityRepository([]);

    await expect(
      assertActivityType(activities, activityId, 'checklist'),
    ).rejects.toThrow(/no activity/);
  });
});

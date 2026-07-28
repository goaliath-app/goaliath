import { listGoals } from '@/features/tracking/application/listGoals';
import {
  asDay,
  asGoalId,
  buildGoal,
  InMemoryGoalRepository,
} from '../support/trackingFakes';

describe('listGoals', () => {
  it('returns every goal the repository holds', async () => {
    const goals = new InMemoryGoalRepository([
      buildGoal({ id: asGoalId('goal-1'), title: 'Get fit' }),
      buildGoal({ id: asGoalId('goal-2'), title: 'Read more' }),
    ]);

    const result = await listGoals({ goals })();

    expect(result.map((goal) => goal.title)).toEqual(['Get fit', 'Read more']);
  });

  it("does no filtering of its own — status is the caller's concern", async () => {
    const goals = new InMemoryGoalRepository([
      buildGoal({
        id: asGoalId('archived'),
        statusPeriods: [{ status: 'archived', from: asDay('2024-01-01') }],
      }),
    ]);

    const result = await listGoals({ goals })();

    // Even an archived goal comes back; hiding it is a screen decision.
    expect(result).toHaveLength(1);
  });
});

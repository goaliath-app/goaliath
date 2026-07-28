import { getGoalsOverview } from '@/features/tracking/application/getGoalsOverview';
import {
  asActivityId,
  asDay,
  asGoalId,
  buildActivity,
  buildGoal,
  InMemoryActivityRepository,
  InMemoryGoalRepository,
} from '../support/trackingFakes';

const at = (iso: string) => () => new Date(iso);

const setup = (goals: InMemoryGoalRepository, activities: InMemoryActivityRepository) =>
  getGoalsOverview({
    goals,
    activities,
    now: at('2024-06-15T12:00:00Z'),
    dayStartHour: 0,
  });

describe('getGoalsOverview', () => {
  it('groups each goal with its own activities', async () => {
    const goals = new InMemoryGoalRepository([
      buildGoal({ id: asGoalId('fit'), title: 'Get fit' }),
      buildGoal({ id: asGoalId('read'), title: 'Read more' }),
    ]);
    const activities = new InMemoryActivityRepository([
      buildActivity({ id: asActivityId('run'), goalId: asGoalId('fit'), title: 'Run' }),
      buildActivity({ id: asActivityId('swim'), goalId: asGoalId('fit'), title: 'Swim' }),
      buildActivity({ id: asActivityId('novel'), goalId: asGoalId('read'), title: 'Novel' }),
    ]);

    const overview = await setup(goals, activities)();

    expect(overview).toHaveLength(2);
    expect(overview[0].goal.title).toBe('Get fit');
    expect(overview[0].activities.map((a) => a.activity.title)).toEqual([
      'Run',
      'Swim',
    ]);
    expect(overview[1].activities.map((a) => a.activity.title)).toEqual(['Novel']);
  });

  it('reports each entity\'s current status on today', async () => {
    const goals = new InMemoryGoalRepository([
      buildGoal({
        id: asGoalId('fit'),
        statusPeriods: [
          { status: 'active', from: asDay('2024-01-01') },
          { status: 'paused', from: asDay('2024-06-01') },
        ],
      }),
    ]);
    const activities = new InMemoryActivityRepository([
      buildActivity({ id: asActivityId('run'), goalId: asGoalId('fit') }),
    ]);

    const overview = await setup(goals, activities)();

    expect(overview[0].status).toBe('paused');
    expect(overview[0].activities[0].status).toBe('active');
  });

  it('returns a goal with an empty activity list when it has none', async () => {
    const goals = new InMemoryGoalRepository([buildGoal({ id: asGoalId('fit') })]);
    const overview = await setup(goals, new InMemoryActivityRepository([]))();

    expect(overview[0].activities).toEqual([]);
  });
});

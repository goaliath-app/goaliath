import { createActivity } from '@/features/tracking/application/createActivity';
import { createGoal } from '@/features/tracking/application/createGoal';
import { NotFoundError, ValidationError } from '@/shared/domain/errors';
import {
  asDay,
  asGoalId,
  buildGoal,
  InMemoryActivityRepository,
  InMemoryActivityScheduleRepository,
  InMemoryGoalRepository,
  PassthroughTransactionRunner,
  SequentialIdGenerator,
} from '../support/trackingFakes';

const at = (iso: string) => () => new Date(iso);

const setup = (existingGoals: Parameters<typeof buildGoal>[0][] = []) => {
  const goals = new InMemoryGoalRepository(existingGoals.map(buildGoal));
  const activities = new InMemoryActivityRepository([]);
  const schedules = new InMemoryActivityScheduleRepository([]);
  const transactions = new PassthroughTransactionRunner();
  const deps = {
    goals,
    activities,
    schedules,
    ids: new SequentialIdGenerator(),
    transactions,
    now: at('2024-06-15T12:00:00Z'),
    dayStartHour: 0,
  };
  return {
    goals,
    activities,
    schedules,
    transactions,
    create: createActivity(deps),
    createTheGoal: createGoal(deps),
  };
};

const validInput = {
  title: 'Meditate',
  activityType: 'checklist' as const,
  recurrenceRule: { kind: 'daily' } as const,
  dayGoal: null,
  periodGoal: null,
};

describe('createGoal (standalone)', () => {
  it('saves a goal active from today', async () => {
    const { createTheGoal, goals } = setup();
    const goal = await createTheGoal({ title: 'Health' });

    expect(await goals.findById(goal.id)).toEqual(goal);
    expect(goal.statusPeriods).toEqual([
      { status: 'active', from: '2024-06-15' },
    ]);
  });

  it('rejects a blank title without saving anything', async () => {
    const { createTheGoal, goals } = setup();
    await expect(createTheGoal({ title: '  ' })).rejects.toThrow(ValidationError);
    expect(await goals.findAll()).toHaveLength(0);
  });
});

describe('createActivity — with a new goal in the same operation', () => {
  it('creates goal, activity and schedule together, inside one transaction', async () => {
    const { create, goals, activities, schedules, transactions } = setup();

    const activity = await create({
      ...validInput,
      goal: { kind: 'new', title: 'Health' },
    });

    const savedGoals = await goals.findAll();
    expect(savedGoals).toHaveLength(1);
    expect(activity.goalId).toBe(savedGoals[0].id);
    expect(await activities.findAll()).toHaveLength(1);
    expect(await schedules.findByActivityId(activity.id)).toHaveLength(1);
    expect(transactions.transactions).toBe(1);
  });

  it('writes nothing when the activity is invalid, leaving no orphan goal', async () => {
    const { create, goals, activities } = setup();

    await expect(
      create({
        ...validInput,
        title: '   ', // invalid activity, valid goal
        goal: { kind: 'new', title: 'Health' },
      }),
    ).rejects.toThrow(ValidationError);

    expect(await goals.findAll()).toHaveLength(0); // the goal was never saved
    expect(await activities.findAll()).toHaveLength(0);
  });

  it('writes nothing when the new goal itself is invalid', async () => {
    const { create, goals, activities } = setup();

    await expect(
      create({ ...validInput, goal: { kind: 'new', title: '' } }),
    ).rejects.toThrow(ValidationError);

    expect(await goals.findAll()).toHaveLength(0);
    expect(await activities.findAll()).toHaveLength(0);
  });
});

describe('createActivity — with an existing goal', () => {
  const existing = { id: asGoalId('goal-1'), title: 'Health' };

  it('attaches the activity to it', async () => {
    const { create, activities } = setup([existing]);

    const activity = await create({
      ...validInput,
      goal: { kind: 'existing', goalId: asGoalId('goal-1') },
    });

    expect(activity.goalId).toBe('goal-1');
    expect(await activities.findAll()).toHaveLength(1);
  });

  it('refuses a goal that does not exist, writing nothing', async () => {
    const { create, activities } = setup([existing]);

    await expect(
      create({
        ...validInput,
        goal: { kind: 'existing', goalId: asGoalId('ghost') },
      }),
    ).rejects.toThrow(NotFoundError);

    // No activity means no schedule either — they're only ever written together.
    expect(await activities.findAll()).toHaveLength(0);
  });

  it('accepts a paused goal (the activity is simply hidden until it resumes)', async () => {
    const paused = {
      id: asGoalId('goal-paused'),
      title: 'On hold',
      statusPeriods: [
        { status: 'active' as const, from: asDay('2024-01-01') },
        { status: 'paused' as const, from: asDay('2024-05-01') },
      ],
    };
    const { create, activities } = setup([paused]);

    const activity = await create({
      ...validInput,
      goal: { kind: 'existing', goalId: asGoalId('goal-paused') },
    });

    expect(activity.goalId).toBe('goal-paused');
    expect(await activities.findAll()).toHaveLength(1);
  });
});

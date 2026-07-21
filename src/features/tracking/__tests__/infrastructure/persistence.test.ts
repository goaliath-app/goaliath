import { createActivity } from '@/features/tracking/application/createActivity';
import { createGoal } from '@/features/tracking/application/createGoal';
import { trackingMigrations } from '@/features/tracking';
import { SqliteActivityOccurrenceRepository } from '@/features/tracking/infrastructure/SqliteActivityOccurrenceRepository';
import { SqliteActivityRepository } from '@/features/tracking/infrastructure/SqliteActivityRepository';
import { SqliteActivityScheduleRepository } from '@/features/tracking/infrastructure/SqliteActivityScheduleRepository';
import { SqliteGoalRepository } from '@/features/tracking/infrastructure/SqliteGoalRepository';
import { SqliteRunningTimerRepository } from '@/features/tracking/infrastructure/SqliteRunningTimerRepository';
import { NotFoundError } from '@/shared/domain/errors';
import type { SqlDatabase } from '@/shared/infrastructure/db/SqlDatabase';
import { runMigrations } from '@/shared/infrastructure/db/runner';
import { SqliteTransactionRunner } from '@/shared/infrastructure/db/SqliteTransactionRunner';
import { createTestDatabase } from '@/shared/__tests__/support/nodeSqliteDatabase';
import { asActivityId, asDay, asGoalId } from '../support/trackingFakes';

/**
 * Integration tests over a **real SQLite engine** (Node's built-in), running the
 * real migrations and the adapters' real statements. They can't exercise the
 * `expo-sqlite` binding, but they do verify the part that was entirely untested:
 * the SQL itself.
 */
let database: SqlDatabase & { close(): void };
let deps: ReturnType<typeof buildDeps>;

const buildDeps = (db: SqlDatabase) => ({
  goals: new SqliteGoalRepository(db),
  activities: new SqliteActivityRepository(db),
  schedules: new SqliteActivityScheduleRepository(db),
  occurrences: new SqliteActivityOccurrenceRepository(db),
  runningTimers: new SqliteRunningTimerRepository(db),
  transactions: new SqliteTransactionRunner(db),
  ids: sequentialIds(),
  now: () => new Date('2024-06-15T12:00:00Z'),
  dayStartHour: 0,
});

const sequentialIds = () => {
  let issued = 0;
  return {
    newId: () => {
      issued += 1;
      return `id-${issued}`;
    },
  };
};

beforeEach(async () => {
  database = createTestDatabase();
  await runMigrations(database, trackingMigrations);
  deps = buildDeps(database);
});

afterEach(() => database.close());

describe('migrations', () => {
  it('bring a fresh database up to the latest version', async () => {
    const row = await database.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version',
    );
    expect(row?.user_version).toBe(2);
  });

  it('are idempotent — running them again is a no-op', async () => {
    await runMigrations(database, trackingMigrations);
    const row = await database.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version',
    );
    expect(row?.user_version).toBe(2);
  });
});

describe('creating a goal', () => {
  it('round-trips through SQLite with its status timeline', async () => {
    const created = await createGoal(deps)({
      title: 'Health',
      motivation: 'Feel good',
    });

    const loaded = await deps.goals.findById(created.id);
    expect(loaded).toEqual(created);
    expect(loaded?.statusPeriods).toEqual([
      { status: 'active', from: '2024-06-15' },
    ]);
  });

  it('is listed by findAll', async () => {
    await createGoal(deps)({ title: 'Health' });
    expect(await deps.goals.findAll()).toHaveLength(1);
  });
});

describe('creating an activity with a new goal', () => {
  it('persists goal, activity and schedule together', async () => {
    const activity = await createActivity(deps)({
      goal: { kind: 'new', title: 'Health' },
      title: 'Meditate',
      activityType: 'checklist',
      recurrenceRule: { kind: 'daily' },
      dayGoal: null,
      periodGoal: null,
    });

    expect(await deps.goals.findById(activity.goalId)).not.toBeNull();
    expect(await deps.activities.findAll()).toHaveLength(1);

    const [schedule] = await deps.schedules.findByActivityId(activity.id);
    expect(schedule.recurrenceRule).toEqual({ kind: 'daily' });
    expect(schedule.periodGoal).toBeNull();
  });

  it('persists a quota schedule with its period goal (JSON round-trip)', async () => {
    const activity = await createActivity(deps)({
      goal: { kind: 'new', title: 'Health' },
      title: 'Run',
      activityType: 'checklist',
      recurrenceRule: { kind: 'quota', period: 'week' },
      dayGoal: null,
      periodGoal: { aggregate: 'completedDays', amount: 3 },
    });

    const [schedule] = await deps.schedules.findByActivityId(activity.id);
    expect(schedule.recurrenceRule).toEqual({ kind: 'quota', period: 'week' });
    expect(schedule.periodGoal).toEqual({
      aggregate: 'completedDays',
      amount: 3,
    });
  });

  it('rolls the whole thing back when the goal does not exist', async () => {
    await expect(
      createActivity(deps)({
        goal: { kind: 'existing', goalId: asGoalId('ghost') },
        title: 'Meditate',
        activityType: 'checklist',
        recurrenceRule: { kind: 'daily' },
        dayGoal: null,
        periodGoal: null,
      }),
    ).rejects.toThrow(NotFoundError);

    expect(await deps.activities.findAll()).toHaveLength(0);
    expect(await deps.goals.findAll()).toHaveLength(0);
  });
});

describe('SqliteTransactionRunner', () => {
  it('returns the work’s value on success', async () => {
    const result = await deps.transactions.runInTransaction(async () => 'done');
    expect(result).toBe('done');
  });

  it('rolls back every write when the work throws', async () => {
    const goal = await createGoal(deps)({ title: 'Health' });

    await expect(
      deps.transactions.runInTransaction(async () => {
        await deps.goals.save({ ...goal, title: 'Renamed' });
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    expect((await deps.goals.findById(goal.id))?.title).toBe('Health');
  });
});

describe('status timelines are upserted, never wiped', () => {
  it('keeps existing entries and replaces a same-day change', async () => {
    const goal = await createGoal(deps)({ title: 'Health' });

    await deps.transactions.runInTransaction(() =>
      deps.goals.save({
        ...goal,
        statusPeriods: [
          ...goal.statusPeriods,
          { status: 'paused', from: asDay('2024-07-01') },
        ],
      }),
    );
    expect((await deps.goals.findById(goal.id))?.statusPeriods).toHaveLength(2);

    // A second change dated the same day replaces it rather than colliding.
    await deps.transactions.runInTransaction(() =>
      deps.goals.save({
        ...goal,
        statusPeriods: [
          ...goal.statusPeriods,
          { status: 'active', from: asDay('2024-07-01') },
        ],
      }),
    );
    const reloaded = await deps.goals.findById(goal.id);
    expect(reloaded?.statusPeriods).toHaveLength(2);
    expect(reloaded?.statusPeriods[1]).toEqual({
      status: 'active',
      from: '2024-07-01',
    });
  });
});

describe('occurrences', () => {
  it('upserts on (activityId, date) instead of duplicating', async () => {
    const activity = await createActivity(deps)({
      goal: { kind: 'new', title: 'Health' },
      title: 'Meditate',
      activityType: 'checklist',
      recurrenceRule: { kind: 'daily' },
      dayGoal: null,
      periodGoal: null,
    });
    const day = asDay('2024-06-15');

    await deps.occurrences.save({
      activityId: activity.id,
      scheduleId: null,
      date: day,
      status: 'pending',
      completedAt: null,
      notes: null,
      origin: 'manual',
      progress: {},
    });
    await deps.occurrences.save({
      activityId: activity.id,
      scheduleId: null,
      date: day,
      status: 'done',
      completedAt: new Date('2024-06-15T09:00:00Z'),
      notes: null,
      origin: 'manual',
      progress: {},
    });

    const saved = await deps.occurrences.findByActivityAndDate(activity.id, day);
    expect(saved?.status).toBe('done');
    expect(saved?.completedAt).toEqual(new Date('2024-06-15T09:00:00Z'));
    expect(
      await deps.occurrences.findByActivityInRange(activity.id, day, day),
    ).toHaveLength(1);
  });

  it('finds occurrences within an inclusive date range', async () => {
    const activity = await createActivity(deps)({
      goal: { kind: 'new', title: 'Health' },
      title: 'Meditate',
      activityType: 'checklist',
      recurrenceRule: { kind: 'daily' },
      dayGoal: null,
      periodGoal: null,
    });

    for (const date of ['2024-06-09', '2024-06-10', '2024-06-16', '2024-06-17']) {
      await deps.occurrences.save({
        activityId: activity.id,
        scheduleId: null,
        date: asDay(date),
        status: 'done',
        completedAt: null,
        notes: null,
        origin: 'manual',
        progress: {},
      });
    }

    const week = await deps.occurrences.findByActivityInRange(
      activity.id,
      asDay('2024-06-10'),
      asDay('2024-06-16'),
    );
    expect(week.map((occurrence) => occurrence.date)).toEqual([
      '2024-06-10',
      '2024-06-16',
    ]);
  });

  it('refuses an occurrence for an activity that does not exist', async () => {
    await expect(
      deps.occurrences.save({
        activityId: asActivityId('ghost'),
        scheduleId: null,
        date: asDay('2024-06-15'),
        status: 'done',
        completedAt: null,
        notes: null,
        origin: 'manual',
        progress: {},
      }),
    ).rejects.toThrow(); // FOREIGN KEY constraint
  });
});

describe('running timers', () => {
  it('round-trips and is removed on stop', async () => {
    const activity = await createActivity(deps)({
      goal: { kind: 'new', title: 'Health' },
      title: 'Read',
      activityType: 'timer',
      recurrenceRule: { kind: 'daily' },
      dayGoal: 600,
      periodGoal: null,
    });

    await deps.runningTimers.save({
      activityId: activity.id,
      occurrenceDate: asDay('2024-06-15'),
      startedAt: new Date('2024-06-15T07:00:00Z'),
    });

    const [running] = await deps.runningTimers.findAll();
    expect(running.startedAt).toEqual(new Date('2024-06-15T07:00:00Z'));
    expect(running.occurrenceDate).toBe('2024-06-15');

    await deps.runningTimers.remove(activity.id);
    expect(await deps.runningTimers.findAll()).toHaveLength(0);
  });
});

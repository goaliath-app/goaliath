import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Dev-only bootstrap: if the database has no goals yet, insert one demo goal
 * with two daily checklist activities so the Today screen has something to show
 * before a real create flow exists. **Not** production data — guard the call
 * with `__DEV__`. Raw SQL on purpose: this is throwaway seeding, not domain
 * logic, so it doesn't go through the repositories (which have no writes for
 * goals/activities yet anyway).
 */
export async function seedDevData(database: SQLiteDatabase): Promise<void> {
  const goalCount = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM goals',
  );
  if ((goalCount?.count ?? 0) > 0) return;

  await database.withTransactionAsync(async () => {
    await database.execAsync(`
      INSERT INTO goals (id, title, motivation)
        VALUES ('goal-health', 'Health', 'Feel good every day');
      INSERT INTO goal_status_periods (goal_id, status, from_day)
        VALUES ('goal-health', 'active', '2024-01-01');

      INSERT INTO activities (id, goal_id, title, description, activity_type)
        VALUES ('act-meditate', 'goal-health', 'Meditate', '10 minutes of calm', 'checklist');
      INSERT INTO activity_status_periods (activity_id, status, from_day)
        VALUES ('act-meditate', 'active', '2024-01-01');
      INSERT INTO activity_schedules (id, activity_id, recurrence_rule, day_goal, period_goal, start_date)
        VALUES ('sch-meditate', 'act-meditate', '{"kind":"daily"}', NULL, NULL, '2024-01-01');

      INSERT INTO activities (id, goal_id, title, description, activity_type)
        VALUES ('act-water', 'goal-health', 'Drink water', 'Stay hydrated', 'checklist');
      INSERT INTO activity_status_periods (activity_id, status, from_day)
        VALUES ('act-water', 'active', '2024-01-01');
      INSERT INTO activity_schedules (id, activity_id, recurrence_rule, day_goal, period_goal, start_date)
        VALUES ('sch-water', 'act-water', '{"kind":"daily"}', NULL, NULL, '2024-01-01');
    `);
  });
}

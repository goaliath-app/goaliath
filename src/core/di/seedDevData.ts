import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Dev-only bootstrap: makes sure a small set of demo goals/activities/schedules
 * exists so the Today screen has something to show before a real create flow
 * exists. **Not** production data — guard the call with `__DEV__`.
 *
 * Idempotent **row by row** (`INSERT OR IGNORE`, every table has a primary key)
 * rather than all-or-nothing on an empty database. That matters during
 * development: when a new demo activity is added here it shows up on the next
 * launch, instead of being silently skipped because the database already had
 * older seed data (which would force wiping the app to see it).
 *
 * Raw SQL on purpose: throwaway seeding, not domain logic, so it doesn't go
 * through the repositories (which have no writes for goals/activities anyway).
 */
export async function seedDevData(database: SQLiteDatabase): Promise<void> {
  await database.withTransactionAsync(async () => {
    await database.execAsync(`
      INSERT OR IGNORE INTO goals (id, title, motivation)
        VALUES ('goal-health', 'Health', 'Feel good every day');
      INSERT OR IGNORE INTO goal_status_periods (goal_id, status, from_day)
        VALUES ('goal-health', 'active', '2024-01-01');

      INSERT OR IGNORE INTO activities (id, goal_id, title, description, activity_type)
        VALUES ('act-meditate', 'goal-health', 'Meditate', '10 minutes of calm', 'checklist');
      INSERT OR IGNORE INTO activity_status_periods (activity_id, status, from_day)
        VALUES ('act-meditate', 'active', '2024-01-01');
      INSERT OR IGNORE INTO activity_schedules (id, activity_id, recurrence_rule, day_goal, period_goal, start_date)
        VALUES ('sch-meditate', 'act-meditate', '{"kind":"daily"}', NULL, NULL, '2024-01-01');

      INSERT OR IGNORE INTO activities (id, goal_id, title, description, activity_type)
        VALUES ('act-water', 'goal-health', 'Drink water', 'Stay hydrated', 'checklist');
      INSERT OR IGNORE INTO activity_status_periods (activity_id, status, from_day)
        VALUES ('act-water', 'active', '2024-01-01');
      INSERT OR IGNORE INTO activity_schedules (id, activity_id, recurrence_rule, day_goal, period_goal, start_date)
        VALUES ('sch-water', 'act-water', '{"kind":"daily"}', NULL, NULL, '2024-01-01');

      INSERT OR IGNORE INTO activities (id, goal_id, title, description, activity_type)
        VALUES ('act-pushups', 'goal-health', 'Push-ups', '10 a day', 'counter');
      INSERT OR IGNORE INTO activity_status_periods (activity_id, status, from_day)
        VALUES ('act-pushups', 'active', '2024-01-01');
      INSERT OR IGNORE INTO activity_schedules (id, activity_id, recurrence_rule, day_goal, period_goal, start_date)
        VALUES ('sch-pushups', 'act-pushups', '{"kind":"daily"}', 10, NULL, '2024-01-01');

      -- A quota: no fixed due days, offered every day as an opt-in (§4).
      INSERT OR IGNORE INTO activities (id, goal_id, title, description, activity_type)
        VALUES ('act-run', 'goal-health', 'Go for a run', '3 days a week', 'checklist');
      INSERT OR IGNORE INTO activity_status_periods (activity_id, status, from_day)
        VALUES ('act-run', 'active', '2024-01-01');
      INSERT OR IGNORE INTO activity_schedules (id, activity_id, recurrence_rule, day_goal, period_goal, start_date)
        VALUES ('sch-run', 'act-run', '{"kind":"quota","period":"week"}', NULL,
                '{"aggregate":"completedDays","amount":3}', '2024-01-01');
    `);
  });
}

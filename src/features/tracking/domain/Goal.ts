import type { StatusPeriod } from './StatusPeriod';

/**
 * A Goal's identity. Branded so it can't be swapped with an `ActivityId` (or any
 * other string) by mistake — the same reason `CalendarDay` is branded.
 */
export type GoalId = string & { readonly __goalId: unique symbol };

/**
 * A Goal groups related Activities and holds their shared "why" (domain-model
 * §1). It defines **no** temporal behaviour of its own — that always lives in
 * the Activities (§2) — but it does have a lifecycle: pausing or archiving a
 * Goal cascade-deactivates all of its Activities (§0), so it owns a status
 * timeline.
 *
 * `title` and `motivation` are cosmetic and **not versioned** (§0): renaming
 * shows the current name everywhere, past included.
 */
export interface Goal {
  id: GoalId;
  title: string;
  motivation: string;
  statusPeriods: StatusPeriod[]; // active | paused | archived (§0)
}

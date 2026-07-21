import { ValidationError } from '@/shared/domain/errors';
import type { CalendarDay } from '@/shared/domain/time/CalendarDay';
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

export interface CreateGoalInput {
  id: GoalId;
  title: string;
  motivation?: string;
  /** The logical day it starts being active — its timeline's first entry. */
  activeFrom: CalendarDay;
}

/**
 * The **only** way to make a new Goal. A smart constructor rather than a bare
 * object literal: it's what guarantees the invariants hold no matter which
 * caller (use case, import, seed) builds one. UI-side validation is help for the
 * user; this is the guarantee.
 *
 * A Goal is born `active` from `activeFrom`, so its timeline is never empty —
 * `statusOn` returning `null` then genuinely means "before it existed" (§0).
 *
 * @throws {ValidationError} if the title is blank.
 */
export function createGoal(input: CreateGoalInput): Goal {
  const title = input.title.trim();
  if (title.length === 0) {
    throw new ValidationError('A goal needs a title');
  }
  return {
    id: input.id,
    title,
    motivation: input.motivation?.trim() ?? '',
    statusPeriods: [{ status: 'active', from: input.activeFrom }],
  };
}

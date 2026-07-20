/**
 * The `checklist` activity type (domain-model §5, §7). A checklist day is
 * **binary** — done or not — so it tracks nothing beyond the occurrence's
 * `status`: its progress carries no data (`{}`).
 *
 * Modeled **concretely** for now. When a second measurable type (counter/timer)
 * arrives, this is what the pure `ActivityTypeBehaviour` half of the registry
 * (§7) generalises — we defer that abstraction until there's a real second case
 * to shape it against.
 */
export type ChecklistProgress = Record<string, never>;

/** The starting progress for a fresh checklist occurrence: nothing tracked yet. */
export const emptyChecklistProgress = (): ChecklistProgress => ({});

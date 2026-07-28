import {
  effectiveAggregate,
  metricOf,
  parsePositiveInteger,
  type ActivityDraft,
} from '../model/activityDraft';
import { formatDurationWords } from './duration';

/**
 * Turns a draft into one human sentence ("Correr, 3 días por semana"), for the
 * live preview under the form.
 *
 * It lives in `ui/format/` and **never** in `domain/`: the domain describes the
 * rule structurally (`{ kind: 'quota', period: 'week' }`); putting words on it
 * would drag a language, a locale and a plural system into the pure core. So
 * this takes the structured draft plus a `t` function and returns a translated
 * string — the only place that knows how a rule *reads*.
 */

/**
 * The slice of i18next's `t` this needs. Declared structurally so the formatter
 * stays a pure function: tests inject a fake, no i18n runtime required.
 */
export type Translate = (
  key: string,
  options?: Record<string, unknown>,
) => string;

export function describeActivityDraft(
  draft: ActivityDraft,
  t: Translate,
): string {
  const title = draft.title.trim();
  return t('preview.line', {
    title: title.length > 0 ? title : t('preview.untitled'),
    schedule: describeSchedule(draft, t),
  });
}

function describeSchedule(draft: ActivityDraft, t: Translate): string {
  const parts = [describeCadence(draft, t)];
  const dayGoal = describeDayGoal(draft, t);
  if (dayGoal !== null) parts.push(dayGoal);
  return parts.join(t('preview.partSeparator'));
}

function describeCadence(draft: ActivityDraft, t: Translate): string {
  switch (draft.recurrence) {
    case 'daily':
      return t('preview.daily');
    case 'weekly':
      return draft.daysOfWeek.length === 0
        ? t('preview.weeklyNoDays')
        : t('preview.weekly', { days: joinWeekdays(draft.daysOfWeek, t) });
    case 'quota':
      return describeQuota(draft, t);
  }
}

function describeQuota(draft: ActivityDraft, t: Translate): string {
  const amount = parsePositiveInteger(draft.periodGoalAmount);
  const period = t(`preview.period.${draft.quotaPeriod}`);
  if (amount === null) return t('preview.quotaNoAmount', { period });

  if (effectiveAggregate(draft) === 'completedDays') {
    return t('preview.quotaDays', { count: amount, period });
  }
  // A duration is read back as words ("1 h 30 min") rather than as a bare
  // number, which at this unit would be an unreadable count of seconds.
  return metricOf(draft.activityType) === 'duration'
    ? t('preview.quotaDuration', {
        duration: formatDurationWords(amount, t),
        period,
      })
    : t('preview.quotaCount', { count: amount, period });
}

function describeDayGoal(draft: ActivityDraft, t: Translate): string | null {
  const metric = metricOf(draft.activityType);
  if (metric === 'none') return null;
  const amount = parsePositiveInteger(draft.dayGoal);
  if (amount === null) return null;
  return metric === 'duration'
    ? t('preview.dayGoalDuration', {
        duration: formatDurationWords(amount, t),
      })
    : t('preview.dayGoalCount', { count: amount });
}

/**
 * "lunes, miércoles y viernes". Built from two translated joiners rather than
 * `Intl.ListFormat`, which isn't guaranteed on every JS engine the app runs on.
 */
function joinWeekdays(daysOfWeek: readonly number[], t: Translate): string {
  const names = [...daysOfWeek]
    .sort((a, b) => a - b)
    .map((weekday) => t(`preview.weekdays.${weekday}`));
  if (names.length === 1) return names[0];
  const last = names[names.length - 1];
  return names.slice(0, -1).join(t('preview.listSeparator')) + t('preview.listLast') + last;
}

import { emptyActivityDraft, type ActivityDraft } from '../../ui/model/activityDraft';
import {
  describeActivityDraft,
  type Translate,
} from '../../ui/format/describeActivityDraft';

/**
 * A fake `t` so the formatter can be tested without an i18n runtime: it echoes
 * the key and the interpolation values, which is exactly what we want to assert
 * — the formatter's job is picking the right key with the right params, not
 * knowing Spanish.
 */
const echo: Translate = (key, options) =>
  options === undefined ? `[${key}]` : `[${key} ${JSON.stringify(options)}]`;

/** A `t` that renders just enough Spanish to check the sentence reads right. */
const spanish: Translate = (key, options) => {
  const strings: Record<string, string> = {
    'preview.line': '{{title}}, {{schedule}}',
    'preview.untitled': 'Tu actividad',
    'preview.partSeparator': ', ',
    'preview.listSeparator': ', ',
    'preview.listLast': ' y ',
    'preview.daily': 'todos los días',
    'preview.weekly': 'los {{days}}',
    'preview.quotaDays': '{{count}} días por {{period}}',
    'preview.quotaCount': '{{count}} veces por {{period}}',
    'preview.quotaDuration': '{{duration}} por {{period}}',
    'preview.dayGoalCount': '{{count}} veces al día',
    'preview.dayGoalDuration': '{{duration}} al día',
    'duration.hoursShort': '{{count}} h',
    'duration.minutesShort': '{{count}} min',
    'duration.secondsShort': '{{count}} s',
    'duration.partSeparator': ' ',
    'preview.period.week': 'semana',
    'preview.period.month': 'mes',
    'preview.weekdays.1': 'lunes',
    'preview.weekdays.3': 'miércoles',
    'preview.weekdays.5': 'viernes',
  };
  const template = strings[key] ?? `[${key}]`;
  return Object.entries(options ?? {}).reduce(
    (text, [name, value]) => text.split(`{{${name}}}`).join(String(value)),
    template,
  );
};

function draftWith(changes: Partial<ActivityDraft>): ActivityDraft {
  return { ...emptyActivityDraft(), title: 'Correr', ...changes };
}

describe('describeActivityDraft', () => {
  it('reads as a sentence for a daily checklist', () => {
    expect(describeActivityDraft(draftWith({}), spanish)).toBe(
      'Correr, todos los días',
    );
  });

  it('lists the weekdays in order, joined naturally', () => {
    expect(
      describeActivityDraft(
        draftWith({ recurrence: 'weekly', daysOfWeek: [5, 1, 3] }),
        spanish,
      ),
    ).toBe('Correr, los lunes, miércoles y viernes');
  });

  it('uses no list joiner for a single weekday', () => {
    expect(
      describeActivityDraft(
        draftWith({ recurrence: 'weekly', daysOfWeek: [3] }),
        spanish,
      ),
    ).toBe('Correr, los miércoles');
  });

  it('describes a completedDays quota', () => {
    expect(
      describeActivityDraft(
        draftWith({ recurrence: 'quota', quotaPeriod: 'week', periodGoalAmount: '3' }),
        spanish,
      ),
    ).toBe('Correr, 3 días por semana');
  });

  it('describes a counter metricSum quota in its own unit', () => {
    expect(
      describeActivityDraft(
        draftWith({
          activityType: 'counter',
          recurrence: 'quota',
          quotaPeriod: 'month',
          periodGoalAggregate: 'metricSum',
          periodGoalAmount: '30',
        }),
        spanish,
      ),
    ).toBe('Correr, 30 veces por mes');
  });

  it('appends the day target after the cadence', () => {
    expect(
      describeActivityDraft(
        draftWith({ activityType: 'timer', dayGoal: '1200' }),
        spanish,
      ),
    ).toBe('Correr, todos los días, 20 min al día');
  });

  it('reads a duration back in words rather than as a count of seconds', () => {
    expect(
      describeActivityDraft(
        draftWith({ activityType: 'timer', dayGoal: '5400' }),
        spanish,
      ),
    ).toBe('Correr, todos los días, 1 h 30 min al día');
  });

  it('falls back to a placeholder title while the field is empty', () => {
    expect(describeActivityDraft(draftWith({ title: '  ' }), spanish)).toBe(
      'Tu actividad, todos los días',
    );
  });

  it('never shows a day target for a checklist, whatever the field holds', () => {
    expect(
      describeActivityDraft(
        draftWith({ activityType: 'checklist', dayGoal: '5' }),
        spanish,
      ),
    ).toBe('Correr, todos los días');
  });

  it('passes count and period so i18next can pluralize', () => {
    const calls: { key: string; options?: Record<string, unknown> }[] = [];
    const recording: Translate = (key, options) => {
      calls.push({ key, options });
      return key;
    };
    describeActivityDraft(
      draftWith({ recurrence: 'quota', quotaPeriod: 'week', periodGoalAmount: '1' }),
      recording,
    );
    expect(calls).toContainEqual({
      key: 'preview.quotaDays',
      options: { count: 1, period: 'preview.period.week' },
    });
  });

  it('says the amount is still undecided rather than showing a broken sentence', () => {
    const text = describeActivityDraft(
      draftWith({ recurrence: 'quota', periodGoalAmount: '' }),
      echo,
    );
    expect(text).toContain('preview.quotaNoAmount');
  });

  it('says the weekdays are still unchosen rather than showing an empty list', () => {
    const text = describeActivityDraft(
      draftWith({ recurrence: 'weekly', daysOfWeek: [] }),
      echo,
    );
    expect(text).toContain('preview.weeklyNoDays');
  });
});

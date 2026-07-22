import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { ActivityType } from '../../domain/Activity';
import {
  effectiveAggregate,
  emptyActivityDraft,
  metricOf,
  periodAmountUsesMetric,
  validateActivityDraft,
  type ActivityDraft,
  type ActivityDraftErrorCode,
  type PeriodGoalAggregate,
  type QuotaPeriod,
  type RecurrenceChoice,
} from '../format/activityDraft';
import {
  describeActivityDraft,
  type Translate,
} from '../format/describeActivityDraft';
import { isMeasurable } from '../../domain/activityTypes/registry';
import { DurationInput } from '../components/DurationInput';
import { useCreateActivity } from '../hooks/useCreateActivity';

/**
 * The draft keeps amounts as raw text (that's what a `TextInput` holds) while
 * `DurationInput` speaks seconds, so these two adapt between them.
 *
 * Zero maps to the **empty string**, not `"0"`: blank is how the draft spells
 * "no target set", and `"0"` would instead read as a value that fails the
 * "greater than zero" check and light up an error the user never caused.
 */
function secondsFromDraftField(raw: string): number {
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function draftFieldFromSeconds(seconds: number): string {
  return seconds > 0 ? String(seconds) : '';
}

// Declared `as const` so each `t(`prefix.${value}`)` below narrows to a literal
// key the i18n type checker can verify, instead of widening to `string`.
const ACTIVITY_TYPES = ['checklist', 'counter', 'timer'] as const satisfies readonly ActivityType[];
const RECURRENCES = ['daily', 'weekly', 'quota'] as const satisfies readonly RecurrenceChoice[];
const AGGREGATES = ['completedDays', 'metricSum'] as const satisfies readonly PeriodGoalAggregate[];
const ISO_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const;

/** Quota periods paired with their label key — no key built by string surgery. */
const QUOTA_PERIODS = [
  { period: 'week', labelKey: 'recurrence.periodWeek' },
  { period: 'month', labelKey: 'recurrence.periodMonth' },
  { period: 'year', labelKey: 'recurrence.periodYear' },
] as const satisfies readonly { period: QuotaPeriod; labelKey: string }[];

/**
 * The "create an activity" form. Presentation only: it edits an `ActivityDraft`,
 * renders the errors `validateActivityDraft` reports and hands the draft to
 * `useCreateActivity`. Which fields are offered follows from the draft itself
 * (measurable type -> day goal; quota -> period goal), never from an inline rule
 * duplicated here.
 *
 * The goal question comes **before** the title on purpose: the user should think
 * about *why* before *what*.
 */
export function ActivityFormScreen() {
  const { t } = useTranslation('activityForm');
  const router = useRouter();
  const { goals, submitting, failed, submit } = useCreateActivity();

  const [draft, setDraft] = useState<ActivityDraft>(emptyActivityDraft);
  const [attempted, setAttempted] = useState(false);

  const errors = useMemo(() => validateActivityDraft(draft), [draft]);
  // i18next's `t` is key-checked against a literal union and has an overloaded
  // signature, so it isn't structurally assignable to the formatter's plain
  // `(key, options) => string` contract — and the formatter builds some keys
  // dynamically (`preview.weekdays.${n}`). Widening it at this one named
  // boundary is what keeps the formatter pure and testable with a fake `t`.
  const translate = t as unknown as Translate;
  const preview = describeActivityDraft(draft, translate);

  const measurable = isMeasurable(draft.activityType);
  const metric = metricOf(draft.activityType);
  const patch = (changes: Partial<ActivityDraft>) =>
    setDraft((current) => ({ ...current, ...changes }));

  const errorFor = (code: ActivityDraftErrorCode | undefined) =>
    attempted && code !== undefined ? t(`errors.${code}`) : null;

  const onSubmit = async () => {
    setAttempted(true);
    if (Object.keys(errors).length > 0) return;
    if (await submit(draft)) router.back();
  };

  const pickedGoalId = draft.goal.kind === 'existing' ? draft.goal.goalId : null;
  const selectedGoal =
    pickedGoalId === null
      ? null
      : goals?.find((option) => option.goal.id === pickedGoalId) ?? null;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>{t('screen.title')}</Text>

        {/* --- Goal: the "why", asked first ---------------------------------- */}
        <Field label={t('goal.label')} help={t('goal.help')} error={errorFor(errors.goal)}>
          <Choice
            selected={draft.goal.kind === 'existing'}
            label={t('goal.modeExisting')}
            onPress={() => patch({ goal: { kind: 'existing', goalId: null } })}
          />
          {draft.goal.kind === 'existing' ? (
            goals === null ? (
              <View style={styles.loading}>
                <ActivityIndicator />
                <Text style={styles.help}>{t('goal.loading')}</Text>
              </View>
            ) : goals.length === 0 ? (
              <Text style={styles.help}>{t('goal.none')}</Text>
            ) : (
              <View style={styles.chips}>
                {goals.map((option) => (
                  <Chip
                    key={option.goal.id}
                    label={option.goal.title}
                    selected={pickedGoalId === option.goal.id}
                    onPress={() =>
                      patch({
                        goal: { kind: 'existing', goalId: option.goal.id },
                      })
                    }
                  />
                ))}
              </View>
            )
          ) : null}
          {selectedGoal !== null && !selectedGoal.active ? (
            <Text style={styles.hint}>{t('goal.pausedHint')}</Text>
          ) : null}

          <Choice
            selected={draft.goal.kind === 'new'}
            label={t('goal.modeNew')}
            onPress={() => patch({ goal: { kind: 'new', title: '', motivation: '' } })}
          />
          {draft.goal.kind === 'new' ? (
            <View style={styles.nested}>
              <Text style={styles.label}>{t('goal.newTitleLabel')}</Text>
              <TextInput
                style={styles.input}
                value={draft.goal.title}
                placeholder={t('goal.newTitlePlaceholder')}
                onChangeText={(title) =>
                  setDraft((current) =>
                    current.goal.kind === 'new'
                      ? { ...current, goal: { ...current.goal, title } }
                      : current,
                  )
                }
              />
              <Text style={styles.label}>{t('goal.newMotivationLabel')}</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                value={draft.goal.motivation}
                multiline
                placeholder={t('goal.newMotivationPlaceholder')}
                onChangeText={(motivation) =>
                  setDraft((current) =>
                    current.goal.kind === 'new'
                      ? { ...current, goal: { ...current.goal, motivation } }
                      : current,
                  )
                }
              />
            </View>
          ) : null}
        </Field>

        {/* --- Title: the "what" --------------------------------------------- */}
        <Field label={t('title.label')} error={errorFor(errors.title)}>
          <TextInput
            style={styles.input}
            value={draft.title}
            placeholder={t('title.placeholder')}
            onChangeText={(title) => patch({ title })}
          />
        </Field>

        <Field label={t('description.label')}>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={draft.description}
            multiline
            placeholder={t('description.placeholder')}
            onChangeText={(description) => patch({ description })}
          />
        </Field>

        {/* --- How it is measured (an explicit choice, never derived) --------- */}
        <Field label={t('activityType.label')} help={t('activityType.help')}>
          {ACTIVITY_TYPES.map((activityType) => (
            <Choice
              key={activityType}
              selected={draft.activityType === activityType}
              label={t(`activityType.${activityType}`)}
              help={t(`activityType.${activityType}Help`)}
              onPress={() => patch({ activityType })}
            />
          ))}
        </Field>

        {/* --- How often ------------------------------------------------------ */}
        <Field label={t('recurrence.label')} error={errorFor(errors.daysOfWeek)}>
          {RECURRENCES.map((recurrence) => (
            <Choice
              key={recurrence}
              selected={draft.recurrence === recurrence}
              label={t(`recurrence.${recurrence}`)}
              help={t(`recurrence.${recurrence}Help`)}
              onPress={() => patch({ recurrence })}
            />
          ))}

          {draft.recurrence === 'weekly' ? (
            <View style={styles.nested}>
              <Text style={styles.label}>{t('recurrence.weekdaysLabel')}</Text>
              <View style={styles.chips}>
                {ISO_WEEKDAYS.map((weekday) => (
                  <Chip
                    key={weekday}
                    label={t(`weekdays.short.${weekday}`)}
                    accessibilityLabel={t(`weekdays.accessible.${weekday}`)}
                    selected={draft.daysOfWeek.includes(weekday)}
                    onPress={() =>
                      patch({
                        daysOfWeek: draft.daysOfWeek.includes(weekday)
                          ? draft.daysOfWeek.filter((day) => day !== weekday)
                          : [...draft.daysOfWeek, weekday],
                      })
                    }
                  />
                ))}
              </View>
            </View>
          ) : null}

          {draft.recurrence === 'quota' ? (
            <View style={styles.nested}>
              <Text style={styles.label}>{t('recurrence.periodLabel')}</Text>
              <View style={styles.chips}>
                {QUOTA_PERIODS.map(({ period, labelKey }) => (
                  <Chip
                    key={period}
                    label={t(labelKey)}
                    selected={draft.quotaPeriod === period}
                    onPress={() => patch({ quotaPeriod: period })}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </Field>

        {/* --- Day target: only meaningful for a measurable type (§3) --------- */}
        {measurable ? (
          <Field
            label={t('dayGoal.label')}
            help={t('dayGoal.help')}
            error={errorFor(errors.dayGoal)}
          >
            {metric === 'duration' ? (
              <DurationInput
                value={secondsFromDraftField(draft.dayGoal)}
                onValueChange={(seconds) =>
                  patch({ dayGoal: draftFieldFromSeconds(seconds) })
                }
              />
            ) : (
              <View style={styles.amountRow}>
                <TextInput
                  style={[styles.input, styles.amount]}
                  value={draft.dayGoal}
                  keyboardType="number-pad"
                  placeholder={t('dayGoal.placeholderCount')}
                  onChangeText={(dayGoal) => patch({ dayGoal })}
                />
                <Text style={styles.unit}>{t('dayGoal.unitCount')}</Text>
              </View>
            )}
          </Field>
        ) : null}

        {/* --- Period target: exists iff the recurrence is a quota (§3) ------- */}
        {draft.recurrence === 'quota' ? (
          <Field label={t('periodGoal.label')} error={errorFor(errors.periodGoal)}>
            {AGGREGATES.filter(
              (aggregate) => aggregate === 'completedDays' || measurable,
            ).map((aggregate) => (
              <Choice
                key={aggregate}
                selected={effectiveAggregate(draft) === aggregate}
                label={t(
                  aggregate === 'metricSum'
                    ? 'periodGoal.aggregateMetricSum'
                    : 'periodGoal.aggregateCompletedDays',
                )}
                help={t(
                  aggregate === 'metricSum'
                    ? 'periodGoal.aggregateHelpMetricSum'
                    : 'periodGoal.aggregateHelpCompletedDays',
                )}
                onPress={() => patch({ periodGoalAggregate: aggregate })}
              />
            ))}
            {periodAmountUsesMetric(draft) && metric === 'duration' ? (
              // A period's total can exceed a day, so the hours field isn't
              // capped at 23 the way a day target's is.
              <DurationInput
                value={secondsFromDraftField(draft.periodGoalAmount)}
                onValueChange={(seconds) =>
                  patch({ periodGoalAmount: draftFieldFromSeconds(seconds) })
                }
                maxHours={99}
              />
            ) : (
              <View style={styles.amountRow}>
                <TextInput
                  style={[styles.input, styles.amount]}
                  value={draft.periodGoalAmount}
                  keyboardType="number-pad"
                  placeholder={t('periodGoal.amountLabel')}
                  onChangeText={(periodGoalAmount) => patch({ periodGoalAmount })}
                />
                <Text style={styles.unit}>
                  {t(
                    periodAmountUsesMetric(draft)
                      ? 'periodGoal.unitCount'
                      : 'periodGoal.unitDays',
                  )}
                </Text>
              </View>
            )}
          </Field>
        ) : null}

        {/* --- Live preview --------------------------------------------------- */}
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>{t('preview.label')}</Text>
          <Text style={styles.previewText}>{preview}</Text>
        </View>

        {failed ? <Text style={styles.error}>{t('screen.submitError')}</Text> : null}

        <View style={styles.actions}>
          <Pressable
            style={styles.secondaryButton}
            accessibilityRole="button"
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>{t('screen.cancel')}</Text>
          </Pressable>
          <Pressable
            style={[styles.primaryButton, submitting && styles.buttonDisabled]}
            accessibilityRole="button"
            disabled={submitting}
            onPress={() => void onSubmit()}
          >
            <Text style={styles.primaryButtonText}>
              {t(submitting ? 'screen.submitting' : 'screen.submit')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  help,
  error,
  children,
}: {
  label: string;
  help?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {help === undefined ? null : <Text style={styles.help}>{help}</Text>}
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function Choice({
  selected,
  label,
  help,
  onPress,
}: {
  selected: boolean;
  label: string;
  help?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.choice, selected && styles.choiceSelected]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
    >
      <View style={[styles.radio, selected && styles.radioSelected]} />
      <View style={styles.choiceLabel}>
        <Text style={styles.choiceText}>{label}</Text>
        {help === undefined ? null : <Text style={styles.help}>{help}</Text>}
      </View>
    </Pressable>
  );
}

function Chip({
  label,
  accessibilityLabel,
  selected,
  onPress,
}: {
  label: string;
  accessibilityLabel?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 64 },
  content: { paddingHorizontal: 20, paddingBottom: 48, gap: 4 },
  heading: { fontSize: 32, fontWeight: '700', marginBottom: 12 },

  field: { marginBottom: 24, gap: 6 },
  label: { fontSize: 15, fontWeight: '600' },
  help: { fontSize: 13, color: '#8a8a8e' },
  hint: { fontSize: 13, color: '#8a6d00' },
  error: { fontSize: 13, color: '#b00020' },

  input: {
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  nested: { gap: 6, marginTop: 4, paddingLeft: 8 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  choice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  choiceSelected: { borderColor: '#0a84ff', backgroundColor: '#f0f7ff' },
  choiceLabel: { flex: 1, gap: 2 },
  choiceText: { fontSize: 16 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#c7c7cc',
    marginTop: 1,
  },
  radioSelected: { borderColor: '#0a84ff', borderWidth: 6 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d1d6',
  },
  chipSelected: { borderColor: '#0a84ff', backgroundColor: '#0a84ff' },
  chipText: { fontSize: 15 },
  chipTextSelected: { color: '#ffffff', fontWeight: '600' },

  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  amount: { flex: 1 },
  unit: { fontSize: 15, color: '#8a8a8e' },

  preview: {
    borderRadius: 12,
    backgroundColor: '#f2f2f7',
    padding: 14,
    gap: 4,
    marginBottom: 16,
  },
  previewLabel: { fontSize: 12, color: '#8a8a8e', textTransform: 'uppercase' },
  previewText: { fontSize: 16, fontWeight: '600' },

  actions: { flexDirection: 'row', gap: 12 },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0a84ff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d1d6',
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: { fontSize: 16 },
  buttonDisabled: { opacity: 0.5 },
});

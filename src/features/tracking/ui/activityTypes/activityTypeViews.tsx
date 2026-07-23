import { useThemedStyles } from '@/shared/theme';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import type { ActivityId, ActivityType } from '../../domain/Activity';
import {
  countRepetitions,
  type CounterProgress,
} from '../../domain/activityTypes/counter';
import {
  totalSeconds,
  type TimerProgress,
} from '../../domain/activityTypes/timer';
import type { DayItem } from '../../domain/projection';
import { elapsedSeconds, type RunningTimer } from '../../domain/RunningTimer';
import { activityRowStyles } from './activityTypeViews.styles';

/**
 * The **UI half** of the activityType registry (domain-model §7): how a day's
 * row is rendered per type. The Today screen dispatches on `activity.activityType`
 * through this map instead of switching inline, so adding `timer` later is one
 * new entry — and no `Component` ever leaks into `domain/` (the pure behaviour
 * lives in `domain/activityTypes/`, this is its presentation counterpart).
 */
export interface TodayActions {
  toggleChecklist: (activityId: ActivityId) => void;
  incrementCounter: (activityId: ActivityId) => void;
  startTimer: (activityId: ActivityId) => void;
  stopTimer: (activityId: ActivityId) => void;
}

export interface ActivityRowProps {
  item: DayItem;
  actions: TodayActions;
  /** Live timer state — `null` unless this activity's timer is running (§11). */
  runningTimer: RunningTimer | null;
  /** Ticking "now", so a running timer's elapsed time renders live. */
  nowMs: number;
}

export interface ActivityTypeView {
  renderRow(props: ActivityRowProps): ReactNode;
}

export const activityTypeViews: Record<ActivityType, ActivityTypeView> = {
  checklist: { renderRow: (props) => <ChecklistRow {...props} /> },
  counter: { renderRow: (props) => <CounterRow {...props} /> },
  timer: { renderRow: (props) => <TimerRow {...props} /> },
};

function ChecklistRow({ item, actions }: ActivityRowProps) {
  const done = item.displayStatus === 'done';
  const { periodProgress } = item;
  const { t } = useTranslation();
  const styles = useThemedStyles(activityRowStyles);

  return (
    <Pressable
      style={styles.row}
      onPress={() => actions.toggleChecklist(item.activity.id)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
    >
      <View style={[styles.checkbox, done && styles.checkboxDone]}>
        {done ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <View style={styles.label}>
        <Text style={[styles.title, done && styles.titleMuted]}>
          {item.activity.title}
        </Text>
        {periodProgress === null ? null : (
          <Text style={styles.meta}>
            {t('activityRow.periodProgress', {
              current: periodProgress.current,
              target: periodProgress.target,
            })}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function CounterRow({ item, actions }: ActivityRowProps) {
  const done = item.displayStatus === 'done';
  const styles = useThemedStyles(activityRowStyles);
  // Untagged-progress boundary (§5): safe here — this view only renders counters.
  const progress = item.occurrence?.progress as CounterProgress | undefined;
  const count = progress === undefined ? 0 : countRepetitions(progress);
  const goal = item.schedule.dayGoal;
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <View style={styles.label}>
        <Text style={[styles.title, done && styles.titleMuted]}>
          {item.activity.title}
        </Text>
        <Text style={styles.meta}>
          {goal === null ? `${count}` : `${count} / ${goal}`}
        </Text>
      </View>
      <Pressable
        style={[styles.plus, done && styles.plusDone]}
        onPress={() => actions.incrementCounter(item.activity.id)}
        accessibilityRole="button"
        accessibilityLabel={t('activityRow.addOne', {
          title: item.activity.title,
        })}
      >
        <Text style={styles.plusText}>+</Text>
      </Pressable>
    </View>
  );
}

function TimerRow({ item, actions, runningTimer, nowMs }: ActivityRowProps) {
  const done = item.displayStatus === 'done';
  const styles = useThemedStyles(activityRowStyles);
  const running = runningTimer !== null;
  // Untagged-progress boundary (§5): safe — this view only renders timers.
  const progress = item.occurrence?.progress as TimerProgress | undefined;
  // Banked intervals plus the session in flight, which lives outside progress
  // until it stops (§11) — so the row must add it back to show a live total.
  const logged =
    (progress === undefined ? 0 : totalSeconds(progress)) +
    (runningTimer === null ? 0 : elapsedSeconds(runningTimer, new Date(nowMs)));
  const goal = item.schedule.dayGoal;
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <View style={styles.label}>
        <Text style={[styles.title, done && styles.titleMuted]}>
          {item.activity.title}
        </Text>
        <Text style={styles.meta}>
          {goal === null
            ? formatDuration(logged)
            : `${formatDuration(logged)} / ${formatDuration(goal)}`}
        </Text>
      </View>
      <Pressable
        style={[styles.timerButton, running && styles.timerButtonRunning]}
        onPress={() =>
          running
            ? actions.stopTimer(item.activity.id)
            : actions.startTimer(item.activity.id)
        }
        accessibilityRole="button"
        accessibilityLabel={t(
          running ? 'activityRow.timerStopLabel' : 'activityRow.timerStartLabel',
          { title: item.activity.title },
        )}
      >
        <Text style={styles.timerButtonText}>
          {t(running ? 'activityRow.timerStop' : 'activityRow.timerStart')}
        </Text>
      </Pressable>
    </View>
  );
}

/** `m:ss`, or `h:mm:ss` once it passes an hour. */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(remainingSeconds)}`
    : `${minutes}:${pad(remainingSeconds)}`;
}



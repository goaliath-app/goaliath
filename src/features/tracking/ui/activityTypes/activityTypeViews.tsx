import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ActivityId, ActivityType } from '../../domain/Activity';
import {
  countRepetitions,
  type CounterProgress,
} from '../../domain/activityTypes/counter';
import type { DayItem } from '../../domain/projection';

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
}

export interface ActivityRowProps {
  item: DayItem;
  actions: TodayActions;
}

export interface ActivityTypeView {
  renderRow(props: ActivityRowProps): ReactNode;
}

export const activityTypeViews: Record<ActivityType, ActivityTypeView> = {
  checklist: { renderRow: (props) => <ChecklistRow {...props} /> },
  counter: { renderRow: (props) => <CounterRow {...props} /> },
};

function ChecklistRow({ item, actions }: ActivityRowProps) {
  const done = item.displayStatus === 'done';
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
      <Text style={[styles.title, done && styles.titleMuted]}>
        {item.activity.title}
      </Text>
    </Pressable>
  );
}

function CounterRow({ item, actions }: ActivityRowProps) {
  const done = item.displayStatus === 'done';
  // Untagged-progress boundary (§5): safe here — this view only renders counters.
  const progress = item.occurrence?.progress as CounterProgress | undefined;
  const count = progress === undefined ? 0 : countRepetitions(progress);
  const goal = item.schedule.dayGoal;

  return (
    <View style={styles.row}>
      <View style={styles.counterLabel}>
        <Text style={[styles.title, done && styles.titleMuted]}>
          {item.activity.title}
        </Text>
        <Text style={styles.counterMeta}>
          {goal === null ? `${count}` : `${count} / ${goal}`}
        </Text>
      </View>
      <Pressable
        style={[styles.plus, done && styles.plusDone]}
        onPress={() => actions.incrementCounter(item.activity.id)}
        accessibilityRole="button"
        accessibilityLabel={`Add one to ${item.activity.title}`}
      >
        <Text style={styles.plusText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f2f2f7',
    gap: 14,
  },
  title: { fontSize: 17, color: '#1c1c1e' },
  titleMuted: { color: '#8a8a8e', textDecorationLine: 'line-through' },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#c7c7cc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: '#34c759', borderColor: '#34c759' },
  check: { color: '#ffffff', fontSize: 16, fontWeight: '700', lineHeight: 20 },
  counterLabel: { flex: 1, gap: 2 },
  counterMeta: { fontSize: 14, color: '#8a8a8e' },
  plus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007aff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusDone: { backgroundColor: '#34c759' },
  plusText: { color: '#ffffff', fontSize: 24, fontWeight: '600', lineHeight: 28 },
});

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ActivityId } from '../../domain/Activity';
import type { DayItem } from '../../domain/projection';
import { useTodayView } from '../hooks/useTodayView';

/**
 * The "Today" screen — the thin end of the vertical slice. Renders the projected
 * day and lets you check a checklist activity off. All logic lives in the hook /
 * use cases / projection; this file is presentation only.
 */
export function TodayScreen() {
  const { items, today, toggle } = useTodayView();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Today</Text>
      <Text style={styles.date}>{today}</Text>

      {items === null ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : items.length === 0 ? (
        <Text style={styles.empty}>Nothing scheduled for today.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {items.map((item) => (
            <DayRow
              key={item.activity.id}
              item={item}
              onToggle={() => toggle(item.activity.id as ActivityId)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function DayRow({ item, onToggle }: { item: DayItem; onToggle: () => void }) {
  const done = item.displayStatus === 'done';
  return (
    <Pressable
      style={styles.row}
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
    >
      <View style={[styles.checkbox, done && styles.checkboxDone]}>
        {done ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <Text style={[styles.rowTitle, done && styles.rowTitleDone]}>
        {item.activity.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 64, paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: '700' },
  date: { fontSize: 15, color: '#8a8a8e', marginTop: 2, marginBottom: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { fontSize: 16, color: '#8a8a8e', marginTop: 24 },
  list: { gap: 12, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f2f2f7',
    gap: 14,
  },
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
  rowTitle: { fontSize: 17, color: '#1c1c1e' },
  rowTitleDone: { color: '#8a8a8e', textDecorationLine: 'line-through' },
});

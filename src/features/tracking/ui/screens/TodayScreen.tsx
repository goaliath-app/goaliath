import { Fragment } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { activityTypeViews } from '../activityTypes/activityTypeViews';
import { useTodayView } from '../hooks/useTodayView';

/**
 * The "Today" screen. Presentation only: it loads the projected day and, for
 * each item, dispatches to the matching row via the activityType view registry —
 * it never switches on the type itself. All logic lives in the hook / use cases
 * / projection.
 */
export function TodayScreen() {
  const { items, today, actions } = useTodayView();

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
            <Fragment key={item.activity.id}>
              {activityTypeViews[item.activity.activityType].renderRow({
                item,
                actions,
              })}
            </Fragment>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 64, paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: '700' },
  date: { fontSize: 15, color: '#8a8a8e', marginTop: 2, marginBottom: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { fontSize: 16, color: '#8a8a8e', marginTop: 24 },
  list: { gap: 12, paddingBottom: 24 },
});

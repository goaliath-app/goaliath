import { useThemedStyles } from '@/shared/theme';
import { Link } from 'expo-router';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { activityTypeViews } from '../../activityTypes/activityTypeViews';
import { useTodayView } from '../../hooks/useTodayView';
import { todayScreenStyles } from './TodayScreen.styles';

/**
 * The "Today" screen. Presentation only: it loads the projected day and, for
 * each item, dispatches to the matching row via the activityType view registry —
 * it never switches on the type itself. All logic lives in the hook / use cases
 * / projection.
 */
export function TodayScreen() {
  const { items, today, actions, runningTimerFor, nowMs } = useTodayView();
  const { t } = useTranslation();
  const styles = useThemedStyles(todayScreenStyles);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('today.title')}</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
        {/* Provisional entry point: the create form is reachable from here until
            the goals screen exists to host it. */}
        <Link href="/activity/new" asChild>
          <Pressable
            style={styles.add}
            accessibilityRole="button"
            accessibilityLabel={t('today.newActivity')}
          >
            <Text style={styles.addText}>+</Text>
          </Pressable>
        </Link>
      </View>

      {items === null ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : items.length === 0 ? (
        <Text style={styles.empty}>{t('today.empty')}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {items.map((item) => (
            <Fragment key={item.activity.id}>
              {activityTypeViews[item.activity.activityType].renderRow({
                item,
                actions,
                runningTimer: runningTimerFor(item.activity.id),
                nowMs,
              })}
            </Fragment>
          ))}
        </ScrollView>
      )}
    </View>
  );
}



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
      <View style={styles.topBar}>
        {/* Profile hub (top-left): everything that isn't "see today" or
            "create" lives behind here — goals, settings, stats. */}
        <Link href="/profile" asChild>
          <Pressable
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={t('today.menu')}
          >
            <Text style={styles.iconText}>☰</Text>
          </Pressable>
        </Link>
        {/* Create is a primary action, not a hub item (navigation model). */}
        <Link href="/activity/new" asChild>
          <Pressable
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={t('today.newActivity')}
          >
            <Text style={styles.iconText}>+</Text>
          </Pressable>
        </Link>
      </View>
      <Text style={styles.title}>{t('today.title')}</Text>
      <Text style={styles.date}>{today}</Text>

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



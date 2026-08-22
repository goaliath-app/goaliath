import { useThemedStyles } from '@/shared/theme';
import { Link } from 'expo-router';
import { Plus, User } from 'lucide-react-native';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { activityTypeViews } from '../../activityTypes/activityTypeViews';
import { useTodayView } from '../../hooks/useTodayView';
import { todayScreenStyles } from './TodayScreen.styles';

export function TodayScreen() {
  const { items, today, todayWeekday, actions, runningTimerFor, nowMs } = useTodayView();
  const { t } = useTranslation();
  const styles = useThemedStyles(todayScreenStyles);

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 20}}><Link href="/profile" asChild>
          <Pressable
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={t('today.profile')}
          >
            <User />
          </Pressable>
        </Link>
        <View>
          <Text style={styles.title}>{t('today.title')}</Text>
          <Text style={styles.date}>{today}</Text></View>
        </View>
        <Link href="/activity/new" asChild>
          <Pressable
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={t('today.newActivity')}
          >
            <Plus />
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



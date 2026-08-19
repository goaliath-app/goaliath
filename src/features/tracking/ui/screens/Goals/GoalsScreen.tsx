import { useThemedStyles } from '@/shared/theme';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import type { Status } from '../../../domain/StatusPeriod';
import { useGoalsOverview } from '../../hooks/useGoalsOverview';
import { goalsScreenStyles, statusBadgeStyles } from './GoalsScreen.styles';

/**
 * The goals management screen (roadmap week 1). An accordion (D1): each goal is
 * a header that expands to its activities. Presentation only — it reads the
 * overview from `useGoalsOverview` and renders it; the §0 cascade and status
 * resolution already happened in the use case.
 *
 * Read-only for now: pausing, resuming and archiving arrive in week 2, so this
 * shows lifecycle state without yet letting you change it.
 */
export function GoalsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { goals } = useGoalsOverview();
  const styles = useThemedStyles(goalsScreenStyles);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());

  const toggle = (goalId: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(goalId)) next.delete(goalId);
      else next.add(goalId);
      return next;
    });

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          onPress={() => router.back()}
        >
          <ChevronLeft />
        </Pressable>
        <Text style={styles.title}>{t('goals.title')}</Text>
      </View>

      {goals === null ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : goals.length === 0 ? (
        <Text style={styles.empty}>{t('goals.empty')}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {goals.map(({ goal, status, activities }) => {
            const isOpen = expanded.has(goal.id);
            return (
              <Fragment key={goal.id}>
                <Pressable
                  style={styles.goalHeader}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                  onPress={() => toggle(goal.id)}
                >
                  {isOpen ? <ChevronDown /> : <ChevronRight/>}
                  <View style={styles.goalHeaderText}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    {goal.motivation.length > 0 ? (
                      <Text style={styles.goalMotivation} numberOfLines={1}>
                        {goal.motivation}
                      </Text>
                    ) : null}
                  </View>
                  <StatusBadge status={status} />
                </Pressable>

                {isOpen ? (
                  <View style={styles.activities}>
                    {activities.length === 0 ? (
                      <Text style={styles.activitiesEmpty}>
                        {t('goals.activitiesEmpty')}
                      </Text>
                    ) : (
                      activities.map(({ activity, status: activityStatus }) => (
                        <View key={activity.id} style={styles.activityRow}>
                          <Text style={styles.activityTitle} numberOfLines={1}>
                            {activity.title}
                          </Text>
                          <StatusBadge status={activityStatus} />
                        </View>
                      ))
                    )}
                  </View>
                ) : null}
              </Fragment>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

/**
 * A pill for a non-active status. `active` (and the not-yet-existing `null`) show
 * nothing: active is the norm, so badging it would be noise — only a paused or
 * archived state is worth calling out.
 */
function StatusBadge({ status }: { status: Status | null }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(statusBadgeStyles);

  if (status !== 'paused' && status !== 'archived') return null;

  return (
    <View
      style={[styles.badge, status === 'paused' ? styles.paused : styles.archived]}
    >
      <Text
        style={[
          styles.text,
          status === 'paused' ? styles.pausedText : styles.archivedText,
        ]}
      >
        {t(`status.${status}`)}
      </Text>
    </View>
  );
}

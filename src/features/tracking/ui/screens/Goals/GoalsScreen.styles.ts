import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

/**
 * Styles for {@link GoalsScreen} and its private `StatusBadge`. Factories, not
 * constants, so they read the active theme (architecture.md, "Why styles are a
 * function"); the components resolve them through `useThemedStyles`.
 */
export const goalsScreenStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingTop: theme.spacing.xxl,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    back: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceSunken,
    },
    backText: {
      ...theme.typography.title,
      color: theme.colors.text.primary,
      lineHeight: 30,
    },
    title: {
      ...theme.typography.display,
      color: theme.colors.text.primary,
    },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    empty: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      paddingHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.xl,
    },
    list: { paddingBottom: theme.spacing.xxl },
    goalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    goalHeaderText: { flex: 1, gap: 2 },
    goalTitle: {
      ...theme.typography.title,
      color: theme.colors.text.primary,
    },
    goalMotivation: {
      ...theme.typography.meta,
      color: theme.colors.text.secondary,
    },
    chevron: {
      ...theme.typography.body,
      color: theme.colors.text.muted,
    },
    activities: {
      paddingLeft: theme.spacing.xl,
      paddingRight: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    activityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.subtle,
    },
    activityTitle: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
      flex: 1,
    },
    activitiesEmpty: {
      ...theme.typography.meta,
      color: theme.colors.text.muted,
      paddingVertical: theme.spacing.sm,
    },
  });

export const statusBadgeStyles = (theme: Theme) =>
  StyleSheet.create({
    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.full,
    },
    paused: { backgroundColor: theme.colors.warning.background },
    archived: { backgroundColor: theme.colors.surfaceSunken },
    text: { ...theme.typography.caption },
    pausedText: { color: theme.colors.warning.base },
    archivedText: { color: theme.colors.text.secondary },
  });

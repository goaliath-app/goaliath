import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

/**
 * Styles for {@link TodayScreen}. A factory rather than a constant so it can
 * read the active theme (architecture.md, "Why styles are a function"); the
 * screen resolves it through `useThemedStyles`.
 */
export const todayScreenStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingTop: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    title: {
      ...theme.typography.display,
      color: theme.colors.text.primary,
    },
    date: {
      ...theme.typography.meta,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.lg,
    },
    add: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceSunken,
    },
    addText: {
      ...theme.typography.title,
      color: theme.colors.text.primary,
      lineHeight: 32,
    },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    empty: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xl,
    },
    list: { gap: theme.spacing.sm, paddingBottom: theme.spacing.xl },
  });

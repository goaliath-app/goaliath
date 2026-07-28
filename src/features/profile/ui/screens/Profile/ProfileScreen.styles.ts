import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

/**
 * Styles for {@link ProfileScreen}. A factory so it reads the active theme
 * (architecture.md, "Why styles are a function"); resolved via `useThemedStyles`.
 */
export const profileScreenStyles = (theme: Theme) =>
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
      marginBottom: theme.spacing.xl,
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
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.subtle,
    },
    itemText: { flex: 1, gap: 2 },
    itemLabel: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    itemHint: {
      ...theme.typography.meta,
      color: theme.colors.text.secondary,
    },
    chevron: {
      ...theme.typography.title,
      color: theme.colors.text.muted,
    },
  });

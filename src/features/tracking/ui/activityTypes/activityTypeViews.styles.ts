import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

/**
 * Styles shared by every activity-type row (checklist, counter, timer).
 *
 * One factory rather than three: the row frame (`row`, `title`, `titleMuted`,
 * `label`, `meta`) is identical across types, and the per-type controls
 * (`checkbox`, `plus`, `timerButton`…) are cheap to carry alongside. Keeping
 * them together is what makes "all rows look like the same list" a single edit
 * instead of three that drift.
 */
export const activityRowStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      gap: theme.spacing.md,
    },
    title: {
      ...theme.typography.title,
      color: theme.colors.text.primary,
    },
    titleMuted: {
      color: theme.colors.text.secondary,
      textDecorationLine: 'line-through',
    },
    label: { flex: 1, gap: 2 },
    meta: {
      ...theme.typography.meta,
      color: theme.colors.text.secondary,
    },

    // checklist
    checkbox: {
      width: 26,
      height: 26,
      borderRadius: theme.radius.full,
      borderWidth: 2,
      borderColor: theme.colors.border.strong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxDone: {
      backgroundColor: theme.colors.accent.base,
      borderColor: theme.colors.accent.base,
    },
    check: {
      color: theme.colors.text.onAccent,
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 20,
    },

    // counter
    plus: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.brand.base,
      alignItems: 'center',
      justifyContent: 'center',
    },
    plusDone: {
      backgroundColor: theme.colors.accent.base,
    },
    plusText: {
      color: theme.colors.text.onBrand,
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 28,
    },

    // timer
    timerButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.brand.base,
    },
    timerButtonRunning: {
      backgroundColor: theme.colors.danger.base,
    },
    timerButtonText: {
      color: theme.colors.text.onBrand,
      fontSize: 15,
      fontWeight: '600',
    },
  });

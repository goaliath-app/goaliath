import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

/** Styles for {@link DurationInput}. */
export const durationInputStyles = (theme: Theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-start' },
    field: { flexDirection: 'row', alignItems: 'flex-start' },
    colon: {
      ...theme.typography.display,
      color: theme.colors.text.secondary,
      lineHeight: 46,
      marginHorizontal: theme.spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border.strong,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      ...theme.typography.title,
      minWidth: 62,
      textAlign: 'center',
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.surface,
    },
    unitLabel: {
      ...theme.typography.meta,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },
  });

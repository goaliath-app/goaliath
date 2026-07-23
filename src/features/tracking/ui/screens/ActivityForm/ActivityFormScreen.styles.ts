import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

/**
 * Styles for {@link ActivityFormScreen} and its private helpers. One factory per
 * component that resolves its own via `useThemedStyles`: the screen, and the
 * `Field` / `Choice` / `Chip` sub-components. Splitting them keeps each factory
 * to what its component actually renders — the earlier single inline object had
 * grown a copy of the choice/radio/chip styles that only the sub-components
 * used, and that dead half is gone here.
 */
export const activityFormStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingTop: theme.spacing.xxl,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.xs,
    },
    heading: {
      ...theme.typography.display,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    label: {
      ...theme.typography.label,
      color: theme.colors.text.primary,
    },
    help: {
      ...theme.typography.meta,
      color: theme.colors.text.secondary,
    },
    hint: {
      ...theme.typography.meta,
      color: theme.colors.warning.base,
    },
    error: {
      ...theme.typography.meta,
      color: theme.colors.danger.base,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border.strong,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      ...theme.typography.body,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.surface,
    },
    multiline: { minHeight: 72, textAlignVertical: 'top' },
    nested: {
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xs,
      paddingLeft: theme.spacing.sm,
    },
    loading: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
    amountRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    amount: { flex: 1 },
    unit: {
      ...theme.typography.label,
      color: theme.colors.text.secondary,
    },
    preview: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceSunken,
      padding: theme.spacing.lg,
      gap: 4,
      marginBottom: theme.spacing.lg,
    },
    previewLabel: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
    },
    previewText: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    actions: { flexDirection: 'row', gap: theme.spacing.md },
    primaryButton: {
      flex: 1,
      backgroundColor: theme.colors.brand.base,
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: theme.colors.text.onBrand,
      ...theme.typography.label,
      fontWeight: '600',
    },
    secondaryButton: {
      flex: 1,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.strong,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    secondaryButtonText: {
      ...theme.typography.label,
      color: theme.colors.text.primary,
    },
    buttonDisabled: { opacity: 0.5 },
  });

/** Styles for the `Field` wrapper: a labelled block with optional help/error. */
export const fieldStyles = (theme: Theme) =>
  StyleSheet.create({
    field: { marginBottom: theme.spacing.xl, gap: theme.spacing.xs },
    label: {
      ...theme.typography.label,
      color: theme.colors.text.primary,
    },
    help: {
      ...theme.typography.meta,
      color: theme.colors.text.secondary,
    },
    error: {
      ...theme.typography.meta,
      color: theme.colors.danger.base,
    },
  });

/** Styles for the `Choice` radio row. */
export const choiceStyles = (theme: Theme) =>
  StyleSheet.create({
    choice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      backgroundColor: theme.colors.surface,
    },
    choiceSelected: {
      borderColor: theme.colors.brand.base,
      backgroundColor: theme.colors.brand.background,
    },
    choiceLabel: { flex: 1, gap: 2 },
    choiceText: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
    },
    help: {
      ...theme.typography.meta,
      color: theme.colors.text.secondary,
    },
    radio: {
      width: 20,
      height: 20,
      borderRadius: theme.radius.full,
      borderWidth: 2,
      borderColor: theme.colors.border.strong,
      marginTop: 1,
    },
    radioSelected: { borderColor: theme.colors.brand.base, borderWidth: 6 },
  });

/** Styles for the `Chip` toggle. */
export const chipStyles = (theme: Theme) =>
  StyleSheet.create({
    chip: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: theme.colors.border.strong,
      backgroundColor: theme.colors.surface,
    },
    chipSelected: {
      borderColor: theme.colors.brand.base,
      backgroundColor: theme.colors.brand.base,
    },
    chipText: {
      ...theme.typography.label,
      color: theme.colors.text.primary,
    },
    chipTextSelected: {
      color: theme.colors.text.onBrand,
      fontWeight: '600',
    },
  });

import { StyleSheet } from 'react-native';
import type { Theme } from '@/shared/theme';

/**
 * The boot gate's only two states (loading, error). Themed like everything else
 * because `ThemeProvider` now wraps `DependencyProvider` (`app/_layout.tsx`) —
 * the theme depends only on the OS colour scheme, so it is available before the
 * database is, and the pre-DI UI is no longer an excuse for a raw colour.
 */
export const dependencyProviderStyles = (theme: Theme) =>
  StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    error: {
      ...theme.typography.body,
      color: theme.colors.danger.base,
      paddingHorizontal: theme.spacing.xl,
      textAlign: 'center',
    },
  });

import { Stack } from 'expo-router';
import { DependencyProvider } from '@/core/di/DependencyProvider';
import { StoredDataProvider } from '@/core/providers/StoredDataProvider';
import { ThemeProvider } from '@/core/providers/ThemeProvider';
import { initI18n } from '@/shared/i18n';

// Initialised at module scope, before any screen renders: translations are
// bundled and synchronous, so there is no loading state to model.
initI18n();

export default function RootLayout() {
  return (
    <DependencyProvider>
      <StoredDataProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </StoredDataProvider>
    </DependencyProvider>
  );
}

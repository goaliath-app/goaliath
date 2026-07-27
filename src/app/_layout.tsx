import { Stack } from 'expo-router';
import { DependencyProvider } from '@/core/di/DependencyProvider';
import { StoredDataProvider } from '@/core/providers/StoredDataProvider';
import { ThemeProvider } from '@/core/providers/ThemeProvider';
import { initI18n } from '@/shared/i18n';

// Initialised at module scope, before any screen renders: translations are
// bundled and synchronous, so there is no loading state to model.
initI18n();

export default function RootLayout() {
  // ThemeProvider is outermost on purpose: it depends only on the OS colour
  // scheme (no DI, no stored data), so it is ready before the database is and
  // can theme DependencyProvider's own loading/error gate.
  return (
    <ThemeProvider>
      <DependencyProvider>
        <StoredDataProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </StoredDataProvider>
      </DependencyProvider>
    </ThemeProvider>
  );
}

import { DependencyProvider } from '@/core/di/DependencyProvider';
import { StoredDataProvider } from '@/core/providers/StoredDataProvider';
import { ThemeProvider } from '@/core/providers/ThemeProvider';
import { initI18n } from '@/shared/i18n';
import { Stack } from 'expo-router';

initI18n();

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DependencyProvider>
        <StoredDataProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </StoredDataProvider>
      </DependencyProvider>
    </ThemeProvider>
  );
};

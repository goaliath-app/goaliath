import { Stack } from 'expo-router';
import { DependencyProvider } from '@/core/di/DependencyProvider';

export default function RootLayout() {
  return (
    <DependencyProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </DependencyProvider>
  );
}

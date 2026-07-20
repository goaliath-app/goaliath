import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { getDatabase } from '@/shared/infrastructure/db/connection';
import { createContainer, type Container } from './container';
import { bootstrapDatabase } from './migrations';
import { seedDevData } from './seedDevData';

const DependencyContext = createContext<Container | null>(null);

/**
 * Wires the app: opens the database, runs migrations, seeds dev data, builds the
 * DI container and provides it. Initialization is async, so children render only
 * once the container is ready (a splash-ish loading state until then). Mounted
 * once, at the app root (`app/_layout.tsx`).
 */
export function DependencyProvider({ children }: PropsWithChildren) {
  const [container, setContainer] = useState<Container | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const database = await getDatabase();
        await bootstrapDatabase(database);
        if (__DEV__) await seedDevData(database);
        if (active) setContainer(createContainer(database));
      } catch (caught) {
        if (active) setError(caught as Error);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (error !== null) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Failed to start: {error.message}</Text>
      </View>
    );
  }

  if (container === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <DependencyContext.Provider value={container}>
      {children}
    </DependencyContext.Provider>
  );
}

export function useDependencies(): Container {
  const container = useContext(DependencyContext);
  if (container === null) {
    throw new Error('useDependencies must be used within a DependencyProvider');
  }
  return container;
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#b00020', paddingHorizontal: 24, textAlign: 'center' },
});

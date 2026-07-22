import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

/**
 * A single "stored data changed" signal for the whole app.
 *
 * Everything the UI shows is **derived** from SQLite — the day view is a
 * projection rebuilt from goals, activities, schedules and occurrences
 * (domain-model, guiding principle). So a write anywhere can invalidate a
 * reading anywhere, and a screen that only reloads after *its own* writes shows
 * stale data the moment a second screen exists. That is exactly what happened
 * when the create form landed: Today kept rendering a day computed before the
 * new activity existed.
 *
 * The contract is one line: **a hook that writes calls `invalidateStoredData()`;
 * a hook that reads depends on `storedDataRevision`.** Readers then recompute
 * without knowing who wrote or what changed.
 *
 * Deliberately coarse — one counter, not per-entity keys. Every read here is a
 * local SQLite query, so recomputing more than strictly necessary costs little,
 * while working out precisely which readers a write affects is exactly the kind
 * of bookkeeping that goes wrong silently. If that ever stops being true, this
 * is the seam a real query cache (TanStack Query) would slot into.
 */
interface StoredData {
  /** Bumped on every write; readers use it as an effect dependency. */
  revision: number;
  invalidate: () => void;
}

const StoredDataContext = createContext<StoredData | null>(null);

export function StoredDataProvider({ children }: PropsWithChildren) {
  const [revision, setRevision] = useState(0);
  const invalidate = useCallback(() => setRevision((current) => current + 1), []);
  const value = useMemo(() => ({ revision, invalidate }), [revision, invalidate]);

  return (
    <StoredDataContext.Provider value={value}>
      {children}
    </StoredDataContext.Provider>
  );
}

function useStoredData(): StoredData {
  const value = useContext(StoredDataContext);
  if (value === null) {
    throw new Error('Stored-data hooks must be used within a StoredDataProvider');
  }
  return value;
}

/** For readers: a value that changes whenever stored data might have. */
export function useStoredDataRevision(): number {
  return useStoredData().revision;
}

/** For writers: call after a successful write, so every reader recomputes. */
export function useInvalidateStoredData(): () => void {
  return useStoredData().invalidate;
}

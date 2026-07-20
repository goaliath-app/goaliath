import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

let databasePromise: Promise<SQLiteDatabase> | null = null;

/**
 * The app's single SQLite connection, opened lazily and shared (architecture.md
 * — `shared/infrastructure/db/` owns the connection; it knows nothing about any
 * feature's schema). Callers get the same in-flight promise, so concurrent first
 * calls can't open two connections.
 */
export function getDatabase(): Promise<SQLiteDatabase> {
  databasePromise ??= openAndConfigure();
  return databasePromise;
}

async function openAndConfigure(): Promise<SQLiteDatabase> {
  const database = await openDatabaseAsync('goaliath.db');
  // WAL: readers don't block the writer (the norm for local-first apps).
  // foreign_keys: SQLite leaves referential integrity off unless asked.
  await database.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  return database;
}

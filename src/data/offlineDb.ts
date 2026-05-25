type StoreName =
  | 'profiles'
  | 'missions'
  | 'finance_transactions'
  | 'finance_budgets'
  | 'finance_savings'
  | 'study_subjects'
  | 'learned_words'
  | 'workout_routines'
  | 'workout_logs'
  | 'body_metrics'
  | 'fitness_goals'
  | 'bible_progress'
  | 'journal_entries'
  | 'focus_sessions'
  | 'weekly_goals'
  | 'protocol_logs';

const DB_NAME = 'jb-command-center-offline';
const DB_VERSION = 2;

const STORE_CONFIG: Record<StoreName, { keyPath: string }> = {
  profiles: { keyPath: 'id' },
  missions: { keyPath: 'id' },
  finance_transactions: { keyPath: 'id' },
  finance_budgets: { keyPath: 'category' },
  finance_savings: { keyPath: 'id' },
  study_subjects: { keyPath: 'id' },
  learned_words: { keyPath: 'id' },
  workout_routines: { keyPath: 'id' },
  workout_logs: { keyPath: 'id' },
  body_metrics: { keyPath: 'id' },
  fitness_goals: { keyPath: 'id' },
  bible_progress: { keyPath: 'id' },
  journal_entries: { keyPath: 'id' },
  focus_sessions: { keyPath: 'id' },
  weekly_goals: { keyPath: 'id' },
  protocol_logs: { keyPath: 'id' },
};

let databasePromise: Promise<IDBDatabase> | null = null;

function getDatabase(): Promise<IDBDatabase> {
  if (databasePromise) {
    return databasePromise;
  }

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error ?? new Error('Could not open offline database.'));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;

      (Object.entries(STORE_CONFIG) as Array<[StoreName, { keyPath: string }]>).forEach(([storeName, config]) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: config.keyPath });
        }
      });
    };
  });

  return databasePromise;
}

function readRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
  });
}

async function withStore<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const db = await getDatabase();
  const transaction = db.transaction(storeName, mode);
  const store = transaction.objectStore(storeName);
  return action(store);
}

export async function getRecord<T>(storeName: StoreName, key: IDBValidKey): Promise<T | null> {
  return withStore(storeName, 'readonly', async (store) => {
    const result = await readRequest(store.get(key));
    return (result as T | undefined) ?? null;
  });
}

export async function getAllRecords<T>(storeName: StoreName): Promise<T[]> {
  return withStore(storeName, 'readonly', async (store) => {
    const result = await readRequest(store.getAll());
    return (result as T[] | undefined) ?? [];
  });
}

export async function putRecord<T>(storeName: StoreName, value: T): Promise<T> {
  return withStore(storeName, 'readwrite', async (store) => {
    await readRequest(store.put(value));
    return value;
  });
}

export async function putManyRecords<T>(storeName: StoreName, values: T[]): Promise<T[]> {
  return withStore(storeName, 'readwrite', async (store) => {
    for (const value of values) {
      await readRequest(store.put(value));
    }

    return values;
  });
}

export async function deleteRecord(storeName: StoreName, key: IDBValidKey): Promise<void> {
  return withStore(storeName, 'readwrite', async (store) => {
    await readRequest(store.delete(key));
  });
}

export async function clearStore(storeName: StoreName): Promise<void> {
  return withStore(storeName, 'readwrite', async (store) => {
    await readRequest(store.clear());
  });
}

export async function countStore(storeName: StoreName): Promise<number> {
  return withStore(storeName, 'readonly', async (store) => {
    const result = await readRequest(store.count());
    return Number(result ?? 0);
  });
}

export type OfflineStoreName = StoreName;

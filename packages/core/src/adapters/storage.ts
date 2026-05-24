/**
 * Platform-agnostic key/value storage adapter. Web wraps `localStorage`;
 * a future React Native build can swap in MMKV or a SecureStore wrapper
 * without touching the hooks that consume this interface.
 *
 * Kept synchronous to match `localStorage` semantics — async platforms
 * (e.g. AsyncStorage) should provide an in-memory cache hydrated at boot.
 */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * In-memory fallback used during SSR (no `window`) and in tests. Keeps the
 * hook code free of `typeof window === "undefined"` guards.
 */
export function createMemoryStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

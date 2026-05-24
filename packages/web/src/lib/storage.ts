import { createMemoryStorage, type KeyValueStorage } from "@smart-zuj/core";

/**
 * Singleton storage instance for the web app. Picks `window.localStorage`
 * when available (browser) and falls back to an in-memory map during SSR
 * and Node-side tests so hook code can call it unconditionally.
 *
 * If/when the hooks that use this move into shared core, they should
 * accept the adapter as a parameter rather than importing this module —
 * mobile would inject its own (MMKV / SecureStore) implementation.
 */
export const storage: KeyValueStorage =
  typeof window === "undefined"
    ? createMemoryStorage()
    : {
        getItem: (k) => {
          try {
            return window.localStorage.getItem(k);
          } catch {
            return null;
          }
        },
        setItem: (k, v) => {
          try {
            window.localStorage.setItem(k, v);
          } catch {
            /* private mode / quota — silently give up */
          }
        },
        removeItem: (k) => {
          try {
            window.localStorage.removeItem(k);
          } catch {
            /* ignore */
          }
        },
      };

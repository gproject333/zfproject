import * as SecureStore from "expo-secure-store";

/**
 * Persists Clerk session tokens in the OS keychain so users stay signed
 * in across app launches. Clerk's docs show this exact shape — the
 * provider just reads/writes through whatever object we pass in.
 *
 * Fail-soft on read: if the keychain throws (rare; e.g. corrupted entry
 * from an OS update), we delete the bad key and return null so Clerk
 * falls back to its "signed out" state instead of crashing the boot.
 */
export const tokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      const item = await SecureStore.getItemAsync(key);
      return item ?? null;
    } catch {
      await SecureStore.deleteItemAsync(key).catch(() => {});
      return null;
    }
  },
  async saveToken(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      /* keychain unavailable — Clerk will still hold the token in memory */
    }
  },
};

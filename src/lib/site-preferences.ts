/** Small shared preferences with a memory fallback when browser storage is blocked. */
export function createBooleanPreference(key: string, storage: () => Pick<Storage, "getItem" | "setItem"> | null) {
  let value: boolean | undefined;
  const listeners = new Set<() => void>();
  const read = () => {
    try { return storage()?.getItem(key) === "on"; } catch { return value ?? false; }
  };
  const getSnapshot = () => value ?? (value = read());
  const notify = () => listeners.forEach(listener => listener());
  const sync = () => { value = read(); notify(); };
  return {
    getSnapshot,
    set(next: boolean) {
      value = next;
      try { storage()?.setItem(key, next ? "on" : "off"); } catch { /* Memory preference still works. */ }
      notify();
    },
    subscribe(listener: () => void) {
      if (!listeners.size && typeof window !== "undefined") window.addEventListener("storage", sync);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (!listeners.size && typeof window !== "undefined") window.removeEventListener("storage", sync);
      };
    },
  };
}

export function browserStorage() { return typeof window === "undefined" ? null : window.localStorage; }
export const CHAOS_STORAGE_KEY = "maria:chaos";
export const chaosPreference = createBooleanPreference(CHAOS_STORAGE_KEY, browserStorage);
export const NIGHT_STORAGE_KEY = "maria:night-palette";
export const nightPreference = createBooleanPreference(NIGHT_STORAGE_KEY, browserStorage);

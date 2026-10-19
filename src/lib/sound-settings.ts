import { SOUND_STORAGE_KEY } from "./ambience";
import { browserStorage, createBooleanPreference } from "./site-preferences";

/** A remembered preference never starts audio before this document receives a gesture. */
export function createSoundSettings(storage: () => Pick<Storage, "getItem" | "setItem"> | null = browserStorage) {
  const preference = createBooleanPreference(SOUND_STORAGE_KEY, storage);
  const listeners = new Set<() => void>();
  let activated = false;
  const activate = () => {
    if (!activated) { activated = true; listeners.forEach(listener => listener()); }
  };
  return {
    getPreference: preference.getSnapshot,
    getEnabled: () => activated && preference.getSnapshot(),
    activate,
    setEnabled(on: boolean) { activate(); preference.set(on); },
    subscribe(listener: () => void) {
      listeners.add(listener);
      const unsubscribe = preference.subscribe(listener);
      return () => { listeners.delete(listener); unsubscribe(); };
    },
  };
}

export const soundSettings = createSoundSettings();

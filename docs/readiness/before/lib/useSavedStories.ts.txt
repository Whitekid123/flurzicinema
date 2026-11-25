"use client";
import { useMemo, useState, useSyncExternalStore } from "react";

const key = "flurzi-saved-demo";
const updateEvent = "flurzi:saved-stories";
let memorySnapshot = "[]";
let useMemory = false;
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(updateEvent, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(updateEvent, listener);
  };
}
function getSnapshot() {
  if (useMemory) return memorySnapshot;
  try {
    return localStorage.getItem(key) || "[]";
  } catch {
    return memorySnapshot;
  }
}
function parseSnapshot(snapshot: string): string[] {
  try {
    const value: unknown = JSON.parse(snapshot);
    return Array.isArray(value)
      ? value.filter(
          (id): id is string =>
            typeof id === "string" && /^[a-zA-Z0-9:_-]{1,150}$/.test(id),
        )
      : [];
  } catch {
    return [];
  }
}
export function useSavedStories() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  const saved = useMemo(() => parseSnapshot(snapshot), [snapshot]);
  const [storageError, setStorageError] = useState(false);
  function toggleSaved(id: string) {
    const current = parseSnapshot(getSnapshot());
    const next = current.includes(id)
      ? current.filter((value) => value !== id)
      : [...current, id];
    memorySnapshot = JSON.stringify(next);
    try {
      localStorage.setItem(key, memorySnapshot);
      useMemory = false;
      setStorageError(false);
    } catch {
      useMemory = true;
      setStorageError(true);
    }
    window.dispatchEvent(new Event(updateEvent));
  }
  return { saved, toggleSaved, storageError };
}

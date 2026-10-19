import { loadStore, saveStore } from "./storage.ts";
import type { LoadStatus, Store } from "./types.ts";

export type Snapshot = { store: Store; status: LoadStatus };

export type StoreController = {
  getSnapshot(): Snapshot;
  subscribe(listener: () => void): () => void;
  // Re-reads storage first, so a change saved in another tab isn't overwritten.
  update(change: (store: Store) => Store): Store;
  // Re-reads storage after another tab saved.
  refresh(): void;
  // Hides the one-time "we started a fresh log" banner.
  dismissStatus(): void;
};

// The status shown after a successful save: keep the recovered banner until it's dismissed.
const afterSave = (status: LoadStatus): LoadStatus => (status === "recovered" ? "recovered" : "ok");

export function createStoreController(storage: Storage | null, clock: () => Date): StoreController {
  let snapshot: Snapshot | null = null;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());

  function current(): Snapshot {
    if (!snapshot) snapshot = loadStore(storage, clock());
    return snapshot;
  }

  // The latest saved store, or the in-memory one once the browser has stopped saving.
  function latest(): Snapshot {
    const now = current();
    if (now.status === "unavailable") return now;
    const fresh = loadStore(storage, clock());
    return fresh.status === "unavailable" ? { store: now.store, status: "unavailable" } : { store: fresh.store, status: now.status };
  }

  return {
    getSnapshot: current,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    update(change) {
      const base = latest();
      const store = change(base.store);
      const saved = base.status !== "unavailable" && saveStore(storage, store);
      snapshot = { store, status: saved ? afterSave(base.status) : "unavailable" };
      notify();
      return store;
    },
    refresh() {
      const now = current();
      if (now.status === "unavailable") return;
      snapshot = { store: loadStore(storage, clock()).store, status: afterSave(now.status) };
      notify();
    },
    dismissStatus() {
      const now = current();
      if (now.status !== "recovered") return;
      snapshot = { ...now, status: "ok" };
      notify();
    },
  };
}

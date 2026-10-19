"use client";

import { useSyncExternalStore } from "react";
import { toDateKey } from "./dates.ts";
import { STORAGE_KEY } from "./storage.ts";
import { createStoreController, type Snapshot, type StoreController } from "./store-controller.ts";
import type { Store } from "./types.ts";

let controller: StoreController | null = null;

function getController(): StoreController {
  if (controller) return controller;
  let storage: Storage | null = null;
  try {
    storage = window.localStorage;
  } catch {
    // Some private modes throw just for looking at localStorage; run in memory instead.
  }
  const created = createStoreController(storage, () => new Date());
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY || event.key === null) created.refresh();
  });
  controller = created;
  return created;
}

const subscribe = (listener: () => void) => getController().subscribe(listener);
const getSnapshot = () => getController().getSnapshot();
// The server has no localStorage, so pages render their loading state until the browser takes over.
const getServerSnapshot = () => null;

export function useStore(): {
  data: Snapshot | null;
  update: (change: (store: Store) => Store) => Store;
  dismissStatus: () => void;
  // Read at the moment of saving, so a workout logged after midnight lands on the new day.
  today: () => string;
} {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    data,
    update: (change) => getController().update(change),
    dismissStatus: () => getController().dismissStatus(),
    today: () => toDateKey(new Date()),
  };
}

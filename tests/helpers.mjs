// A Map-backed stand-in for window.localStorage. Pass { failWrites: true } or { failReads: true }
// to make setItem / getItem throw, as a full or blocked browser storage does.
export function fakeStorage({ failWrites = false, failReads = false } = {}) {
  const items = new Map();
  return {
    items,
    get length() {
      return items.size;
    },
    key: (index) => [...items.keys()][index] ?? null,
    getItem(key) {
      if (failReads) throw new Error("SecurityError");
      return items.has(key) ? items.get(key) : null;
    },
    setItem(key, value) {
      if (failWrites) throw new Error("QuotaExceededError");
      items.set(key, String(value));
    },
    removeItem: (key) => items.delete(key),
    clear: () => items.clear(),
  };
}

let counter = 0;
export const newId = () => `id-${++counter}`;

export const rows = (...sets) => sets.map(([reps, weight, done]) => ({ reps, weight, done }));

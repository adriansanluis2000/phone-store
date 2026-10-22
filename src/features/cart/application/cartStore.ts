// The number of items in the cart, persisted so that it survives reloads, and
// shared with other tabs through the storage event (ADR 0007)

// Outside the "phone-store:" prefix, which belongs to the API cache: the cache
// removes every key under it that is not its own on every start
const STORAGE_KEY = 'phone-store-cart-count';

// Subscribers in this tab: the storage event only reaches the other tabs
const listeners = new Set<() => void>();

// Set once the storage fails: from then on the count lives in memory
let memoryCount: number | undefined;

export function readCartCount(): number {
  if (memoryCount !== undefined) {
    return memoryCount;
  }
  try {
    const count = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isSafeInteger(count) && count > 0 ? count : 0;
  } catch {
    // Storage unavailable, as in some private modes
    return 0;
  }
}

/** Adds to the count, saves it and notifies every subscriber. */
export function increaseCartCount(added: number): void {
  const count = readCartCount() + added;
  if (memoryCount === undefined) {
    try {
      localStorage.setItem(STORAGE_KEY, count.toString());
    } catch {
      // Private mode or a full quota: keep counting for this session
      memoryCount = count;
    }
  } else {
    memoryCount = count;
  }
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToCartCount(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    // A null key means that another tab cleared the whole storage
    if (event.key === STORAGE_KEY || event.key === null) {
      onChange();
    }
  };
  listeners.add(onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onStorage);
  };
}

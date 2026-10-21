// The number of items in the cart, persisted so that it survives reloads, and
// shared with other tabs through the storage event

const STORAGE_KEY = 'phone-store:cart-count';

export function readCartCount(): number {
  try {
    const count = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isSafeInteger(count) && count > 0 ? count : 0;
  } catch {
    // Storage unavailable, as in some private modes
    return 0;
  }
}

export function subscribeToCartCount(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    // A null key means that another tab cleared the whole storage
    if (event.key === STORAGE_KEY || event.key === null) {
      onChange();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener('storage', onStorage);
  };
}

import { afterEach, describe, expect, it, vi } from 'vitest';

// The store keeps module state once the storage fails, so each test loads a
// fresh copy of it
async function loadStore() {
  vi.resetModules();
  return import('./cartStore');
}

describe('cartStore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds to the saved count and tells the subscribers in this tab', async () => {
    const store = await loadStore();
    localStorage.setItem('phone-store-cart-count', '2');
    const onChange = vi.fn();
    store.subscribeToCartCount(onChange);

    store.increaseCartCount(1);

    expect(store.readCartCount()).toBe(3);
    expect(localStorage.getItem('phone-store-cart-count')).toBe('3');
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('ignores an unreadable saved count', async () => {
    const store = await loadStore();
    localStorage.setItem('phone-store-cart-count', 'many');

    expect(store.readCartCount()).toBe(0);
  });

  it('keeps counting in memory when the storage fails', async () => {
    const store = await loadStore();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    store.increaseCartCount(1);
    store.increaseCartCount(1);

    expect(store.readCartCount()).toBe(2);
  });

  it('survives the clean-up of the API cache when the app starts', async () => {
    const store = await loadStore();
    store.increaseCartCount(2);

    // A fresh copy of the cache runs its start-up clean-up, as a reload does
    await import('../../../shared/cache/apiCache');

    expect(store.readCartCount()).toBe(2);
  });
});

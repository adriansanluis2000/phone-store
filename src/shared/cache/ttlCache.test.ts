import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalStorageStore, type CacheStore } from './cacheStore';
import { ONE_HOUR_MS, TtlCache } from './ttlCache';

const NOW = new Date('2026-10-21T10:00:00Z').getTime();

function createCache(store: CacheStore = new LocalStorageStore()) {
  return new TtlCache({ store, namespace: 'test', version: 1 });
}

function storeEntry(key: string, expiresAt: number) {
  localStorage.setItem(
    key,
    JSON.stringify({
      value: key,
      storedAt: expiresAt - ONE_HOUR_MS,
      expiresAt,
    }),
  );
}

describe('TtlCache', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: NOW });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('fetches on a miss and stores the value with its timestamps', async () => {
    const fetcher = vi.fn(() => Promise.resolve(['a']));

    await expect(createCache().getOrFetch('list', fetcher)).resolves.toEqual([
      'a',
    ]);

    expect(fetcher).toHaveBeenCalledOnce();
    expect(JSON.parse(localStorage.getItem('test:v1:list') ?? '')).toEqual({
      value: ['a'],
      storedAt: NOW,
      expiresAt: NOW + ONE_HOUR_MS,
    });
  });

  it('serves a hit without fetching, also after a reload', async () => {
    await createCache().getOrFetch('list', () => Promise.resolve(['a']));
    const fetcher = vi.fn(() => Promise.resolve(['b']));

    // A new instance on the same storage behaves like a page reload
    await expect(createCache().getOrFetch('list', fetcher)).resolves.toEqual([
      'a',
    ]);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('expires exactly one hour after storing and fetches again', async () => {
    const cache = createCache();
    const fetcher = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce('old')
      .mockResolvedValueOnce('new');
    await cache.getOrFetch('item', fetcher);

    vi.advanceTimersByTime(ONE_HOUR_MS - 1);
    await expect(cache.getOrFetch('item', fetcher)).resolves.toBe('old');

    vi.advanceTimersByTime(1);
    await expect(cache.getOrFetch('item', fetcher)).resolves.toBe('new');
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(JSON.parse(localStorage.getItem('test:v1:item') ?? '')).toEqual({
      value: 'new',
      storedAt: NOW + ONE_HOUR_MS,
      expiresAt: NOW + 2 * ONE_HOUR_MS,
    });
  });

  it('shares one fetch between concurrent requests', async () => {
    const cache = createCache();
    const fetcher = vi.fn(() => Promise.resolve('a'));

    const results = await Promise.all([
      cache.getOrFetch('item', fetcher),
      cache.getOrFetch('item', fetcher),
    ]);

    expect(results).toEqual(['a', 'a']);
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('does not store failures', async () => {
    const cache = createCache();
    const fetcher = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValueOnce('a');

    await expect(cache.getOrFetch('item', fetcher)).rejects.toThrow('down');
    await expect(cache.getOrFetch('item', fetcher)).resolves.toBe('a');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('rejects an aborted caller but still stores the shared result', async () => {
    const cache = createCache();
    let respond = (value: string) => value;
    const fetcher = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          respond = (value) => {
            resolve(value);
            return value;
          };
        }),
    );
    const controller = new AbortController();

    const aborted = cache.getOrFetch('item', fetcher, controller.signal);
    controller.abort();
    await expect(aborted).rejects.toHaveProperty('name', 'AbortError');

    respond('a');
    await expect(cache.getOrFetch('item', fetcher)).resolves.toBe('a');
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('falls back to memory when the storage is full', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    const cache = createCache();
    const fetcher = vi.fn(() => Promise.resolve('a'));

    await expect(cache.getOrFetch('item', fetcher)).resolves.toBe('a');
    await expect(cache.getOrFetch('item', fetcher)).resolves.toBe('a');
    expect(fetcher).toHaveBeenCalledOnce();
    expect(localStorage.getItem('test:v1:item')).toBeNull();
  });

  it('falls back to memory when the storage is unavailable', async () => {
    const unavailable = () => {
      throw new DOMException('Access denied', 'SecurityError');
    };
    const cache = createCache({
      get: unavailable,
      set: unavailable,
      remove: unavailable,
      keys: unavailable,
    });
    const fetcher = vi.fn(() => Promise.resolve('a'));

    await expect(cache.getOrFetch('item', fetcher)).resolves.toBe('a');
    await expect(cache.getOrFetch('item', fetcher)).resolves.toBe('a');
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('drops expired, unreadable and outdated entries on start', () => {
    storeEntry('test:v1:fresh', NOW + 1);
    storeEntry('test:v1:expired', NOW);
    storeEntry('test:v0:outdated', NOW + ONE_HOUR_MS);
    localStorage.setItem('test:v1:unreadable', '{');
    localStorage.setItem('another-app', 'kept');

    createCache();

    expect(Object.keys(localStorage).sort()).toEqual([
      'another-app',
      'test:v1:fresh',
    ]);
  });
});

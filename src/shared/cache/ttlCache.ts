import { MemoryStore, type CacheStore } from './cacheStore';

export const ONE_HOUR_MS = 60 * 60 * 1000;

interface CacheEntry<T> {
  value: T;
  storedAt: number;
  expiresAt: number;
}

export interface TtlCacheOptions {
  store: CacheStore;
  /** Prefix of every key, so the cache never touches other data in the store. */
  namespace: string;
  /** Bumped when the stored format changes: entries of other versions are dropped. */
  version: number;
  ttlMs?: number;
}

/**
 * Keeps successful results for a fixed time to live (ADR 0004). Concurrent
 * requests for the same key share one fetch, and failures are never stored.
 */
export class TtlCache {
  #store: CacheStore;
  readonly #namespace: string;
  readonly #prefix: string;
  readonly #ttlMs: number;
  readonly #inFlight = new Map<string, Promise<unknown>>();

  constructor({
    store,
    namespace,
    version,
    ttlMs = ONE_HOUR_MS,
  }: TtlCacheOptions) {
    this.#store = store;
    this.#namespace = `${namespace}:`;
    this.#prefix = `${namespace}:v${version.toString()}:`;
    this.#ttlMs = ttlMs;
    this.#purge();
  }

  /**
   * Returns the fresh value stored for `key`, or fetches and stores it. When
   * `signal` aborts, only this call rejects: the shared fetch goes on and
   * fills the cache for whoever asks next.
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    signal?: AbortSignal,
  ): Promise<T> {
    signal?.throwIfAborted();
    const entry = this.#read<T>(this.#prefix + key);
    if (entry) {
      return entry.value;
    }

    let request = this.#inFlight.get(key) as Promise<T> | undefined;
    if (!request) {
      request = fetcher()
        .then((value) => {
          this.#write(key, value);
          return value;
        })
        .finally(() => this.#inFlight.delete(key));
      this.#inFlight.set(key, request);
    }
    return signal ? detachOnAbort(request, signal) : request;
  }

  #read<T>(storeKey: string): CacheEntry<T> | undefined {
    const raw = this.#safely((store) => store.get(storeKey));
    const entry = raw === null ? undefined : parse<T>(raw);
    return entry && Date.now() < entry.expiresAt ? entry : undefined;
  }

  #write(key: string, value: unknown): void {
    const storedAt = Date.now();
    const entry: CacheEntry<unknown> = {
      value,
      storedAt,
      expiresAt: storedAt + this.#ttlMs,
    };
    this.#safely((store) => {
      store.set(this.#prefix + key, JSON.stringify(entry));
    });
  }

  // Runs on start: drops expired or unreadable entries and those of other versions
  #purge(): void {
    for (const storeKey of this.#safely((store) => store.keys())) {
      const stale = storeKey.startsWith(this.#prefix)
        ? !this.#read(storeKey)
        : storeKey.startsWith(this.#namespace);
      if (stale) {
        this.#safely((store) => {
          store.remove(storeKey);
        });
      }
    }
  }

  // A failing store (private mode, full quota…) moves the cache to memory for
  // the rest of the session instead of breaking the app
  #safely<R>(operation: (store: CacheStore) => R): R {
    try {
      return operation(this.#store);
    } catch {
      this.#store = new MemoryStore();
      return operation(this.#store);
    }
  }
}

function parse<T>(raw: string): CacheEntry<T> | undefined {
  try {
    const entry = JSON.parse(raw) as Partial<CacheEntry<T>>;
    return typeof entry.expiresAt === 'number'
      ? (entry as CacheEntry<T>)
      : undefined;
  } catch {
    return undefined;
  }
}

function detachOnAbort<T>(
  request: Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const abort = () => {
      reject(signal.reason as Error);
    };
    signal.addEventListener('abort', abort, { once: true });
    request.then(resolve, reject).finally(() => {
      signal.removeEventListener('abort', abort);
    });
  });
}

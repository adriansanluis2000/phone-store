/** Synchronous key-value storage of serialised entries, like Web Storage. */
export interface CacheStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  keys(): string[];
}

export class MemoryStore implements CacheStore {
  readonly #entries = new Map<string, string>();

  get(key: string): string | null {
    return this.#entries.get(key) ?? null;
  }

  set(key: string, value: string): void {
    this.#entries.set(key, value);
  }

  remove(key: string): void {
    this.#entries.delete(key);
  }

  keys(): string[] {
    return [...this.#entries.keys()];
  }
}

/**
 * Touches `localStorage` only inside each call, so a browser that forbids it
 * throws where the cache can fall back, not when this module is imported.
 */
export class LocalStorageStore implements CacheStore {
  get(key: string): string | null {
    return localStorage.getItem(key);
  }

  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  keys(): string[] {
    return Object.keys(localStorage);
  }
}

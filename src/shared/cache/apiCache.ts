import { LocalStorageStore } from './cacheStore';
import { TtlCache } from './ttlCache';

// API responses as they arrive, for one hour. Bump the version whenever the
// shape of what the API clients store changes.
export const apiCache = new TtlCache({
  store: new LocalStorageStore(),
  namespace: 'phone-store',
  version: 1,
});

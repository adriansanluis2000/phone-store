# 0004. Client cache for API responses

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

The statement asks to store every API response in the client and reuse it for one hour, after which it must be revalidated, with any storage of the browser or in memory. The API sends no `Cache-Control` header, so the HTTP cache of the browser does not avoid any request. Avoiding requests matters here: a sleeping server takes up to a minute to answer ([API notes](../api-notes.md)).

## Decision

A generic `TtlCache` over a synchronous key-value store, with one instance for the API responses.

- **What is stored:** each response as the API sends it, with `storedAt` and `expiresAt`. Mapping to the domain happens after reading, so changing a mapper never requires invalidating the cache.
- **Expiry:** one hour. An entry is fresh while the current time is before `expiresAt`. After that, the next read fetches again and rewrites the entry. Expired data is never served, as the statement asks.
- **Storage:** `localStorage`, which survives reloads and is shared between tabs. The whole catalogue takes about 200 KB (16 KB for the list and 1.5 KB per detail). If the storage fails, because of private mode, a full quota or a browser that forbids it, the cache moves to memory for the rest of the session.
- **Keys:** namespaced and versioned, such as `phone-store:v1:GET /api/product`. On start, the cache drops expired or unreadable entries and those of other versions, and leaves other keys alone.
- **Concurrency:** requests for the same key share a single fetch, and failures are never stored.
- **Cancellation:** an aborted caller stops waiting, but the shared fetch goes on and fills the cache for the next one.
- **Scope:** only GET responses. Adding to the cart is never cached.

## Alternatives

- **TanStack Query with its persistence plugin.** It covers all of the above, but hides the design the statement asks for ([ADR 0001](0001-technology-stack.md)).
- **sessionStorage.** Lost when the tab closes, so it would refetch far more often than once an hour.
- **IndexedDB.** A larger quota and an asynchronous API, neither needed for 200 KB.
- **A service worker with the Cache API.** Caching at the HTTP level adds a worker lifecycle to manage and test, for the same result.
- **Stale-while-revalidate.** Faster after expiry, which matters with cold starts, but it would show data older than an hour, against the statement.
- **Storing domain objects.** Smaller entries, but the stored format would follow the domain, and every mapper change would need a new version.

## Consequences

- Within an hour, coming back to a page makes no request to the API, even after a reload.
- After an hour, the first view waits for the API again, cold start included.
- Bumping the version invalidates every user's cache after the next deployment.
- Entries are shared between tabs, but deduplication of requests in flight works within each tab only.

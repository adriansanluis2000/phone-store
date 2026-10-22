# 0007. Cart count kept in the browser

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

The statement asks to show in the header the `count` returned by `POST /api/cart`, in every view and persisted. The API counts per session, identified by a cookie that the browser never sends: the API answers `Access-Control-Allow-Origin: *`, and the client sends no credentials ([ADR 0003](0003-http-client.md)). Every add starts a new session, so `count` is always 1 ([API notes](../api-notes.md)).

## Decision

- **The browser accumulates the count:** each add adds the `count` of the response to the saved one.
- **It is saved in `localStorage`**, so it survives reloads, and other tabs follow it through the storage event. Its key stays outside the cache's `phone-store:` prefix, since the cache removes any other key under it when the app starts. Subscribers in the same tab are notified directly. If the storage fails, the count lives in memory for the session.
- **Only the number is kept**, not the lines of the cart, since the statement asks for the counter only.

## Alternatives

- **Showing the `count` as it arrives.** It would always show 1.
- **Serving the API from the app's origin through a proxy**, so the session cookie travels. The count would depend on a session cookie that ends with the browser and on a server that sleeps and restarts, and the app would need a proxy wherever it is hosted.
- **Adding 1 per add, ignoring the response.** The same result today, but it ignores what the statement asks to show.

## Consequences

- The counter is reliable across reloads, tabs and browser restarts, on one device.
- It cannot be emptied from the app, since there is no cart page, and it does not match any count on the server.

# 0005. Route data with loaders and Suspense

- **Status:** Accepted, amended by [0012](0012-return-to-the-list-where-the-user-left-it.md)
- **Date:** 2026-10-21

## Context

In data mode, React Router runs the loaders of a route before rendering it. A loader that awaits the API holds the whole page until the data arrives, and the first request after the server has been idle takes a minute or more ([API notes](../api-notes.md)). During that time the user would see nothing, not even the header, and could not tell the app from a broken page.

## Decision

- **Loaders start the request and return its promise unresolved**, inside an object such as `{ products }`, as React Router documents for streaming data.
- **Pages render at once.** The layout, the header and the page heading appear immediately. Only the part that needs the data waits, inside `<Suspense>` and `<Await>`, with the loading state as fallback.
- **Components under `<Await>` receive resolved data**, so they are plain components, easy to test with fixtures.
- **A failed request reaches the route's error boundary**, which renders inside the layout and retries by revalidating the loaders.
- **Requests carry the loader's `AbortSignal`**, with the cancellation semantics of [ADR 0004](0004-client-cache.md).
- **Each promise gets an early no-op handler.** A fast failure can reject before `<Await>` attaches its own, and would otherwise be reported as an unhandled rejection.

## Alternatives

- **Awaiting the data in the loader.** The simplest option, and navigations keep the previous page on screen until the next one is ready. But the first load renders nothing for as long as a cold start lasts, apart from a fallback outside the layout.
- **Fetching in components with effects.** The request only starts after the first render, and the router's cancellation and error boundaries are lost.
- **`React.use()` instead of `<Await>`.** Equivalent for pages. `<Await>` also accepts an error element, useful where a failure should stay local, so it is used everywhere for consistency.

## Consequences

- The app shows its structure at once, even while the server wakes up, and each view decides what its loading state looks like.
- When the cache answers, the loading state lasts an instant, since the page still receives a new promise.
- A loader also re-runs when the search parameters change. The product list will opt out of that when the search moves to the URL, since filtering happens in the browser.

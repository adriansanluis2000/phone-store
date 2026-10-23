# 0012. Return to the list where the user left it

- **Status:** Accepted
- **Date:** 2026-10-23

## Context

A list of 100 products is long, above all on a phone. Coming back from a product, with the browser button or with "Volver al listado", the list kept its search ([ADR 0006](0006-search-in-the-url.md)) but always started from the top, so the user lost their place. Three things caused it:

- Moving the focus to the new page, so that screen readers announce it, also scrolled the page: back on the list, focusing its heading jumped to the top.
- React Router restores the scroll position as soon as the page renders, which was while the list showed its skeleton ([ADR 0005](0005-route-data-with-suspense.md)). The skeleton is much shorter than the list, so the restored position was cut short.
- "Volver al listado" was a plain link: a new visit to the list, which starts at the top by design.

These decisions were taken in `v1.0.0` and are recorded here, amending ADRs 0005 and 0006.

## Decision

- **The focus moves without scrolling.** `ScrollRestoration` alone places the page: at the top of a new one, and where the user left it when going back.
- **The list takes its products straight from the cache when they are fresh**, as a plain value that `<Await>` renders without suspending. The whole list is on screen in the first render, so the restored position is not cut short. Otherwise the loader still returns the request unresolved, as ADR 0005 decided.
- **"Volver al listado" goes back in history** when the user came from the list, as the browser button does. A product opened from elsewhere, such as a shared link, still links to the whole list, at the top.
- **An end-to-end test checks both ways back**, by the link and by the browser, on a desktop and a phone.

## Alternatives

- **Restoring the scroll position by URL** instead of by history entry. "Volver al listado" could stay a plain link, but the logo and "Inicio" would also reopen the list halfway down.
- **Restoring the position by hand once the data arrives.** More code, racing the router's own restoration.
- **Awaiting the data in every loader.** The list would always render whole, but the first load would show nothing for as long as the API takes to wake up.

## Consequences

- Going back to the list keeps the search and the place, and the list shows at once, without a skeleton, when the cache holds it.
- The detail still shows its loading state for an instant when the cache answers, since it receives a new promise.
- "Volver al listado" behaves as the browser button only when the previous entry is the list, which the navigation state records.

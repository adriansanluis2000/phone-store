# 0006. Product search in the URL

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

The statement asks to filter the product list by brand and model in real time, with every change of the search box. The API has no search endpoint, and the whole list is already in the browser, cached for an hour ([ADR 0004](0004-client-cache.md)). A search typed before opening a product should still be there when the user comes back, and a filtered list is worth sharing as a link.

## Decision

- **Filtering happens in the browser** with a pure domain function, `filterProducts`. It ignores case and accents, and keeps the products whose "brand model" contains every word of the query, in any order and as part of a word. A blank query keeps them all.
- **The term lives in the URL**, as `?q=`, updated on every keystroke:
  - replacing the history entry, so that Back leaves the list instead of undoing the search letter by letter;
  - synchronously, so that the input keeps up with typing;
  - without scrolling the page to the top.
- **Changing the search does not reload the list.** The route opts out of revalidation when only the search parameters change. A retry keeps the same URL, so it still reloads.
- **The number of results is announced** in a polite live region: "100 móviles", or "3 de 100 móviles" while filtering.
- **The search box is ready before the data**: it lives outside the suspended part of the page, so the user can type while the server wakes up.

## Alternatives

- **Searching in the API.** It offers no such endpoint.
- **Keeping the term in component state.** Simpler, but it is lost when coming back from a product, and the result cannot be shared.
- **A new history entry per change.** Back would undo the search one letter at a time.
- **Debouncing the input.** Filtering 100 products takes well under a millisecond, and a delay would go against filtering on every change.
- **Fuzzy matching**, with a library such as Fuse.js. It tolerates typos, but adds a dependency and returns results that are harder to predict for short brand and model names.

## Consequences

- Coming back from a product restores the search, and a filtered list can be shared as a link.
- Matching parts of words narrows the results while typing, but "tab 10" also finds "Iconia Tab A1-810".
- The URL changes on every keystroke, which only replaces the current history entry.

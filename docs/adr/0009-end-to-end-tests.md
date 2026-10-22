# 0009. End-to-end tests

- **Status:** Accepted
- **Date:** 2026-10-22

## Context

The unit and component tests cover each piece with the network mocked by MSW, but not the whole app in a real browser: the production build, the router, real layout and focus, storage across reloads, and the requirements that can only be seen, such as four products per row at most. The API takes a minute or more to wake up ([API notes](../api-notes.md)), so tests that depend on it would be slow and flaky.

## Decision

- **Playwright against the production build**, served by `vite preview`, in Chromium on a desktop and an emulated phone.
- **The API is mocked in the browser** with the same real responses as the unit tests, and product pictures with a neutral placeholder, so no test waits on the real servers.
- **The full journey is covered**: search, open a product, choose storage and colour, add to the cart, see the count survive a reload, and come back to the same search.
- **The grid is measured** at 360, 768, 1024 and 1440 px, which turns the visual requirement of four products per row at most into a check.
- **axe checks WCAG 2.2 AA** on the list and the detail, in the light and the dark theme.
- **Any error in the browser console fails the test**, which also catches requests blocked by the Content Security Policy.
- **A smoke test talks to the real API**, run on demand with `npm run test:smoke` and not in CI.
- **CI runs two browsers at a time** and keeps the report and traces of failed runs as an artifact.

## Alternatives

- **Cypress.** Comparable for this app, but heavier to run in CI and without a built-in way to emulate devices per project.
- **The real API in CI.** It would test the integration on every push, at the cost of cold starts of a minute or more and failures that do not depend on the code.
- **Firefox and WebKit as well.** They would triple the run time for an app that uses no browser-specific API; they can be run locally when needed.

## Consequences

- Every push checks the app as a user would use it, in a few minutes of CI.
- A change in the real API would not fail these tests; the smoke test and the API notes are the way to notice it.

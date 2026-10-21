# 0001. Technology stack

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

The statement asks for a single-page application in React or Preact, with routing on the client, no server-side rendering, and `start`, `build`, `test` and `lint` scripts. It values the detail of the design, a structure faithful to the wireframes and a history that grows by milestones. The data comes from an existing REST API whose responses must be cached in the browser for one hour.

The data is irregular: prices arrive as strings and are sometimes empty, cameras are either a string or a list, and some fields are misspelt or swapped (see the [API notes](../api-notes.md)). The stack has to keep that mess at the edge and make the rest of the code easy to read and test.

## Decision

- **TypeScript in strict mode on React 19.** The statement allows plain JavaScript, but types let the compiler check that the irregular API data is normalised once, at the edge, and document the domain for the reader.
- **Vite** as development server and build tool. Its output is a static SPA, which is exactly what the statement asks for.
- **React Router in data mode** (`createBrowserRouter`). Loaders fetch the data a route needs before it renders, error elements handle failed loads per route, and route handles feed the breadcrumbs.
- **CSS Modules and design tokens** as custom properties, without a component library. The design is evaluated, so it is built by hand on a small set of tokens that also drive the dark theme.
- **No global state library.** The only shared state is the number of items in the cart, kept in a minimal store read through `useSyncExternalStore`.
- **Own data layer**: an HTTP client on top of `fetch` and a cache with a time to live. The statement asks to design the cache, so it is written and tested here rather than delegated.
- **Tests** with Vitest, Testing Library and MSW, and end to end with Playwright and axe.
- **Quality** checks with ESLint (typescript-eslint, React hooks, jsx-a11y and layer boundaries), Prettier and the TypeScript compiler, run in CI on every push.
- **Exact versions** (`save-exact`) and a committed lockfile. Node.js 24, the current LTS, is pinned in `.nvmrc`. The `engines` field states the real minimum, Node.js 22.22, set by React Router.

Two dependencies are deliberately one major version behind the latest:

- **TypeScript 6.0, not 7.0.** typescript-eslint 8.72 supports TypeScript up to 6.0.
- **ESLint 9, not 10.** The latest eslint-plugin-jsx-a11y, 6.10.2, supports ESLint up to version 9 and has not been released since October 2024.

## Alternatives

- **Plain JavaScript.** Allowed by the statement, but the irregular API data would only be checked at runtime.
- **A framework with server rendering** (Next.js, React Router framework mode). The statement rules out SSR and MPA, and their extra build layer adds nothing to a client-only app.
- **TanStack Query or SWR.** They deduplicate, cache and revalidate requests out of the box, but would hide the cache design the statement asks for.
- **Tailwind CSS or a component library** (MUI, Chakra UI). Faster to start, but the result looks generic, and the design is part of the evaluation.
- **Redux or Zustand.** Too much machinery for a single counter.
- **Oxlint**, the linter that create-vite now generates. Much faster, but it has no equivalent of the layer boundary rules and its type-aware rules are still early.
- **ESLint 10 with eslint-plugin-jsx-a11y-x**, a fork that supports it. At version 0.2.0 it is too young to depend on.

## Consequences

- The HTTP client and the cache are our own code to maintain, so they come with their own tests and are kept small.
- Moving to ESLint 10 and TypeScript 7 waits on eslint-plugin-jsx-a11y and typescript-eslint supporting them.
- Every dependency upgrade is an explicit change in `package.json` and the lockfile, never a silent range update.

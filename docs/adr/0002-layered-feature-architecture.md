# 0002. Layered architecture by feature

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

The app is small, two views and a cart, but it sits on an API whose data needs cleaning, a cache with its own rules and a design that is evaluated in detail. Without a structure, API quirks leak into components and data fetching mixes with rendering. The structure also has to be obvious to a reviewer who opens the repository for the first time.

## Decision

The code is split by feature first and by layer second:

- `app/`: router, root layout and global styles.
- `pages/`: one component per route, composition only.
- `features/<feature>/`, for `products` and `cart`:
  - `domain/`: types and pure functions, in plain TypeScript.
  - `infrastructure/`: API clients, DTOs and the mappers from the API format to the domain.
  - `application/`: route loaders and hooks, the only entry point of the UI to the data.
  - `ui/`: components.
- `shared/`: code with no feature knowledge, such as the HTTP client, the cache and UI primitives.

Dependencies point inwards: `app` → `pages` → `features` → `shared`, and `ui` → `application` → `infrastructure` → `domain` within a feature. ESLint enforces it with `import-x/no-restricted-paths`, and `no-restricted-imports` keeps packages, React included, out of the domain. A violation fails lint and therefore CI.

`application` imports `infrastructure` directly, without ports in between. Ports are introduced where a second implementation exists, such as the search strategies of the AI extra. Tests replace the network with MSW rather than replacing modules, so they exercise the real mappers and cache.

## Alternatives

- **Folders by type** (`components/`, `hooks/`, `services/`). Familiar, but a feature ends up scattered across the tree and nothing stops a component from calling the API.
- **Ports and adapters for every API.** The domain would own an interface for each data source and the app would inject the implementation. With a single implementation and MSW for tests, each interface would be ceremony without a second user.
- **Feature-Sliced Design.** A well-known standard, but its layers (entities, widgets, processes…) are more than two views need.
- **eslint-plugin-boundaries.** More expressive rules, but its latest version, 7.2.0, pins a vulnerable `handlebars` and depends on `braces` through `micromatch`, which has a high-severity advisory with no fixed version. `npm audit` would fail for a lint rule. eslint-plugin-import-x has no known vulnerabilities and covers what we need.

## Consequences

- Imports that cross layers in the wrong direction fail in the editor and in CI, not in review.
- Moving a module between layers is a visible change, and the folder of a file tells what it may depend on.
- Rules for imports between features, such as the product actions adding to the cart, are set when that dependency appears.

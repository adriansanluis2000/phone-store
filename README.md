# Phone Store

[![CI](https://github.com/adriansanluis2000/phone-store/actions/workflows/ci.yml/badge.svg)](https://github.com/adriansanluis2000/phone-store/actions/workflows/ci.yml)

Solution to a front-end technical test: a single-page application in React to browse and buy mobile phones, built on top of an existing REST API.

> **Status:** in development. The [milestones](#milestones) show what comes next.

## What it does

The statement asks for two views and a shared header:

- **Product list.** Shows every product the API returns, at most four per row and adapted to the screen size, with a search box that filters by brand and model on every keystroke. Selecting a product opens its detail.
- **Product detail.** Two columns: the product image on one side, and its description and actions on the other. The actions let the user choose storage and colour, preselected when there is only one option, and add the product to the cart. A link leads back to the list.
- **Header.** The app title links to the list, breadcrumbs show where the user is, and the number of items in the cart is shown on the right in every view, persisted across reloads.

API responses are cached in the browser for one hour and fetched again once they expire.

## Getting started

Requires Node.js 24, the version in [`.nvmrc`](.nvmrc), and npm.

```bash
npm ci
npm start
```

The app runs at <http://localhost:5173>.

| Script               | What it does                                                 |
| -------------------- | ------------------------------------------------------------ |
| `npm start`          | Development server with hot reload                           |
| `npm run build`      | Type-checks and builds for production into `dist/`           |
| `npm run preview`    | Serves the production build locally                          |
| `npm test`           | Runs the unit and component tests once                       |
| `npm run test:watch` | Runs the tests in watch mode                                 |
| `npm run lint`       | Checks the code with ESLint and the formatting with Prettier |
| `npm run typecheck`  | Type-checks the project                                      |
| `npm run format`     | Formats the code with Prettier                               |

The API runs on a free plan that sleeps when idle, so the first request after a quiet period can take a minute or more. After three seconds of waiting, the app tells the user that the server is waking up.

## Stack

| Area       | Choice                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------- |
| Base       | Vite, React 19 and TypeScript in strict mode                                             |
| Routing    | React Router in data mode (loaders, error boundaries, route handles for the breadcrumbs) |
| Styles     | CSS Modules and design tokens as custom properties, no component library                 |
| Data       | Own HTTP client and TTL cache on top of `fetch` and `localStorage`                       |
| Tests      | Vitest, Testing Library and MSW; Playwright and axe end to end                           |
| Quality    | ESLint, Prettier and the TypeScript compiler, run by GitHub Actions on every push        |
| Deployment | Vercel                                                                                   |

The reasons behind each choice are recorded as [architecture decision records](docs/adr/).

## Architecture

The code is split by feature and, within each feature, by layer ([ADR 0002](docs/adr/0002-layered-feature-architecture.md)):

```text
src/
├── app/                  router, root layout and global styles
├── pages/                one component per route, composition only
├── features/
│   ├── products/
│   │   ├── domain/          types and pure functions, no React
│   │   ├── infrastructure/  API client and mappers from the API format
│   │   ├── application/     loaders and hooks used by the UI
│   │   └── ui/              components
│   └── cart/             same layers
└── shared/               HTTP client, cache, UI primitives and helpers
```

Dependencies point inwards, from `app` to `shared` and from `ui` to `domain`, and ESLint fails on any import in the opposite direction. The API's misspelt fields and irregular values are absorbed by the mappers and never reach the UI (see the [API notes](docs/api-notes.md)).

## Milestones

| Phase | Goal                                                                  | Release  |
| ----- | --------------------------------------------------------------------- | -------- |
| 0     | Project setup, CI and API exploration                                 |          |
| 1     | Data layer: HTTP client, cache and API clients                        |          |
| 2     | App skeleton: routing, layout and header                              |          |
| 3     | Product list page                                                     | `v0.1.0` |
| 4     | Product detail page and cart, with every requirement of the statement | `v0.2.0` |
| 5     | Production: end-to-end tests, performance and deployment              | `v1.0.0` |
| 6     | Extra: natural language search powered by Claude                      | `v1.1.0` |
| 7     | Final review and documentation                                        |          |

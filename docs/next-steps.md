# Next steps

Improvements that were considered and left out on purpose. Most depend on data or endpoints the API of the test does not offer; the rest go beyond what the statement asks for. None of them is planned for this test.

## Limited by the API

- **A cart page.** The API only counts additions: `POST /api/cart` always answers a count of one, and there is no endpoint to read or change the cart (`GET /api/cart` answers 404). Listing, removing or changing items would need a cart service of its own ([ADR 0007](adr/0007-cart-count-in-the-browser.md)).
- **A price per storage or colour.** Each product has a single price, whatever the options chosen.
- **A picture per colour, and larger pictures.** Each product has one small picture, of 139 × 184 or 160 × 212 px, the same for every colour.
- **Filtering the list by colour, storage or other features.** The list only brings brand, model and price. The rest is in the detail of each product, and fetching 100 details from a server that takes a minute to wake up is not reasonable for a list. With those fields in the list, the smart search could filter by them as well.
- **Telling a missing product from a server failure.** The API answers 500 to both, so the app shows the same error, with a way to retry and a link back to the list.
- **A faster first visit.** The free plan behind the API sleeps when idle. The app explains the wait, but only the API can remove it.

## Beyond the statement

- **A rate limit for the smart search.** It needs a store shared by every instance of the function, such as Vercel KV. Today the request limits and the spending limit of the key cap the cost ([ADR 0011](adr/0011-natural-language-search.md)).
- **An evaluation set for the smart search.** A list of searches with the filters they should produce, run against the model whenever the prompt or the model changes.
- **A scheduled smoke test against the real API**, to notice changes in it. The end-to-end tests use saved responses on purpose ([ADR 0009](adr/0009-end-to-end-tests.md)), and the smoke test runs on demand.
- **Performance budgets in CI**, with Lighthouse CI, so that a regression fails the build.
- **Server-side rendering.** The statement asks for a single-page application without it.

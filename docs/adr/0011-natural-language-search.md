# 0011. Natural language search with Claude

- **Status:** Accepted
- **Date:** 2026-10-23

## Context

As an extra beyond the statement, the list offers a smart search: the user describes what they want, such as "un Acer por menos de 200 € ordenado por precio", and the list shows it. A language model can read that sentence, but it needs an API key that must never reach the browser, it costs money on every call, it can fail or be slow, and its free text cannot be applied to a list. The list itself only knows brand, model and price, and the search of the statement must stay exactly as it is.

## Decision

- **Both searches produce the same filters.** `ProductFilters` (brands, keywords, minimum and maximum price, sort by price) and the pure `applyFilters` live in the domain. A `SearchStrategy` turns what the user typed into filters: the text search of the statement does it at once on every change, and stays the default; the smart search asks a service once the search is sent.
- **A serverless function holds the key.** `POST /api/ai-search` runs on Vercel, on the same domain as the app, so the Content Security Policy does not change. The logic lives in `server/`, and the Vite development server serves the same function, so a key in `.env.local` and `npm start` are enough to try it.
- **Structured output, not free text.** The function calls Claude through the official SDK with a zod schema as the output format, so the answer is always a valid set of filters. It keeps only brands of the catalogue, a few short keywords and sensible prices.
- **The catalogue anchors the answer.** The browser sends the brands and model names it already has, so the model uses the catalogue's own words, such as "Tab" when the user asks for a tablet. The prompt says that nothing but brand, model and price can be filtered.
- **What cannot be filtered is said, not guessed.** A colour or a capacity, which only the detail of each product knows, comes back apart, in the user's words, and the list tells the user that it cannot filter by it. A keyword found nowhere in the catalogue would leave the list empty, so the function moves it there too.
- **A fast, cheap model, kept short.** Claude Haiku 5.5 by default, configurable with `AI_SEARCH_MODEL`, without extended thinking, at low effort, with at most 512 output tokens, a timeout of 10 seconds and one retry. A search costs about $0.0001.
- **Limits on what can be spent.** Searches of up to 200 characters, a catalogue of bounded size, requests only from the app's own origin, and the same search answered from the browser cache for an hour.
- **Both sides validate.** The request and the response follow one zod contract, checked by the function and again by the browser.
- **The interpreted filters live in the URL**, next to the query, so they survive a visit to a product, can be shared, and never need a second call to the model. The user sees them as chips, and can remove them or change the prices and the order.
- **It degrades to the text search.** The smart search only shows when `VITE_AI_SEARCH_ENABLED` is set. Without a key the function answers 503, and on any failure the list goes back to the text search with a notice.

## Alternatives

- **Calling the Claude API from the browser.** The key would be public.
- **Free text parsed with rules or regular expressions.** Fragile, and a structured output already guarantees the shape.
- **Forced tool use for the structured answer.** The documented way is now an output format, which the SDK validates against the same zod schema.
- **The function reading the catalogue from the API.** The server behind the API sleeps for a minute when idle, and the browser already has the catalogue.
- **Filtering by colour or storage.** The list does not have them: it would mean fetching the detail of every product from an API that takes a minute to wake up.
- **A bigger model.** Reading a short search does not need it, and it would be slower and dearer.
- **A rate limit per client.** It needs a store shared by every instance of the function, such as Vercel KV, which is one more service for a demo. The origin check stops other sites, not a determined script; the spending limit of the Anthropic Console caps the cost.
- **Interpreting on every keystroke.** One call per letter, and results that jump while typing.

## Consequences

- The smart search is an addition: with it disabled or failing, the list behaves exactly as the statement asks.
- Each smart search takes about a second and costs a fraction of a cent; repeated searches cost nothing.
- Without a rate limit, the cost of abuse is bounded only by the request limits and the spending limit set in the Anthropic Console, which the README asks to configure.
- Tests never call the model: the function is tested with the SDK mocked, and the browser with the function mocked.

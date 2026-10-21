# 0003. HTTP client: timeouts, retries and cancellation

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

The API runs on a free instance that sleeps when idle. Its host documents that waking up takes about a minute, and our measurements of the first request were 42 s, 52 s and more than 60 s ([API notes](../api-notes.md)). Once awake it answers in under 100 ms. Requests can also fail for transient reasons, such as a network blip or a 5xx while the instance restarts. Adding to the cart is not idempotent, and leaving a view should cancel the requests it no longer needs. The UI has to tell these failures apart to show a useful message.

## Decision

A small client on top of `fetch` with JSON bodies, returned as `unknown` so that each API client casts them to its DTOs and maps them to the domain.

- **Timeout of 90 seconds per attempt**, with margin over the longest cold start measured. The timeout does not shorten the wait; it only decides when to give up on a server that will never answer. Telling the user that the server is waking up is the job of the UI, after about 3 seconds, not of the client.
- **GET requests are retried up to twice** after a network error or a 5xx, with exponential backoff and equal jitter from a base of 500 ms. Client errors, timeouts and cancellations are not retried. The API answers 500 for an unknown product, so that error arrives after about a second of retries; the API offers no way to tell it apart from a real failure.
- **POST requests are never retried**, since a repeated request would add the product to the cart twice.
- **Cancellation:** the caller's `AbortSignal` is combined with the timeout. When the caller aborts, the request rejects with the signal's reason, the `AbortError` that React Router expects from cancelled loaders.
- **Typed errors:** `HttpError` with the status, `NetworkError` and `TimeoutError`. A malformed body propagates as the parser's error.
- **No cookies** (`credentials: 'omit'`). The API needs none, and its session cookie would travel only if the app were served from the API's origin through a proxy, which would change the meaning of the cart count depending on where the app is hosted.

## Alternatives

- **ky or axios.** ky covers timeouts and retries in a few kilobytes, and axios adds interceptors on top of XHR. Both are a dependency for about 80 lines of code we want to control and explain.
- **A short timeout retried on expiry.** With 10 seconds and two retries, the client gives up after about 30 seconds, before a 40 to 50 second cold start ends. Covering it would take more attempts against a server that is still starting.
- **60 seconds and one retry after a timeout.** The server keeps starting during the first attempt, so the second would usually find it awake. It works, but it adds an exception to the retry rule to get what a longer timeout gives.
- **Retrying POST with an idempotency key.** The API does not support one.

## Consequences

- A request to a server that never answers takes a minute and a half to fail, so the UI must show progress meanwhile.
- An unknown product shows its error about a second later than a single attempt would.
- The cart count returned by the API is always 1 for this client, which the cart has to take into account.

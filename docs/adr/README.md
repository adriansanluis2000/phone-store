# Architecture decision records

Every significant decision is recorded as a short ADR, in [Michael Nygard's format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) with an extra _Alternatives_ section. New ADRs start from the [template](template.md), are numbered in sequence and are committed together with the change they describe. An accepted ADR is not rewritten: a new one supersedes it.

| ADR                                               | Title                                           | Status   |
| ------------------------------------------------- | ----------------------------------------------- | -------- |
| [0001](0001-technology-stack.md)                  | Technology stack                                | Accepted |
| [0002](0002-layered-feature-architecture.md)      | Layered architecture by feature                 | Accepted |
| [0003](0003-http-client.md)                       | HTTP client: timeouts, retries and cancellation | Accepted |
| [0004](0004-client-cache.md)                      | Client cache for API responses                  | Accepted |
| [0005](0005-route-data-with-suspense.md)          | Route data with loaders and Suspense            | Accepted |
| [0006](0006-search-in-the-url.md)                 | Product search in the URL                       | Accepted |
| [0007](0007-cart-count-in-the-browser.md)         | Cart count kept in the browser                  | Accepted |
| [0008](0008-features-do-not-import-each-other.md) | Features do not import each other               | Accepted |
| [0009](0009-end-to-end-tests.md)                  | End-to-end tests                                | Accepted |

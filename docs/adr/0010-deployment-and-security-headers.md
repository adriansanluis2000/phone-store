# 0010. Deployment and security headers

- **Status:** Accepted
- **Date:** 2026-10-22

## Context

The app is a static SPA: every path has to serve `index.html` and let the router take over. It talks to a single API on another host and loads product pictures from it. Being public, it should send the security headers a reviewer expects, and the AI extra of the next phase needs a server-side function that keeps the Claude API key out of the browser.

## Decision

- **Vercel hosts the app**, built from `main` on every push, with a preview deployment per pull request.
- **`vercel.json` holds the whole configuration**, versioned with the code:
  - every path that is not a file is rewritten to `index.html`;
  - a Content Security Policy that allows the app's own scripts, styles and fonts, and only the API host for requests and pictures, with no inline scripts or styles, no plugins and no framing;
  - `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and `X-Frame-Options`;
  - a year of cache for the hashed files under `/assets`.
- **`vite preview` sends the same headers**, read from `vercel.json`. The end-to-end tests run against it and fail on any console error, so a resource blocked by the policy fails CI before it reaches production.
- **Functions for the AI extra** will live in `api/`, on the same domain as the app.

## Alternatives

- **Netlify.** Equivalent for the static app and the headers; publishing a function under `/api` takes an extra piece of configuration.
- **GitHub Pages.** No custom headers, so no real Content Security Policy, and no functions.
- **Render, which hosts the API.** Its free static sites would do, but not a function without a server that sleeps like the API.
- **A looser policy with `'unsafe-inline'`.** Not needed: React applies inline styles, such as the colour swatches, through the DOM, which the policy allows.

## Consequences

- The deployment configuration is reviewed and versioned like the code, and the policy is tested on every push.
- Calling a new host, such as another API or an analytics service, requires adding it to the policy first.

# AI-assisted development

I built this solution with an AI coding agent, Claude Code, working under my direction. I wrote the specification, reviewed every phase in the browser, took the decisions and approved every commit, push and tag. This page describes how that worked, including where the agent got things wrong and how they were caught.

## The method

Before any code, I wrote a specification for the agent. The specification itself stays out of the repository, as it was written for the agent and not as project documentation. It covered:

- the goals and what the reviewers of the test look at: the detail of the design, the structure of the wireframes and a history that grows by milestones;
- the requirements of the statement, each traced to the phase and the check that proves it;
- the expected shape of the API, to be verified with real requests before relying on it;
- the stack, the architecture and the detailed behaviour of the cache, the HTTP client, both views, the design and accessibility;
- a plan in eight phases, each with its suggested commits, and the working rules for the agent.

The working rules shaped the whole project:

- **Phase by phase, with a gate at each end.** Every phase starts with a plan: what changes, which files, which new dependencies (with exact versions and why) and which decisions are open, each with a proposed default. Nothing starts until I approve the plan. Every phase ends with the verification output, a check of the interface in a real browser at phone and desktop sizes, a summary and a proposal of commits.
- **Nothing irreversible without explicit approval.** No commit, push or tag until I say so.
- **A history that tells the story.** Small, atomic commits in Conventional Commits format, each passing lint, type checks, tests and build.
- **Versions from the source, not from memory.** The latest stable versions were checked on the npm registry and pinned exactly. TypeScript 7 and ESLint 10 were the latest, but the TypeScript rules for ESLint did not support them yet, so the agent proposed TypeScript 6 and ESLint 9. The usual plugin for architectural boundaries pulled vulnerable dependencies, so the boundaries are enforced with `eslint-plugin-import-x` instead.
- **Decisions written down.** Each relevant decision goes into an [ADR](adr/) in the same commit as the change.
- **Stop when reality disagrees.** The API was explored first, and it did contradict the specification: product ids are strings, an unknown product answers 500, and the cart always answers a count of one, so the count is kept in the browser ([ADR 0007](adr/0007-cart-count-in-the-browser.md)). The findings are in the [API notes](api-notes.md).

## How each commit was verified

The agent did the work of a phase in the working tree, but did not commit as it went. Before proposing the commits, it saved the files of each commit as a snapshot, applied the snapshots one by one to a fresh clone of the repository, and ran lint, type checks, tests and build on every intermediate state, and the end-to-end tests where the interface changed. It then ran the commit script in another clone and compared the resulting Git tree with the working tree, so the commits I approved were exactly the ones that had been tested.

That discipline caught real problems:

- Once, a commit picked up files that were already staged in the index. It was noticed before the push, the local commits were redone with my approval, and the commit script now refuses to run when anything is staged.
- A test of the smart search passed on my machine and failed in the clean clone: a notice appeared a moment before the URL changed, and the test checked too early. It now waits for the change, as do the other assertions that depend on the URL.

Performance claims follow the same rule. The README's Lighthouse scores were measured on the deployed app, and every fix of the layout shift was measured before and after.

## Where review and data changed the course

The agent was fast and thorough, but not always right. These are the moments that mattered most.

- **A slow server is a waiting problem, not a timeout problem.** The API sleeps when idle and takes a minute or more to wake up. The first proposal was to raise the timeout. I pushed back: the real problem was a wait that nobody explained. After three seconds the app now says that the server is waking up, and the timeout was raised as well, so the first visit does not fail.
- **Colour names alone were too poor.** The API has a single picture per product, so the agent proposed colour chips with the name only. I asked for the closest colours instead, and the agent built a table for the 50 names of the catalogue, with a neutral pattern for names that are not colours, such as "Various".
- **Designed for the screen it would be reviewed on.** On a 1080p screen, the actions of the product detail were below the fold. Reviewing it in the browser led to a description in two columns and no repeated brand, model and price.
- **A wrong hypothesis about a layout shift.** Lighthouse found a layout shift on the product detail for phones. The agent's first explanation, a loading message, changed nothing when measured. Measuring with the pictures blocked showed the real cause: a CSS rule discarded the size of the pictures until they loaded. It also showed that the API serves pictures in two sizes, which the app now shows at the same size. The shift went to zero.
- **A bug seen only in emulation, and a real one behind it.** The detail opened slightly scrolled in Chrome's phone emulation. On my phone it did not happen, but the investigation found a real bug: going back to a long list lost the user's place. After the fix I tried "Volver al listado" and it still went to the top: the agent had fixed only the browser's back button. Both now return to the same place ([ADR 0012](adr/0012-return-to-the-list-where-the-user-left-it.md)).
- **Tests that measured the wrong thing.** The new end-to-end test of that fix failed on the phone: Playwright scrolls an element again before clicking it, and the app was correctly restoring the position of the click, not the one the test had recorded. The test was fixed, not the app.
- **A model that was right and an interface that was silent.** Searching for "un móvil azul" or "un móvil de 8 GB" seemed to do nothing. Claude was right to return no filters, since the list only knows brand, model and price, but the list showed the whole catalogue without saying why. The model now also reports what it cannot filter, and the list says so ([ADR 0011](adr/0011-natural-language-search.md)).
- **The checklist found one more.** Going through the delivery checklist with the keyboard alone showed that adding to the cart dropped the focus to the start of the page, because the button was disabled while adding. It now stays focusable and ignores a second press instead.

## What I took from it

- The gates were worth their cost. Plans with explicit open decisions and proposed defaults made reviewing quick, and they are where most of my decisions were taken: TypeScript 6, Vercel, colour swatches, where each way back leads, and what the smart search may promise.
- Using the app beats reading the diff. The search box pushed above the title, the actions below the fold and the back link that lost the place all came from trying the app in the browser, not from the code review.
- Asking for evidence beats trusting fluent explanations. The best catches came from measurements, clean clones and real calls to the model, not from reading the code more carefully.
- The agent was most valuable on the work that is tedious to do well: checking versions, keeping every commit green, writing the ADRs while the context was fresh, and keeping the tests consistent across phases.

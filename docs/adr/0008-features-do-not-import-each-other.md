# 0008. Features do not import each other

- **Status:** Accepted
- **Date:** 2026-10-21

## Context

Adding a product to the cart is the first time two features meet: the product actions live in `products`, and the count and the cart API live in `cart`. [ADR 0002](0002-layered-feature-architecture.md) left the rules between features for when this happened.

## Decision

Features never import each other; pages compose them. The product actions report the chosen selection through an `onAdd` callback, and the detail page passes the `cart` action that adds it. ESLint enforces the rule with `import-x/no-restricted-paths`.

## Alternatives

- **The product actions importing the cart directly.** Less wiring, but `products` would depend on `cart`, and the next shared feature could create a cycle.
- **An event bus between features.** Decoupled, but the flow is harder to follow than a callback for a single interaction.

## Consequences

- Each feature can be tested and changed on its own.
- Pages hold the wiring between features, and every new feature needs its zones in the lint rule.

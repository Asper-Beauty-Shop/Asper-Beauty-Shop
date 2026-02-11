# Task definition & clarification guide

Use this guide to turn an idea into an actionable task that is easy to
implement, review, and verify.

## When to write this down

- Before starting work on anything larger than a small typo fix
- When handing work off to another contributor
- When you notice repeated back-and-forth in issues/PRs

## Task definition checklist

### Problem statement

- What is the user/business problem?
- Who is affected (persona, role, locale)?
- Where does it happen (route/page/component)?

### Scope

- In scope: what will change
- Out of scope: what will not change (to avoid scope creep)

### Constraints

- Performance, accessibility, SEO
- Security/privacy requirements (PII, tokens, data retention)
- Internationalization: English + Arabic (RTL) support
- Shopify/Supabase constraints (if applicable)

### Acceptance criteria (Definition of Done)

Write these as verifiable bullet points. Prefer “Given/When/Then” for
user-facing behavior.

Example:

- Given a user is in Arabic, when they open the cart, then the layout remains
  RTL and no elements overflow.
- When checkout is initiated, then the order is created exactly once and has a
  server-generated order number.

### UX/UI notes (optional)

- Screenshot/mockup (or a short Loom)
- Copy changes (English/Arabic), empty states, loading states
- Error states: what to show and how to recover

### Implementation notes (optional)

- Suggested approach and file locations
- Risks and mitigations
- Migration/rollout plan (feature flag, gradual rollout)

### Testing plan

- What you will test manually
- What should be covered by unit/integration/e2e tests (if present)
- Regression areas (cart, checkout, RTL, auth)

## PR description template

Paste into the PR description:

```md
## Summary

## Why

## What changed

## Acceptance criteria

- [ ]
- [ ]

## Testing

- [ ] Manual
- [ ] Automated

## Screenshots / recordings

## Notes / risks
```

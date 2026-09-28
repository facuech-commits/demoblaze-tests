---
name: cover-feature-with-tests
description: Closes Playwright coverage gaps for a Demoblaze feature (login, sign up, catalog, categories, product detail, cart, place order, contact, about us). Use when the user says "cover this feature", "add Playwright tests for X", "what isn't tested yet", "backfill tests for the cart", or names a Demoblaze screen and asks for automated coverage. Proposes a short list of gaps for approval, then adds verified tests to the right spec.
allowed-tools: Read, Glob, Grep, Bash, Agent, TodoWrite, AskUserQuestion
---

# Cover a feature with tests

The suite targets the public site https://www.demoblaze.com (a third-party app:
there is no application source code in this repo, only tests). Everything this
skill writes follows the existing conventions: page objects in `pages/`, test
data in `constants/`, specs in `tests/`, a single `chromium` Playwright project.

Three phases, three agents, one human approval between the first and the second.
The key idea: the agent that proposes gaps cannot write files, and the agent that
writes tests is not the one that judges them.

## Two modes

- **Targeted** (the user names a feature or screen): the scope is that surface as it behaves today on the live site.
- **Survey** (no target named): the scope is the whole site; the planner returns the top gaps ranked by regression value.

## Vocabulary

- **gap**: behavior that no test verifies.
- **type**: what kind of test a gap needs: **UI** (browser) or **API** (a call to `https://api.demoblaze.com`). One behavior may need both.
- **blocked**: a gap that cannot be tested reliably against the public site today (e.g. depends on state other people control). Reported, never faked.
- **oracle**: the source of truth an assertion compares against. See `references/assertions.md`.
- **append-only**: only new tests and new page object members are added; existing code is read, never rewritten.
- **unverified**: written but never run. Always said explicitly.

## Phase 1: Plan

Dispatch the `feature-test-planner` agent (read-only) with the mode and, in
targeted mode, the named surface.

Show the gap report **complete and unedited**, including the spec mapping:
a wrong mapping sends tests to the wrong file without anyone noticing.

## Phase 2: Approve

Ask with `AskUserQuestion`, one option per actionable gap, `multiSelect: true`.
Each option states the behavior, the type, the target spec and the oracle.
The gap with the highest regression value goes first. Wait for the answer.

If a type has no gaps (e.g. no API dimension), say so explicitly so it reads as
a decision, not an omission.

Show separately, without acting on them:
- **Existing tests that look broken or flaky**: a person fixes them.
- **Pre-existing rule violations** in the suite: listed as follow-up refactors.

## Phase 3: Write and verify

For each approved gap: dispatch `feature-test-author`, then `feature-test-verifier`
on what it wrote. Track progress with `TodoWrite`.

## Final summary

- Tests added per file, and whether each one is **verified** or **unverified**.
- **Blocked** gaps and what each one would need.
- Flagged existing tests and rule violations found.
- A proposed entry for the README "Selected Test Cases" section for each new
  test (same format: **Why?** / **Validations**). Propose it; do not edit the README
  unless the user asks.

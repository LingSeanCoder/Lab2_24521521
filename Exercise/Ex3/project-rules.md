# Project Rules — AI Agent Constitution (Lab 2 — Exercise 3)

> Mandate for any AI agent: parse this file BEFORE proposing any code
> change. Reject any proposal that violates a rule below.

---

## 1. Stack

- Vanilla ES6+ JavaScript. No framework, no library, no CDN.
- No TypeScript compiler — write plain JS, use JSDoc for types if
  needed. The slide's `type ViewState<T>` is a contract, not a file
  format.
- ES modules only.

---

## 2. Language

- `const` by default. `let` only when reassigned.
- `var` is forbidden.
- No `innerHTML`. Use `textContent` / `createTextNode`.
- No inline event handlers (`onclick="..."`).
- Keyboard events: `keydown` + `event.key`.

---

## 3. State Machine Rules (Ex3)

- State is a discriminated union — one shape at a time.
- Valid statuses: `IDLE | LOADING | SUCCESS | ERROR`.
- **No boolean flags** — `isLoading`, `hasError`, `isSuccess` are
  forbidden.
- Invalid transitions throw `Error`.
- Every state object has `status` as its discriminator.
- Retry from `SUCCESS` / `ERROR` goes back to `LOADING`.

---

## 4. Async Rules

- Use `async/await` with `try/catch` — never `.then()` chains for
  state updates.
- Guard against race conditions: if two fetches overlap, only the
  latest must commit state.
- On `LOADING`, previous data must not be visible.
- On `ERROR`, `data` must not exist on the state object.

---

## 5. Skeleton Rules

- Skeleton rendered only during `LOADING`.
- Skeleton is pure CSS — no JS animation loop.
- Shimmer animation duration between 1.2s and 2s.
- Respect `prefers-reduced-motion` — disable shimmer for users who
  opt out.
- Skeleton elements removed from DOM on any non-LOADING transition.

---

## 6. HTML Rules

- Semantic tags only. `#app` is the only `<div>`.
- One `<h1>` per document.
- CSP: `script-src 'self'`.
- Zero inline scripts.

---

## 7. CSS Rules

- Hex only in `:root`.
- Rules use `var(--token)` only.
- Mobile-first. No horizontal scroll at 375 px.
- WCAG 2.2 AA contrast ≥ 4.5:1.
- `:focus-visible` outline on every interactive element.

---

## 8. Git Rules

- Atomic commits. One commit = one artifact.
- CSS + JS in the same commit = 0 pts.
- Slide-mandated commit messages appear verbatim.
- Commit format: `<type>(<scope>): <imperative summary>`.

---

## 9. AI Collaboration

- One prompt = one file.
- Every prompt includes the contract.
- Verify each output with `grep` before commit.
- **Do not trust slide code samples blindly.** Lab 02 slide deck has
  documented defects. Deviation must be flagged with
  `// DEVIATION FROM SLIDE:` comment.
- Never claim code works if not tested in a browser.

---

## 10. Verification Gates

    grep -rn "\bvar\b" js/
    grep -rn "innerHTML" js/ index.html
    grep -rn "onclick=" index.html
    grep -rn "isLoading\|hasError\|isSuccess" js/

All must return empty.
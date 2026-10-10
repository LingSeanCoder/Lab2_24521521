
---

### `TASK_DECOMPOSITION.md`

```markdown
# Exercise 3 — Resilient State Machine — WBS

In-class sprint (35 minutes). Standalone (no import from Ex1 / Ex2).

---

## 1. Functional Slicing

| Slice | Sub-system | Responsibility |
|---|---|---|
| A | Render engine | Local VNode → DOM (createElement + renderToDOM) |
| B | Reactive hook | useState + renderApp |
| C | State machine | ViewState factory + transition validator |
| D | Skeleton UI | Animated CSS placeholder for LOADING state |
| E | DataFeed component | 4-state rendering + retry |
| F | Presentation | HTML mount + styling |

---

## 2. Contract-First Specification

### ViewState discriminated union

    { status: 'IDLE' }
    { status: 'LOADING' }
    { status: 'SUCCESS'; data: T }
    { status: 'ERROR';   error: string }

### Transition table

    IDLE    → LOADING
    LOADING → SUCCESS | ERROR
    SUCCESS → LOADING   (retry)
    ERROR   → LOADING   (retry)

### Invariants

- No boolean flags (`isLoading`, `hasError`).
- Every state object has `status` as discriminator.
- Only one state shape exists at a time.
- Skeleton DOM nodes must be removed on non-LOADING states.

---

## 3. Atomic Generation Plan

| # | Sub-task ID | Sub-task | Output | Commit |
|---|---|---|---|---|
| 1 | — | Docs + WBS | README, TASK_DECOMPOSITION, project-rules | `docs: define ex3 resilient state machine wbs and rules` |
| 2 | A-01 | Local render engine | js/render.js | `feat(core): add local vnode render engine for ex3` |
| 3 | B-01 | Reactive hook | js/reactive-engine.js | `feat(state): add local reactive useState engine` |
| 4 | C-01 | State machine | js/state-machine.js | `feat(state): implement viewstate machine with transitions` |
| 5 | D-01 | Skeleton CSS | css/skeleton.css | `feat(css): animated skeleton loader with shimmer` |
| 6 | E-01 | DataFeed component | js/app.js | `feat(ui): implement multi-state data component with skeleton feedback` |
| 7 | F-01 | Mount point | index.html | `feat(html): mount resilient state machine demo` |
| 8 | F-02 | Base styling | styles.css | `feat(css): base styling for state machine demo` |

**Slide-mandated commit (must appear exactly):**

    feat(ui): implement multi-state data component with skeleton feedback

Appears at row 6.

**Rule:** Never prompt AI with more than one sub-task at a time.

---

## 4. Independent Verification Plan

### Static checks

    grep -rn "\bvar\b" js/                    # empty
    grep -rn "innerHTML" js/ index.html       # empty
    grep -rn "onclick=" index.html            # empty
    grep -rn "isLoading\|hasError\|isSuccess" js/   # empty (no boolean flags)

### Runtime (DevTools)

| Check | Expected |
|---|---|
| Initial render | Shows `IDLE` placeholder + Load button |
| After click Load | Skeleton shimmer visible for ≥ 800 ms |
| After success | List rendered, no `.skeleton` in DOM |
| Forced error | ERROR text + Retry Connection button |
| Click Retry | Back to LOADING → success/error again |
| Rapid clicks | No duplicate fetch — state transitions idempotent |
| Console errors | none |
| `document.querySelector('.skeleton')` | null when not LOADING |

---

## 5. Live Defense Test Cases

| Test | Change | Files touched |
|---|---|---|
| A | Add `EMPTY` state (data returned empty array) | state-machine.js + app.js |
| B | Change skeleton duration | css/skeleton.css (1 line) |
| C | Add third retry attempt counter | app.js (1 line) |
| D | Force error message to specific string | app.js (1 line) |

Every fix touches one file because the state machine lives in one
module and the component reads it declaratively.

---

## 6. Anti-Patterns Banned

- No `isLoading = true` / `isLoading = false` flags.
- No `hasError` / `isSuccess` — replace with `status` checks.
- No rendering two states at once (e.g. skeleton + error).
- No `innerHTML` when rendering error strings.
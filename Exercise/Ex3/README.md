# Exercise 3 — Resilient State Machine & Skeleton Loader

In-class sprint (35 minutes). Build a data component with a strict
4-state lifecycle: `IDLE → LOADING → SUCCESS | ERROR`. Renders an
animated CSS skeleton during LOADING, data on SUCCESS, and a
human-readable error with a "Retry Connection" button on ERROR.

**Author:** Nguyễn Đình Sang

---

## Objective

Eliminate race conditions and inconsistent UIs during async data
operations by using a discriminated union state machine instead of
boolean flags.

---

## Deliverables

| Artifact | Purpose |
|---|---|
| `js/render.js` | Local VNode render engine (standalone) |
| `js/reactive-engine.js` | useState + renderApp (local copy) |
| `js/state-machine.js` | ViewState factory + guards |
| `js/app.js` | DataFeed component with 4-state rendering |
| `index.html` | Mount point |
| `styles.css` | Skeleton shimmer + error/retry styling |
| `TASK_DECOMPOSITION.md` | WBS |
| `project-rules.md` | AI agent constitution |

---

## Slide-Mandated Commit

    feat(ui): implement multi-state data component with skeleton feedback

---

## State Machine Contract

```js
// Discriminated union — exactly one shape active at a time
const ViewState = {
  IDLE:    () => ({ status: 'IDLE' }),
  LOADING: () => ({ status: 'LOADING' }),
  SUCCESS: (data) => ({ status: 'SUCCESS', data }),
  ERROR:   (error) => ({ status: 'ERROR', error: String(error) }),
};

const ALLOWED_TRANSITIONS = {
  IDLE:    ['LOADING'],
  LOADING: ['SUCCESS', 'ERROR'],
  SUCCESS: ['LOADING'],   // retry
  ERROR:   ['LOADING'],   // retry
};
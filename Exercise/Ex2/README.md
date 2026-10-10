# Exercise 2 — Reactive State Machine & Delegation Hub

In-class sprint (40 minutes). Builds on Exercise 1's VNode engine to add
a custom `useState` closure-based state machine and a root event
delegation hub, driving a real-time reactive Task Manager with dynamic
filter toggles.

**Author:** Nguyễn Đình Sang

**Prerequisite:** Exercise 1 — `js/mini-react/` (createElement,
renderToDOM).

---

## Objective

1. Build custom `useState` closure engine with stable hook order.
2. Build root Event Delegation hub — one root listener, no orphan
   listeners on child nodes.
3. Assemble a reactive Task Manager with dynamic filter toggles.

---

## Deliverables

| Artifact | Purpose |
|---|---|
| `js/reactive-engine.js` | stateStore + resetCursor + useState + delegation hub |
| `js/app.js` | Task Manager function component |
| `index.html` | Mount point (`#app`) |
| `styles.css` | Minimal semantic styling |
| `TASK_DECOMPOSITION.md` | WBS |
| `project-rules.md` | AI agent constitution |

---

## Slide-Mandated Commits

1. `feat(state): implement stateStore and resetCursor engine`
2. `feat(state): implement reactive useState dispatcher`
3. `feat(events): attach root event delegation listener`
4. `feat(ui): assemble reactive todo application`

---

## Contract-First Specification

### State container

    stateStore = {
      hooks: [],           // [{ value }]
      cursor: 0,           // index during render
      rootContainer: null,
      rootComponent: null,
      scheduled: false,
      handlers: new Map(), // vid -> { type, fn }
      vidCounter: 0,
    }

### useState

    function useState(initialValue) {
      const idx = stateStore.cursor;
      stateStore.cursor += 1;
      if (stateStore.hooks[idx] === undefined) {
        stateStore.hooks[idx] = { value: resolveInitial(initialValue) };
      }
      const hook = stateStore.hooks[idx];
      const setState = (next) => {
        const resolved = typeof next === 'function' ? next(hook.value) : next;
        if (Object.is(resolved, hook.value)) return;
        hook.value = resolved;
        scheduleRender();
      };
      return [hook.value, setState];
    }

### Event delegation

- ONE `addEventListener` per event type at the root container.
- Event handlers stored on VNode `props.on*`, NOT on real DOM.
- Every node with `on*` prop gets `dataset.vid`.
- Handler map: `vid -> { type, fn }`.
- Dispatch walks from `e.target` up to container, finds nearest `vid`.

---

## Known Slide Defects (Documented Deviations)

The Lab 02 slide deck contains 4 defects this exercise does not inherit:

| Slide page | Defect | Our fix |
|---|---|---|
| 18 | `useState` increments cursor before reading value → returns wrong slot | Read `hook.value` before incrementing |
| 20 | Event prop name mismatch: `onKeydown` vs `onKeyDown` | Use explicit `EVENT_PROP_MAP` |
| 12 | `renderToDOM` never sets `dataset.vid` → delegation fails | Set `el.dataset.vid` on every node with handler |
| 11 | `createElement` claims frozen but no `Object.freeze()` | Add `Object.freeze` in Ex1's factory |

Each file with a deviation has a `// DEVIATION FROM SLIDE:` comment.

---

## Verification

```bash
grep -rn "onKeydown\|__vnode" js/       # empty
grep -rn "\bvar\b\|innerHTML" js/        # empty
grep -rn "onclick=" index.html           # empty
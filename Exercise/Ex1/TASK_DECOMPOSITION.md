# Exercise 1 — Mini-React VNode — Task Decomposition (WBS)

In-class sprint. Zero div-soup, strict typeguard verification, live
DevTools audit.

---

## 1. Functional Slicing

| Slice | Sub-system | Responsibility |
|---|---|---|
| A | Element factory | Convert JS calls to POJO VNodes |
| B | Mounting engine | Convert VNodes to real DOM recursively |
| C | Demo entry | Instantiate a demo VNode and mount it |
| D | Styling | Minimal semantic styling |

---

## 2. Contract-First Specification

### VNode data contract

    {
      type: 'main' | 'header' | 'h1' | 'p' | 'button' | 'TEXT_ELEMENT' | Function,
      props: {
        id?: string,
        className?: string,
        role?: string,
        onClick?: Function,
        key?: string,
        children: VNode[],
        nodeValue?: string   // only for TEXT_ELEMENT
      }
    }

### API surface

- `createElement(type, config, ...children)` → VNode (frozen)
- `createTextElement(text)` → VNode of type `TEXT_ELEMENT`
- `renderToDOM(vnode)` → DOM Node
- `TEXT_ELEMENT` constant exported

### Invariants

- VNode is a plain object; no methods, no prototype chain.
- `children` is always an array (never undefined).
- Text children are always wrapped in `TEXT_ELEMENT` VNodes.
- Events attach via `addEventListener`, never inline `onclick=`.
- `innerHTML` is never called.

---

## 3. Atomic Generation Plan

| # | Sub-task ID | Sub-task | Output | Commit |
|---|---|---|---|---|
| 1 | — | Docs + WBS | README, TASK_DECOMPOSITION, project-rules | `docs: define mini-react wbs and project rules` |
| 2 | A-01 | createElement factory | js/mini-react/element.js | `feat(core): implement createElement factory` |
| 3 | B-01 | renderToDOM engine | js/mini-react/render.js | `feat(core): implement renderToDOM` |
| 4 | — | Barrel export | js/mini-react/index.js | `feat(core): add barrel export for mini-react` |
| 5 | C-01 | Mount point | index.html | `feat(html): mount point for mini-react demo` |
| 6 | C-02 | Demo + assertions | js/main.js | `feat(app): mount mini-react demo with xss assertion` |
| 7 | D-01 | Styling | styles.css | `feat(css): demo styling for mini-react` |

**Slide-mandated commits:**
- Commit `feat(core): implement createElement factory`
- Commit `feat(core): implement renderToDOM`

Both appear above at rows 2 and 3.

**Rule:** Never prompt AI with more than one sub-task at a time.

---

## 4. Independent Verification Plan

### Static checks

    grep -rn "\bvar\b" js/                       # empty
    grep -rn "innerHTML" js/ index.html          # empty
    grep -rn "onclick=\|onkeydown=" index.html   # empty
    grep -rn "keypress\|keyCode" js/             # empty

### Runtime checks (DevTools)

| Check | Expected |
|---|---|
| Console assertions | All pass |
| XSS payload `<img onerror=alert(1)>` in text | Renders as literal text |
| Elements panel | DOM matches VNode tree |
| `root.childNodes` after mount | 2 (header + button), no orphan |
| Semantic tags | `main`, `header`, `h1`, `p`, `button` present |
| `div` count | 1 (`#app` mount point only) |

---

## 5. Live Defense Test Cases

| Test | Change | Files touched |
|---|---|---|
| A | Add a new `<section>` wrapper | js/main.js (1 line) |
| B | Change button text | js/main.js (1 line) |
| C | Add `data-testid` to VNode props | element.js + render.js (2 lines) |
| D | Force XSS payload → must remain text | js/main.js (1 line) |

Each fix touches at most one file because the VNode contract lives in
one place and `renderToDOM` reads it generically.
# Exercise 1 — Mini-React VNode & Mounting Engine

In-class sprint: implement `createElement`, `createTextElement`, and
`renderToDOM` from scratch. Zero div-soup, strict typeguard verification,
live DevTools audit.

**Author:** Nguyễn Đình Sang

---

## Objective

Build a minimal Virtual DOM engine that:

1. Represents UI as plain objects (POJO VNodes).
2. Renders them to real DOM nodes recursively.
3. Prevents XSS via `textContent` / `createTextNode` only.
4. Produces semantic HTML output (no div-soup).

---

## Deliverables

| Artifact | Purpose |
|---|---|
| `js/mini-react/element.js` | `createElement` + `createTextElement` factories |
| `js/mini-react/render.js` | Recursive `renderToDOM` |
| `js/mini-react/index.js` | Barrel export |
| `index.html` | Mount point (`#app`) |
| `js/main.js` | Demo VNode + assertions |
| `styles.css` | Minimal styling |
| `TASK_DECOMPOSITION.md` | WBS |
| `project-rules.md` | AI constitution |

---

## VNode Contract

```js
{
  type: 'main',              // string tag OR function component
  props: {
    id: 'root-view',
    className: 'app',
    children: [ /* VNode[] */ ],
    // for text nodes:
    nodeValue: 'Hello'
  }
}
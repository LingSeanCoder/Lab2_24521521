# AI_FAILURE_AUDIT.md

Audit of 4 critical errors found in the instructor's slides for HW1: Production Enterprise Data-Grid.

---

## 1. `useState` Cursor Bug (Slide p.18)

**Problem:**
The slide increments the cursor index *before* reading the value at that index. This causes the current state to be skipped or lost entirely, leading to incorrect navigation behavior.

**Slide Code (Buggy):**
```js
cursor++;
const value = state[cursor];
```

**Fix:**
Snapshot the index first, then increment the cursor afterward.

**Correct Code:**
```js
const idx = cursor;
cursor = cursor + 1;
const value = state[idx];
```

**Rule:** Always read state using a stable snapshot before mutating any index or pointer.

---

## 2. Event Name Case Error (Slide p.20)

**Problem:**
The slide uses `onKeydown` instead of the correct DOM property `onkeydown` or the standard event name `keydown`. DOM event properties are lowercase (e.g., `onclick`, `onkeydown`), and React-style camelCase (`onKeyDown`) does not apply here. Using `onKeydown` silently fails to attach the handler.

**Slide Code (Buggy):**
```js
element.onKeydown = handler;
```

**Fix:**
Use the `EVENT_PROP_MAP` to normalize event names before assigning handlers.

**Correct Code:**
```js
const EVENT_PROP_MAP = {
  keydown: 'onkeydown',
  click: 'onclick',
  input: 'oninput'
};

const prop = EVENT_PROP_MAP['keydown']; // 'onkeydown'
element[prop] = handler;
```

**Rule:** Never hardcode event property names. Always resolve them through `EVENT_PROP_MAP`.

---

## 3. `renderToDOM` Missing `dataset.vid` (Slide p.12)

**Problem:**
The slide's `renderToDOM` function creates DOM elements but never assigns `dataset.vid`. Without `data-vid`, the Event Delegation (Shape B) mechanism cannot identify which virtual node was targeted, causing the entire delegation system to fail silently.

**Slide Code (Buggy):**
```js
function renderToDOM(vnode) {
  const el = document.createElement(vnode.tag);
  // ... no dataset.vid assignment
  return el;
}
```

**Fix:**
Always assign `el.dataset.vid` from the VNode's `vid` property.

**Correct Code:**
```js
function renderToDOM(vnode) {
  const el = document.createElement(vnode.tag);
  el.dataset.vid = vnode.vid; // mandatory for delegation
  return el;
}
```

**Rule:** Every rendered element that participates in event handling MUST carry `dataset.vid`.

---

## 4. Missing `Object.freeze` for Immutability (Slide p.11)

**Problem:**
The slide claims state must be immutable ("frozen") but never calls `Object.freeze()`. This allows accidental mutations to state objects, breaking the VNode diffing assumptions and causing subtle bugs.

**Slide Code (Buggy):**
```js
const state = { count: 0 };
// claims frozen, but no Object.freeze
```

**Fix:**
Explicitly freeze state objects after creation.

**Correct Code:**
```js
const state = Object.freeze({ count: 0 });
```

**Rule:** Any object declared as immutable in the architecture MUST be passed through `Object.freeze()` at creation time.
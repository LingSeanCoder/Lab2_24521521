# Project Rules — AI Agent Constitution (Lab 2 — Exercise 2)

> Mandate for any AI agent: parse this file BEFORE proposing any code
> change. Reject any proposal that violates a rule below.

---

## 1. Stack Constraints

- Vanilla ES6+ JavaScript. No framework, no library, no CDN.
- ES modules only (`import` / `export`). No bundler required for the
  demo.

---

## 2. Language Rules

- `const` by default. `let` only when reassigned.
- **`var` is forbidden.**
- No `innerHTML`. Use `textContent` or `createTextNode`.
- No inline event handlers (`onclick="..."`). All events via delegation.
- ES6+: arrow functions, template literals, destructuring, optional
  chaining.

---

## 3. State Rules (Ex2)

- Hook order is stable across renders — no conditional `useState`.
- `cursor` resets to 0 before every render.
- `stateStore.hooks.length` never changes after first render.
- No boolean flags (`isLoading`, `isSuccess`) as a substitute for a
  state machine.
- State setters bail out early if the value is unchanged
  (`Object.is` check).

---

## 4. Event Rules (Ex2)

- **ONE** `addEventListener` per event type on the root container.
- **ZERO** `addEventListener` on child nodes.
- VNode event props use W3C camelCase: `onClick`, `onKeyDown`,
  `onInput`, `onChange`, `onFocus`, `onBlur`, `onSubmit`.
- Mapping event type → prop name is explicit (`EVENT_PROP_MAP`), never
  string transformation.
- Every node with `on*` prop carries `dataset.vid`.
- Dispatch walks from `e.target` up to the container.

---

## 5. VNode Rules

- VNode is a POJO: `{ type, props: { children: [] } }`.
- Text nodes normalize to `{ type: 'TEXT_ELEMENT', props: { nodeValue } }`.
- VNodes are frozen (`Object.freeze`).
- No DOM nodes in the VNode tree — only plain data.

---

## 6. HTML Rules

- Div-soup banned. Semantic tags only: `main`, `header`, `section`,
  `h1`–`h6`, `p`, `button`, `ul`, `li`.
- The only `<div>` allowed is `#app` mount point.
- Exactly one `<h1>` per document.
- CSP: `script-src 'self'`. Zero inline scripts.

---

## 7. CSS Rules

- Hex only in `:root` of `styles.css` (or `tokens.css` if present).
- All rules use `var(--token)` only.
- Mobile-first, no horizontal scroll at 375px.
- WCAG 2.2 AA contrast ≥ 4.5:1.
- `:focus-visible` outline on every interactive element.

---

## 8. Git Rules

- **Atomic commits only.** One commit = one artifact.
- **CSS + JS in the same commit = 0 pts.**
- Slide-mandated commit messages must appear verbatim.
- Commit message format: `<type>(<scope>): <imperative summary>`.

---

## 9. AI Collaboration Rules

- One prompt = one file or one module.
- Every prompt includes the contract (owns / must not do).
- Verify each output with `grep` before commit.
- **Do not trust slide code samples blindly.** Lab 02 slide deck has 4
  documented defects (see README). Each fix in code must carry a
  `// DEVIATION FROM SLIDE:` comment.
- Never claim code works if it has not been tested in a browser.

---

## 10. Verification Gates (before each commit)

    grep -rn "\bvar\b" js/                     # empty
    grep -rn "innerHTML" js/ index.html        # empty
    grep -rn "onclick=" index.html             # empty
    grep -rn "onKeydown\|__vnode" js/          # empty
    grep -rn "button.*addEventListener" js/    # empty

If any check fails → re-prompt the AI. Never hand-patch a violation.
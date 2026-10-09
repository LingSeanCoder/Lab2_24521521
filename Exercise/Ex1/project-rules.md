# Project Rules — AI Agent Constitution (Lab 2)

> Parse this file BEFORE proposing any code change. Reject any
> proposal that violates a rule below.

---

## 1. Stack

- Vanilla ES6+ JavaScript. No framework, no library, no CDN.
- ES modules only (`import` / `export`), no bundler required for the
  demo, but Vite/ESBuild is allowed if a build step is needed.

---

## 2. Language

- `const` by default. `let` only when reassigned.
- **`var` is forbidden.**
- No `innerHTML`. Use `textContent`, `createTextNode`, or DOM APIs.
- No inline event handlers (`onclick="..."`). Use `addEventListener`.
- Keyboard events: `keydown` + `event.key`. **`keypress` and
  `event.keyCode` are forbidden.**

---

## 3. VNode Rules (Lab 2)

- VNode is a **POJO**: `{ type, props: { children: [] } }`.
- `type` is a tag name string, `TEXT_ELEMENT`, or a function component.
- Text nodes normalize to `{ type: 'TEXT_ELEMENT', props: { nodeValue } }`.
- VNodes are immutable — `Object.freeze` on creation.
- No DOM nodes in the VNode tree — only plain data.
- No `EventTarget` methods stored on VNodes.

---

## 4. HTML Rules

- **Div-soup banned.** Use semantic tags: `<main>`, `<header>`,
  `<section>`, `<article>`, `<h1>`–`<h6>`, `<p>`, `<button>`.
- The only `<div>` allowed is the VDOM root mount point (`#app`).
- Exactly one `<h1>` per document.
- CSP: `script-src 'self'`. Zero inline scripts.

---

## 5. Security

- All user-derived strings render via `document.createTextNode`.
- `innerHTML` is never called, even for "trusted" content.
- XSS payloads must render as literal text.
- Verify by submitting `<img onerror=alert(1)>` and asserting no
  `<img>` element appears in the DOM.

---

## 6. Git

- **Atomic commits only.** One commit = one artifact.
- **CSS + JS in the same commit = 0 pts.**
- Commit message format: `<type>(<scope>): <imperative summary>`.
- Types: `docs`, `feat`, `fix`, `perf`, `refactor`, `chore`.

---

## 7. AI Collaboration

- One prompt = one file or one module.
- Every prompt includes the contract (owns / must not do).
- Verify each output with `grep` before commit.
- Never prompt AI with more than one sub-task at a time.

---

## 8. Verification Gates

    grep -rn "\bvar\b" js/
    grep -rn "innerHTML" js/ index.html
    grep -rn "onclick=\|onkeydown=" index.html
    grep -rn "keypress\|keyCode" js/

All must return empty.
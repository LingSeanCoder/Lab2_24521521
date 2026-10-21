# Project Iron Rules (HW2: Concurrent FIFO Audio Visualizer Queue Engine)

These rules are absolute and non-negotiable for the entire project lifecycle.

## 1. Tech Stack & Language
*   **Allowed**: Vanilla HTML5, CSS3, and ES6+ JavaScript (Modules).
*   **Forbidden**: No frameworks (React, Vue, Angular, etc.), no CDNs (no external libraries or fonts), and no transpilers/bundlers (No Babel, Webpack, Vite).

## 2. Syntax & Variables
*   **Allowed**: Only `const` and `let`.
*   **Forbidden**: `var` is strictly FORBIDDEN under any circumstances.

## 3. DOM Manipulation & Events
*   **Forbidden**: `innerHTML` is strictly FORBIDDEN for injecting user data or mock data (use `textContent` or `document.createElement`).
*   **Forbidden**: Inline event handlers (e.g., `onclick="..."`, `onkeydown="..."`) are strictly FORBIDDEN.
*   **Mandatory**: Use Event Delegation exclusively. Events must be handled at the container level using `event.target.closest()` and data attributes for identification.

## 4. Async, Concurrency & Memory Management
*   **Mandatory**: Use `async/await` and native `Promise` for all asynchronous operations.
*   **Mandatory**: Use `AbortController` to cancel in-flight fetch requests and audio decoding to prevent race conditions.
*   **Mandatory**: Explicitly call `disconnect()` on all `AudioBufferSourceNode` instances upon completion or abortion to prevent memory leaks.

## 5. Git & Version Control
*   **Mandatory**: Atomic commits. Each commit must represent one single logical change.
*   **Forbidden**: Bundling CSS changes and JS changes in the same commit is strictly FORBIDDEN. (e.g., You must commit `style: ...` separately from `feat: ...`).
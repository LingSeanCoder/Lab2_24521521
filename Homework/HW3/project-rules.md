# Project Iron Rules (HW3: High-Concurrency Flash-Sale E-Commerce Engine)

These rules are absolute and non-negotiable for the entire project lifecycle.

## 1. Tech Stack & Syntax
*   **Allowed**: Vanilla HTML5, CSS3, and ES6+ JavaScript (Modules).
*   **Forbidden**: No frameworks (React, Vue, Angular, etc.), no CDNs, and no transpilers/bundlers (No Babel, Webpack, Vite).
*   **Allowed**: Only `const` and `let`.
*   **Forbidden**: `var` is strictly FORBIDDEN under any circumstances.

## 2. DOM Manipulation & Events
*   **Forbidden**: `innerHTML` is strictly FORBIDDEN for injecting user data or dynamic content (use `textContent` or `document.createElement`).
*   **Forbidden**: Inline event handlers (e.g., `onclick="..."`, `onkeydown="..."`) are strictly FORBIDDEN.
*   **Mandatory**: Use Event Delegation exclusively. Events must be handled at the container level using `event.target.closest()` and data attributes for identification.

## 3. Timer Implementation (Zero-Drift)
*   **Mandatory**: Use `requestAnimationFrame` (rAF) combined with `Date.now()` delta calculations for all countdown timers.
*   **Forbidden**: `setInterval` is strictly FORBIDDEN for countdown and display logic due to browser throttling and drift.

## 4. Concurrency & State Management
*   **Mandatory**: Implement a strict Finite State Machine for inventory (e.g., `AVAILABLE` -> `LOCKED` -> `SOLD_OUT`).
*   **Mandatory**: State transitions must be handled synchronously to prevent race conditions and overselling.

## 5. Memory Management & Cleanup
*   **Mandatory**: Explicitly call `cancelAnimationFrame` to stop any active rAF loops when a timer reaches zero or when the component/item is destroyed.
*   **Mandatory**: Clear any pending `setTimeout` (e.g., for lock expiry) when an item is unmounted or manually aborted.

## 6. Git & Version Control
*   **Mandatory**: Atomic commits. Each commit must represent one single logical change.
*   **Forbidden**: Bundling CSS changes and JS changes in the same commit is strictly FORBIDDEN. (e.g., You must commit `style: ...` separately from `feat: ...`).